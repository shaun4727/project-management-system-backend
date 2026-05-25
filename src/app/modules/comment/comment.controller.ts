import type { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { CommentServices } from './comment.service';

const addComment = catchAsync(async (req: Request, res: Response) => {
	const { id: taskId } = req.params;
	const { content } = req.body;

	// Assuming your auth middleware puts the user object on req.user
	const userId = (req as any).user.id;

	const result = await CommentServices.addCommentToTask(taskId as string, userId, content);

	res.status(201).json({
		success: true,
		message: 'Comment added successfully',
		data: result,
	});
});

const getTaskComments = catchAsync(async (req: Request, res: Response) => {
	// Extract the taskId from the URL parameters
	const { taskId } = req.params;

	const result = await CommentServices.getTaskCommentsFromDB(taskId as string);

	res.status(200).json({
		success: true,
		message: 'Comments retrieved successfully',
		data: result,
	});
});

export const CommentControllers = {
	addComment,
	getTaskComments,
};
