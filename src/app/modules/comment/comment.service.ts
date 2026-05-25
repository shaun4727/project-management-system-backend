import AppError from '../../errors/appError';
import prisma from '../../utils/prisma';

// Add this to your task.service.ts
const addCommentToTask = async (taskId: string, userId: string, content: string) => {
	// Verify task exists
	const task = await prisma.task.findUnique({ where: { id: taskId } });
	if (!task) throw new AppError(404, 'Task not found');

	// Create the comment
	const comment = await prisma.comment.create({
		data: {
			content,
			taskId,
			authorId: userId,
		},
		// Include the user so the frontend immediately gets their name for the UI
		include: {
			author: {
				select: { id: true, name: true },
			},
		},
	});

	return comment;
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
	addCommentToTask,
	getTaskCommentsFromDB,
};
