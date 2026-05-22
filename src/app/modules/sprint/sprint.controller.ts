import type { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { SprintServices } from './sprint.service';

const createSprint = catchAsync(async (req: Request, res: Response) => {
	const result = await SprintServices.createSprintIntoDB(req.body);

	res.status(201).json({
		success: true,
		message: 'Sprint created successfully',
		data: result,
	});
});

const getAllSprints = catchAsync(async (req: Request, res: Response) => {
	const projectId = req.query.projectId as string | undefined;
	const result = await SprintServices.getAllSprintsFromDB(projectId);

	res.status(200).json({
		success: true,
		message: 'Sprints retrieved successfully',
		data: result,
	});
});

export const SprintControllers = {
	createSprint,
	getAllSprints,
};
