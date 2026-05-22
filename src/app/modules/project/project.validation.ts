import { z } from 'zod';

const createProjectValidationSchema = z.object({
	body: z.object({
		title: z.string({ message: 'Title is required' }),
		client: z.string({ message: 'Client name is required' }),
		description: z.string().optional(),
		startDate: z.string({ message: 'Start date is required' }).datetime({ message: 'Invalid datetime format' }),
		endDate: z.string({ message: 'End date is required' }).datetime({ message: 'Invalid datetime format' }),
		budget: z.number().optional(),
		thumbnail: z.string().optional(),
	}),
});

export const ProjectValidation = {
	createProjectValidationSchema,
};
