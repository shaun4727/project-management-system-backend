import { Sprint } from '@prisma/client';
import AppError from '../../errors/appError';
import prisma from '../../utils/prisma';

const createSprintIntoDB = async (payload: any): Promise<Sprint> => {
	// 1. Verify the associated project exists
	const project = await prisma.project.findUnique({
		where: { id: payload.projectId },
	});

	if (!project) {
		throw new AppError(404, 'Project not found');
	}

	// 2. Create the sprint
	const result = await prisma.sprint.create({
		data: payload,
	});

	return result;
};

const getAllSprintsFromDB = async (projectId?: string): Promise<Sprint[]> => {
	const result = await prisma.sprint.findMany({
		// If projectId exists, filter by it. Otherwise, pass undefined to get all sprints.
		where: projectId ? { projectId } : undefined,
		orderBy: [{ projectId: 'asc' }, { sprintNumber: 'asc' }],
	});

	return result;
};

const updateSprintInDB = async (id: string, payload: any) => {
	const existingSprint = await prisma.sprint.findUnique({
		where: { id },
	});

	if (!existingSprint) {
		throw new AppError(404, 'Sprint not found');
	}

	const result = await prisma.sprint.update({
		where: { id },
		data: payload,
	});

	return result;
};

const deleteSprintFromDB = async (id: string) => {
	const existingSprint = await prisma.sprint.findUnique({
		where: { id },
	});

	if (!existingSprint) {
		throw new AppError(404, 'Sprint not found');
	}

	// Deleting a sprint will cascade and delete all tasks inside it
	const result = await prisma.sprint.delete({
		where: { id },
	});

	return result;
};

export const SprintServices = {
	createSprintIntoDB,
	getAllSprintsFromDB,
	updateSprintInDB,
	deleteSprintFromDB,
};
