import type { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { DashboardServices } from './dashboard.service';

const getDashboardSummary = catchAsync(async (req: Request, res: Response) => {
	// Extract user details injected by the auth middleware
	const { id: userId, role } = req.user;

	const result = await DashboardServices.getDashboardSummaryFromDB(userId, role);

	res.status(200).json({
		success: true,
		message: 'Dashboard summary retrieved successfully',
		data: result,
	});
});

export const DashboardControllers = {
	getDashboardSummary,
};
