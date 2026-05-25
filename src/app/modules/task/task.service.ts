import { Prisma } from '@prisma/client';
import AppError from '../../errors/appError';
import prisma from '../../utils/prisma';
import { ActivityServices } from '../activity/activity.service';

import { sendEmail } from '../../utils/email'; // Add this import at the top

const createTaskIntoDB = async (payload: any) => {
	// 1. Verify the associated sprint exists
	const sprint = await prisma.sprint.findUnique({
		where: { id: payload.sprintId },
		include: { project: true }, // Grab the project name for the email!
	});

	if (!sprint) {
		throw new AppError(404, 'Sprint not found');
	}

	// 2. Separate assigneeIds from the rest of the task data
	const { assigneeIds, ...taskData } = payload;

	// 3. Create the task and connect the assignees
	const result = await prisma.task.create({
		data: {
			...taskData,
			assignees:
				assigneeIds && assigneeIds.length > 0
					? {
							connect: assigneeIds.map((id: string) => ({ id })),
						}
					: undefined,
		},
		include: {
			assignees: {
				select: {
					id: true,
					name: true,
					email: true, // Crucial: We need the emails now!
					role: true,
				},
			},
		},
	});

	// 4. THE MAGIC HOOK: Send notification emails to assignees
	if (result.assignees && result.assignees.length > 0) {
		result.assignees.forEach(async (assignee) => {
			const emailSubject = `New Task Assigned: ${result.title}`;
			const emailBody = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Hello ${assignee.name},</h2>
          <p>You have been assigned a new task in the <strong>${sprint.project.title}</strong> project.</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">
            <h3>${result.title}</h3>
            <p><strong>Priority:</strong> ${result.priority}</p>
            <p><strong>Estimate:</strong> ${result.estimateHours || 'Not set'} hours</p>
            <p>${result.description || 'No description provided.'}</p>
          </div>
          <p style="margin-top: 20px;">Please check your dashboard for more details.</p>
        </div>
      `;

			// Fire and forget!
			await sendEmail(assignee.email, emailSubject, emailBody);
		});
	}

	return result;
};

const getAllTasksFromDB = async (filters: any, options: any) => {
	// 1. Added projectId and assigneeId to the destructured filters
	const { searchTerm, sprintId, status, priority, projectId, assigneeId } = filters;
	const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

	// Calculate pagination math
	const skip = (Number(page) - 1) * Number(limit);
	const take = Number(limit);

	// Build the dynamic Prisma query
	const andConditions: Prisma.TaskWhereInput[] = [];

	// Search Term (looks for text in title or description)
	if (searchTerm) {
		andConditions.push({
			OR: [
				{ title: { contains: searchTerm, mode: 'insensitive' } },
				{ description: { contains: searchTerm, mode: 'insensitive' } },
			],
		});
	}

	// Exact Filters
	if (sprintId) andConditions.push({ sprintId });
	if (status) andConditions.push({ status });
	if (priority) andConditions.push({ priority });

	// --- NEW: Project Filter ---
	// Because Tasks don't have a direct projectId, we filter by the Sprint's projectId
	if (projectId) {
		andConditions.push({
			sprint: {
				projectId: projectId,
			},
		});
	}

	// --- NEW: Assignee Filter ---
	// Because Assignees is a Many-to-Many array, we use the "some" operator
	if (assigneeId) {
		andConditions.push({
			assignees: {
				some: {
					id: assigneeId,
				},
			},
		});
	}

	// Combine conditions
	const whereConditions: Prisma.TaskWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

	// Execute the query
	const result = await prisma.task.findMany({
		where: whereConditions,
		skip,
		take,
		orderBy: {
			[sortBy]: sortOrder,
		},
		include: {
			assignees: {
				select: { id: true, name: true },
			},
			// Tip: Ensure you include the sprint (and its project) so your
			// frontend table can display the Sprint and Project names!
			sprint: {
				include: {
					project: true,
				},
			},
		},
	});

	// Count total documents for frontend pagination math
	const total = await prisma.task.count({
		where: whereConditions,
	});

	return {
		meta: {
			page: Number(page),
			limit: Number(limit),
			total,
		},
		data: result,
	};
};

const deleteTaskFromDB = async (id: string) => {
	// 1. Verify the task exists
	const existingTask = await prisma.task.findUnique({
		where: { id },
	});

	if (!existingTask) {
		throw new AppError(404, 'Task not found');
	}

	// 2. Delete the task
	const result = await prisma.task.delete({
		where: { id },
	});

	return result;
};

const updateTaskInDB = async (id: string, userId: string, userRole: string, payload: any) => {
	// 1. Find the existing task
	const existingTask = await prisma.task.findUnique({
		where: { id },
		include: { sprint: true },
	});

	if (!existingTask) throw new AppError(404, 'Task not found');

	// 2. Enforce Role-Based Access Control (RBAC)
	if (existingTask.status === 'REVIEW_REQUIRED' && payload.status === 'DONE' && userRole === 'MEMBER') {
		throw new AppError(403, 'Only Managers or Admins can approve a task from Review Required to Done.');
	}

	// 3. Destructure relational fields (Note: projectId is removed because it's not on the Task model)
	const { sprintId, assigneeIds, projectId, ...taskData } = payload;

	// 4. Prepare the clean Prisma update object
	const updateData: any = {
		...taskData,
	};

	// Handle Sprint relation
	if (sprintId) {
		updateData.sprint = { connect: { id: sprintId } };
	} else if (sprintId === null) {
		updateData.sprint = { disconnect: true };
	}

	// Handle Assignees
	if (assigneeIds && Array.isArray(assigneeIds)) {
		updateData.assignees = {
			set: assigneeIds.map((assigneeId: string) => ({ id: assigneeId })),
		};
	}

	// 5. Execute the update
	const result = await prisma.task.update({
		where: { id },
		data: updateData,
		// Include ONLY relations that actually exist on the Task model
		include: {
			assignees: {
				select: { id: true, name: true, email: true, role: true },
			},
			sprint: true, // Include sprint so we can access its projectId for the logger below
		},
	});

	// 6. Activity Logging
	if (payload.status && payload.status !== existingTask.status) {
		// Because we included 'sprint: true' in the update result above,
		// we can safely pull the projectId from the newly updated sprint relation.
		// If the task has no sprint, it falls back to the existing task's sprint.
		const targetProjectId = result.sprint?.projectId || existingTask.sprint?.projectId;

		if (targetProjectId) {
			await ActivityServices.logActivity(
				targetProjectId,
				userId,
				'STATUS_CHANGED',
				`Task "${existingTask.title}" moved from ${existingTask.status} to ${payload.status}`,
			);
		}
	}

	return result;
};

// Add this below your existing task functions
const logTimeIntoDB = async (
	taskId: string,
	userId: string,
	payload: { hoursLogged: number; description?: string },
) => {
	// 1. Verify task exists
	const task = await prisma.task.findUnique({
		where: { id: taskId },
	});

	if (!task) {
		throw new AppError(404, 'Task not found');
	}

	// 2. Create the time log
	const result = await prisma.timeLog.create({
		data: {
			taskId,
			userId,
			hoursLogged: payload.hoursLogged,
			description: payload.description,
		},
		include: {
			user: { select: { name: true } }, // Return the user's name for the frontend
		},
	});

	return result;
};

const getSingleTaskFromDB = async (id: string) => {
	const result = await prisma.task.findUnique({
		where: { id },
		include: {
			assignees: {
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
				},
			},
			sprint: {
				include: {
					project: true, // Brings in the project data via the sprint
				},
			},
		},
	});

	if (!result) {
		throw new AppError(404, 'Task not found');
	}

	return result;
};

const getTimeLogsForTask = async (taskId: string) => {
	const logs = await prisma.timeLog.findMany({
		where: { taskId },
		include: {
			user: {
				select: { id: true, name: true },
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	});
	return logs;
};

export const TaskServices = {
	logTimeIntoDB,
	createTaskIntoDB,
	getAllTasksFromDB,
	updateTaskInDB,
	deleteTaskFromDB,
	getSingleTaskFromDB,
	getTimeLogsForTask,
};
