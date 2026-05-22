import type { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { TaskServices } from './task.service';

const createTask = catchAsync(async (req: Request, res: Response) => {
	const result = await TaskServices.createTaskIntoDB(req.body);

	res.status(201).json({
		success: true,
		message: 'Task created successfully',
		data: result,
	});
});

const getAllTasks = catchAsync(async (req: Request, res: Response) => {
	const sprintId = req.query.sprintId as string | undefined;
	const result = await TaskServices.getAllTasksFromDB(sprintId);

	res.status(200).json({
		success: true,
		message: 'Tasks retrieved successfully',
		data: result,
	});
});

// Add this below your existing getAllTasks function
const updateTask = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await TaskServices.updateTaskInDB(id as string, req.body);

	res.status(200).json({
		success: true,
		message: 'Task updated successfully',
		data: result,
	});
});

// Update the export to include the new controller
export const TaskControllers = {
	createTask,
	getAllTasks,
	updateTask, // <-- Added here
};
