import { Priority, TaskStatus } from '@prisma/client';
import { z } from 'zod';

const createTaskValidationSchema = z.object({
	body: z.object({
		title: z.string({ message: 'Title is required' }),
		description: z.string().optional(),
		estimateHours: z.number().optional(),
		priority: z.nativeEnum(Priority).optional(),
		status: z.nativeEnum(TaskStatus).optional(),
		dueDate: z.string().datetime({ message: 'Invalid datetime format' }).optional(),
		sprintId: z.string({ message: 'Sprint ID is required' }).uuid({ message: 'Invalid Sprint ID format' }),
		assigneeIds: z.array(z.string().uuid({ message: 'Invalid User ID format' })).optional(),
	}),
});

// Add this below your existing createTaskValidationSchema
const updateTaskValidationSchema = z.object({
	body: z.object({
		title: z.string().optional(),
		description: z.string().optional(),
		estimateHours: z.number().optional(),
		priority: z.nativeEnum(Priority).optional(),
		status: z.nativeEnum(TaskStatus).optional(),
		dueDate: z.string().datetime({ message: 'Invalid datetime format' }).optional(),
		// For updating assignees, we expect an array of user IDs
		assigneeIds: z.array(z.string().uuid({ message: 'Invalid User ID format' })).optional(),
	}),
});

// Update the export to include the new schema
export const TaskValidation = {
	createTaskValidationSchema,
	updateTaskValidationSchema,
};
