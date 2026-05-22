import type { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { ActivityServices } from './activity.service';

const getProjectActivities = catchAsync(async (req: Request, res: Response) => {
	const { projectId } = req.params;

	const result = await ActivityServices.getProjectActivitiesFromDB(projectId as string);

	res.status(200).json({
		success: true,
		message: 'Project activity logs retrieved successfully',
		data: result,
	});
});

export const ActivityControllers = {
	getProjectActivities,
};
