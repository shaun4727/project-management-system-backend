import { z } from 'zod';

const createSprintValidationSchema = z.object({
	body: z.object({
		title: z.string({ message: 'Title is required' }),
		sprintNumber: z.number({ message: 'Sprint number is required' }).int().positive(),
		startDate: z.string({ message: 'Start date is required' }).datetime({ message: 'Invalid datetime format' }),
		endDate: z.string({ message: 'End date is required' }).datetime({ message: 'Invalid datetime format' }),
		projectId: z.string({ message: 'Project ID is required' }).uuid({ message: 'Invalid Project ID format' }),
	}),
});

export const SprintValidation = {
	createSprintValidationSchema,
};
