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

const updateTask = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await TaskServices.updateTaskInDB(id as string, req.body);

	res.status(200).json({
		success: true,
		message: 'Task updated successfully',
		data: result,
	});
});

const deleteTask = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	await TaskServices.deleteTaskFromDB(id as string);

	res.status(200).json({
		success: true,
		message: 'Task deleted successfully',
		data: null, // It is standard practice to return null data on a successful delete
	});
});

// Update the export block
export const TaskControllers = {
	createTask,
	getAllTasks,
	updateTask,
	deleteTask,
};
