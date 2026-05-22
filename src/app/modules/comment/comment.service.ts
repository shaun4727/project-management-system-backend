import AppError from '../../errors/appError';
import prisma from '../../utils/prisma';

const createCommentIntoDB = async (userId: string, payload: { taskId: string; content: string }) => {
	// 1. Verify the task exists
	const task = await prisma.task.findUnique({
		where: { id: payload.taskId },
	});

	if (!task) {
		throw new AppError(404, 'Task not found');
	}

	// 2. Create the comment using the authenticated user's ID
	const result = await prisma.comment.create({
		data: {
			content: payload.content,
			taskId: payload.taskId,
			authorId: userId,
		},
		include: {
			author: {
				select: {
					id: true,
					name: true,
					role: true, // Helpful for the UI to show "Admin" badges next to comments
				},
			},
		},
	});

	return result;
};

const getTaskCommentsFromDB = async (taskId: string) => {
	const result = await prisma.comment.findMany({
		where: { taskId },
		orderBy: { createdAt: 'desc' }, // Newest comments first
		include: {
			author: {
				select: { id: true, name: true },
			},
		},
	});

	return result;
};

export const CommentServices = {
	createCommentIntoDB,
	getTaskCommentsFromDB,
};
