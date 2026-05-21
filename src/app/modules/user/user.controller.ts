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

export const UserControllers = {
	createUser,
};
