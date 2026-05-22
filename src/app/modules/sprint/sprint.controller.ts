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

const updateSprint = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await SprintServices.updateSprintInDB(id as string, req.body);

	res.status(200).json({
		success: true,
		message: 'Sprint updated successfully',
		data: result,
	});
});

const deleteSprint = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	await SprintServices.deleteSprintFromDB(id as string);

	res.status(200).json({
		success: true,
		message: 'Sprint deleted successfully',
		data: null,
	});
});

export const SprintControllers = {
	createSprint,
	getAllSprints,
	updateSprint,
	deleteSprint,
};
