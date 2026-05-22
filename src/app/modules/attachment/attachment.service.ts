import AppError from '../../errors/appError';
import prisma from '../../utils/prisma';

const createAttachmentIntoDB = async (taskId: string, file: Express.Multer.File) => {
	// 1. Verify the task exists
	const task = await prisma.task.findUnique({
		where: { id: taskId },
	});

	if (!task) {
		throw new AppError(404, 'Task not found');
	}

	// 2. Construct the public URL for the file
	const fileUrl = `/uploads/${file.filename}`;

	// 3. Save to database
	const result = await prisma.attachment.create({
		data: {
			fileName: file.originalname,
			fileUrl: fileUrl,
			taskId: taskId,
		},
	});

	return result;
};

export const AttachmentServices = {
	createAttachmentIntoDB,
};
