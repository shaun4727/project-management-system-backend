import type { Request, Response } from 'express';
import AppError from '../../errors/appError';
import catchAsync from '../../utils/catchAsync';
import { AttachmentServices } from './attachment.service';

const uploadAttachment = catchAsync(async (req: Request, res: Response) => {
	const { taskId } = req.body;
	const file = req.file;

	if (!file) {
		throw new AppError(400, 'Please provide a file to upload');
	}

	if (!taskId) {
		throw new AppError(400, 'Task ID is required');
	}

	const result = await AttachmentServices.createAttachmentIntoDB(taskId, file);

	res.status(201).json({
		success: true,
		message: 'File attached successfully',
		data: result,
	});
});

export const AttachmentControllers = {
	uploadAttachment,
};
