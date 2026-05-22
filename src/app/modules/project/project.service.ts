import { Project } from '@prisma/client';
import AppError from '../../errors/appError';
import prisma from '../../utils/prisma';

const createProjectIntoDB = async (payload: any): Promise<Project> => {
	const result = await prisma.project.create({
		data: payload,
	});
	return result;
};

const getAllProjectsFromDB = async (): Promise<Project[]> => {
	const result = await prisma.project.findMany({
		orderBy: { createdAt: 'desc' }, // Newest projects first
	});
	return result;
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

	return {
		totalTasks,
		completionPercentage,
		statusCounts,
	};
};

export const ProjectServices = {
	createProjectIntoDB,
	getAllProjectsFromDB,
	getSingleProjectFromDB,
	updateProjectInDB,
	deleteProjectFromDB,
	getProjectAnalyticsFromDB,
};
