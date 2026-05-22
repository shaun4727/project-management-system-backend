import type { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { CommentServices } from './comment.service';

const createComment = catchAsync(async (req: Request, res: Response) => {
	// Extract the logged-in user's ID securely from the auth token
	const userId = req.user.id;

	const result = await CommentServices.createCommentIntoDB(userId, req.body);

	res.status(201).json({
		success: true,
		message: 'Comment created successfully',
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
	createComment,
	getTaskComments,
};
