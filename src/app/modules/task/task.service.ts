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
	const { searchTerm, sprintId, status, priority } = filters;
	const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

	// Calculate pagination math
	const skip = (Number(page) - 1) * Number(limit);
	const take = Number(limit);

	// Build the dynamic Prisma query
	const andConditions: Prisma.TaskWhereInput[] = [];

	// 1. Search Term (looks for text in title or description)
	if (searchTerm) {
		andConditions.push({
			OR: [
				{ title: { contains: searchTerm, mode: 'insensitive' } },
				{ description: { contains: searchTerm, mode: 'insensitive' } },
			],
		});
	}

	// 2. Exact Filters
	if (sprintId) andConditions.push({ sprintId });
	if (status) andConditions.push({ status });
	if (priority) andConditions.push({ priority });

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

// Inside your existing updateTaskInDB function (you'll need to pass userId from the controller):
const updateTaskInDB = async (id: string, userId: string, payload: any) => {
	const existingTask = await prisma.task.findUnique({
		where: { id },
		include: { sprint: true }, // Need the sprint to get the projectId!
	});

	if (!existingTask) throw new AppError(404, 'Task not found');

	const result = await prisma.task.update({
		where: { id },
		data: payload,
	});

	// THE MAGIC HOOK: Check if the status changed, and log it!
	if (payload.status && payload.status !== existingTask.status) {
		await ActivityServices.logActivity(
			existingTask.sprint.projectId,
			userId,
			'STATUS_CHANGED',
			`Task "${existingTask.title}" moved from ${existingTask.status} to ${payload.status}`,
		);
	}

	return result;
};

// Update the export block
export const TaskServices = {
	createTaskIntoDB,
	getAllTasksFromDB,
	updateTaskInDB,
	deleteTaskFromDB,
};
