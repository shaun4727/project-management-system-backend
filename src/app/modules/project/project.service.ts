import { Prisma, Project, Status } from '@prisma/client';
import { Parser } from 'json2csv';
import AppError from '../../errors/appError';
import prisma from '../../utils/prisma';

const createProjectIntoDB = async (payload: any): Promise<Project> => {
	const result = await prisma.project.create({
		data: payload,
	});
	return result;
};

const getAllProjectsFromDB = async (page: number, limit: number, statusFilter?: string) => {
	// 1. Calculate Pagination Skip
	const skip = (page - 1) * limit;

	// 2. Build the Filtering Clause
	const where: Prisma.ProjectWhereInput = {};
	if (statusFilter && statusFilter !== 'ALL_PROJECTS') {
		// Ensure the string matches the Prisma Enum (e.g., 'ACTIVE')
		where.status = statusFilter as Status;
	}

	// 3. Run two queries in parallel: Count (for pagination) and Data
	const [total, rawProjects] = await Promise.all([
		prisma.project.count({ where }),
		prisma.project.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: 'desc' },
			// Include nested relations to calculate progress and team
			include: {
				sprints: {
					include: {
						tasks: {
							include: {
								assignees: {
									select: { id: true, name: true },
								},
							},
						},
					},
				},
			},
		}),
	]);

	// 4. Format the raw data to match the Frontend's exact requirements
	const formattedProjects = rawProjects.map((project) => {
		let tasksTotal = 0;
		let tasksCompleted = 0;
		const uniqueTeamMembers = new Map();

		// Loop through sprints and tasks to calculate metrics
		project.sprints.forEach((sprint) => {
			tasksTotal += sprint.tasks.length;
			sprint.tasks.forEach((task) => {
				if (task.status === 'DONE') {
					tasksCompleted++;
				}
				// Collect unique assignees for the team avatar stack
				task.assignees.forEach((assignee) => {
					uniqueTeamMembers.set(assignee.id, assignee);
				});
			});
		});

		// Calculate percentage (avoid division by zero)
		const progress = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;
		const teamArray = Array.from(uniqueTeamMembers.values());

		return {
			id: project.id,
			title: project.title,
			client: project.client,
			description: project.description,
			status: project.status, // PLANNED, ACTIVE, COMPLETED, ARCHIVED
			progress,
			tasksTotal,
			tasksCompleted,
			startDate: project.startDate.toISOString().split('T')[0],
			endDate: project.endDate.toISOString().split('T')[0],
			budget: project.budget || 0,
			team: teamArray.slice(0, 3), // Grab up to 3 people for avatars
			extraTeamCount: teamArray.length > 3 ? teamArray.length - 3 : null,
		};
	});

	// 5. Return the exact shape the Next.js Server Action expects
	return {
		meta: {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		},
		projects: formattedProjects,
	};
};

// Add this below getAllProjectsFromDB
const getSingleProjectFromDB = async (id: string) => {
	const result = await prisma.project.findUnique({
		where: { id },
		include: {
			sprints: {
				orderBy: { sprintNumber: 'asc' }, // Keep sprints in chronological order
				include: {
					tasks: {
						orderBy: { createdAt: 'desc' }, // Newest tasks first
						include: {
							assignees: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					},
				},
			},
		},
	});

	if (!result) {
		throw new AppError(404, 'Project not found');
	}

	return result;
};

const updateProjectInDB = async (id: string, payload: any) => {
	// 1. Verify the project exists
	const existingProject = await prisma.project.findUnique({
		where: { id },
	});

	if (!existingProject) {
		throw new AppError(404, 'Project not found');
	}

	// 2. Update the project
	const result = await prisma.project.update({
		where: { id },
		data: payload,
	});

	return result;
};

const deleteProjectFromDB = async (id: string) => {
	// 1. Verify the project exists
	const existingProject = await prisma.project.findUnique({
		where: { id },
	});

	if (!existingProject) {
		throw new AppError(404, 'Project not found');
	}

	// 2. Delete the project (This cascades to sprints and tasks!)
	const result = await prisma.project.delete({
		where: { id },
	});

	return result;
};

const getProjectAnalyticsFromDB = async (id: string) => {
	// 1. Verify the project exists
	const project = await prisma.project.findUnique({
		where: { id },
	});

	if (!project) {
		throw new AppError(404, 'Project not found');
	}

	// 2. Ask PostgreSQL to group and count tasks by status
	const taskStats = await prisma.task.groupBy({
		by: ['status'],
		where: {
			sprint: {
				projectId: id, // Only include tasks that belong to sprints in THIS project
			},
		},
		_count: {
			id: true, // Count the number of task IDs per status
		},
	});

	// 3. Format the raw database data into a clean object for the frontend
	let totalTasks = 0;
	let completedTasks = 0;
	const statusCounts: Record<string, number> = {
		TODO: 0,
		IN_PROGRESS: 0,
		REVIEW_REQUIRED: 0,
		DONE: 0,
	};

	taskStats.forEach((stat) => {
		const count = stat._count.id;
		statusCounts[stat.status] = count;
		totalTasks += count;

		if (stat.status === 'DONE') {
			completedTasks += count;
		}
	});

	// Calculate the completion percentage (avoid dividing by zero)
	const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

	const timeLogStats = await prisma.timeLog.aggregate({
		where: {
			task: {
				sprint: { projectId: id },
			},
		},
		_sum: {
			hoursLogged: true,
		},
	});

	const totalHoursLogged = timeLogStats._sum.hoursLogged || 0;
	return {
		totalTasks,
		completionPercentage,
		statusCounts,
		totalHoursLogged, // <-- Return it here!
	};
};

const exportProjectTasksToCSV = async (projectId: string) => {
	// 1. Verify the project exists and fetch all its tasks
	const project = await prisma.project.findUnique({
		where: { id: projectId },
		include: {
			sprints: {
				include: {
					tasks: {
						include: {
							assignees: { select: { name: true } },
						},
					},
				},
			},
		},
	});

	if (!project) {
		throw new AppError(404, 'Project not found');
	}

	// 2. Flatten the nested relational data into a simple array of objects
	const flattenedTasks: any[] = [];

	project.sprints.forEach((sprint) => {
		sprint.tasks.forEach((task) => {
			flattenedTasks.push({
				'Task ID': task.id,
				Title: task.title,
				Sprint: sprint.title,
				Status: task.status,
				Priority: task.priority,
				'Estimate (Hours)': task.estimateHours || 0,
				Assignees: task.assignees.map((a) => a.name).join(', ') || 'Unassigned',
				'Created At': task.createdAt.toISOString().split('T')[0], // YYYY-MM-DD
			});
		});
	});

	// 3. Handle the edge case of an empty project
	if (flattenedTasks.length === 0) {
		throw new AppError(400, 'No tasks found in this project to export');
	}

	// 4. Convert the JSON array to a CSV string
	const json2csvParser = new Parser();
	const csvString = json2csvParser.parse(flattenedTasks);

	return {
		projectName: project.title.replace(/\s+/g, '_').toLowerCase(),
		csvString,
	};
};

export const ProjectServices = {
	createProjectIntoDB,
	getAllProjectsFromDB,
	getSingleProjectFromDB,
	updateProjectInDB,
	deleteProjectFromDB,
	getProjectAnalyticsFromDB,
	exportProjectTasksToCSV,
};
