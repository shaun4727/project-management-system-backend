import { Project } from '@prisma/client';
import prisma from '../../utils/prisma';

const createProjectIntoDB = async (payload: any): Promise<Project> => {
	const result = await prisma.project.create({
		data: payload,
	});
	return result;
};

const getAllProjectsFromDB = async (): Promise<Project[]> => {
	const result = await prisma.project.findMany({
		orderBy: { createdAt: 'desc' }, // Newest projects first
	});
	return result;
};

export const ProjectServices = {
	createProjectIntoDB,
	getAllProjectsFromDB,
};
