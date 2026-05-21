import type { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { AuthServices } from './auth.service';

const loginUser = catchAsync(async (req: Request, res: Response) => {
	const result = await AuthServices.loginUser(req.body);

	// Notice we are returning the response exactly as the API contract requested
	res.status(200).json({
		success: true,
		token: result.token,
		user: result.user,
	});
});

export const AuthControllers = {
	loginUser,
};
