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
	// Extract pagination and filters from the query string
	const page = parseInt(req.query.page as string) || 1;
	const limit = parseInt(req.query.limit as string) || 6;
	const status = req.query.status as string;

	const result = await ProjectServices.getAllProjectsFromDB(page, limit, status);

	res.status(200).json({
		success: true,
		message: 'Projects retrieved successfully',
		data: result, // This now contains both { projects, meta }
	});
});
const getSingleProject = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await ProjectServices.getSingleProjectFromDB(id as string);

	res.status(200).json({
		success: true,
		message: 'Project details retrieved successfully',
		data: result,
	});
});

const updateProject = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await ProjectServices.updateProjectInDB(id as string, req.body);

	res.status(200).json({
		success: true,
		message: 'Project updated successfully',
		data: result,
	});
});

// Add this below updateProject
const deleteProject = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;

	await ProjectServices.deleteProjectFromDB(id as string);

	res.status(200).json({
		success: true,
		message: 'Project and all related data deleted successfully',
		data: null, // Standard practice for DELETE operations
	});
});

const getProjectAnalytics = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;

	const result = await ProjectServices.getProjectAnalyticsFromDB(id as string);

	res.status(200).json({
		success: true,
		message: 'Project analytics retrieved successfully',
		data: result,
	});
});

const exportTasksCSV = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;

	const result = await ProjectServices.exportProjectTasksToCSV(id as string);

	// Set the specific headers required for a file download
	res.setHeader('Content-Type', 'text/csv');
	res.setHeader('Content-Disposition', `attachment; filename=${result.projectName}_tasks.csv`);

	// Send the raw CSV string directly (not wrapped in a JSON object!)
	res.status(200).send(result.csvString);
});

export const ProjectControllers = {
	createProject,
	getAllProjects,
	getSingleProject,
	updateProject,
	deleteProject,
	getProjectAnalytics,
	exportTasksCSV,
};
