import type { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { ProjectServices } from './project.service';

const createProject = catchAsync(async (req: Request, res: Response) => {
	const result = await ProjectServices.createProjectIntoDB(req.body);

	res.status(201).json({
		success: true,
		message: 'Project created successfully',
		data: result,
	});
});

const getAllProjects = catchAsync(async (req: Request, res: Response) => {
	const result = await ProjectServices.getAllProjectsFromDB();

	res.status(200).json({
		success: true,
		message: 'Projects retrieved successfully',
		data: result,
	});
});

export const ProjectControllers = {
	createProject,
	getAllProjects,
};
