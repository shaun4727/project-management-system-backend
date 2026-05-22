import AppError from '../../errors/appError';
import prisma from '../../utils/prisma';

const createTaskIntoDB = async (payload: any) => {
	// 1. Verify the associated sprint exists
	const sprint = await prisma.sprint.findUnique({
		where: { id: payload.sprintId },
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
		// Include the assigned users in the response so the frontend can display them!
		include: {
			assignees: {
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
				},
			},
		},
	});

	return result;
};

const getAllTasksFromDB = async (sprintId?: string) => {
	const result = await prisma.task.findMany({
		where: sprintId ? { sprintId } : undefined,
		include: {
			assignees: {
				select: { id: true, name: true },
			},
		},
		orderBy: { createdAt: 'desc' },
	});

	return result;
};

// Add this below your existing getAllTasksFromDB function
const updateTaskInDB = async (id: string, payload: any) => {
	// 1. Verify the task exists
	const existingTask = await prisma.task.findUnique({
		where: { id },
	});

	if (!existingTask) {
		throw new AppError(404, 'Task not found');
	}

	// 2. Separate assigneeIds from the rest of the payload
	const { assigneeIds, ...taskData } = payload;

	// 3. Update the task
	const result = await prisma.task.update({
		where: { id },
		data: {
			...taskData,
			...(assigneeIds && {
				assignees: {
					set: assigneeIds.map((assigneeId: string) => ({ id: assigneeId })),
				},
			}),
		},
		include: {
			assignees: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	});

	return result;
};

// Update the export to include the new service
export const TaskServices = {
	createTaskIntoDB,
	getAllTasksFromDB,
	updateTaskInDB, // <-- Added here
};
