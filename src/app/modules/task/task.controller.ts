import type { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import pick from '../../utils/pick';
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
	// Extract filters and pagination options securely
	const filters = pick(req.query, ['searchTerm', 'sprintId', 'status', 'priority']);
	const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);

	const result = await TaskServices.getAllTasksFromDB(filters, options);

	res.status(200).json({
		success: true,
		message: 'Tasks retrieved successfully',
		meta: result.meta, // Now returning pagination metadata!
		data: result.data,
	});
});

const updateTask = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;

	const userId = req.user.id;
	const userRole = req.user.role;

	const result = await TaskServices.updateTaskInDB(id as string, userId, userRole, req.body);

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

// Add this below your existing controllers
const logTime = catchAsync(async (req: Request, res: Response) => {
	const { id: taskId } = req.params;
	const userId = req.user.id; // From your auth middleware

	const result = await TaskServices.logTimeIntoDB(taskId as string, userId, req.body);

	res.status(201).json({
		success: true,
		message: 'Time logged successfully',
		data: result,
	});
});

export const TaskControllers = {
	logTime,
	createTask,
	getAllTasks,
	updateTask,
	deleteTask,
};
