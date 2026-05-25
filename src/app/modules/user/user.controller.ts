import type { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { UserServices } from './user.service';

const createUser = catchAsync(async (req: Request, res: Response) => {
	const result = await UserServices.createUserIntoDB(req.body);

	res.status(201).json({
		success: true,
		data: result,
	});
});

const getMe = catchAsync(async (req: Request, res: Response) => {
	// req.user is injected by the auth middleware
	const userId = req.user.id;

	const result = await UserServices.getMeFromDB(userId);

	res.status(200).json({
		success: true,
		message: 'User profile retrieved successfully',
		data: result,
	});
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
	const result = await UserServices.getAllUsersFromDB();

	res.status(200).json({
		success: true,
		message: 'Users retrieved successfully',
		data: result,
	});
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await UserServices.updateUser(id as string, req.body);

	res.status(200).json({
		success: true,
		message: 'User updated successfully',
		data: result,
	});
});

export const UserControllers = {
	createUser,
	getMe,
	getAllUsers,
	updateUser,
};
