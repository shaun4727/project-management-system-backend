import { z } from 'zod';

const createCommentValidationSchema = z.object({
	body: z.object({
		taskId: z.string({ message: 'Task ID is required' }).uuid({ message: 'Invalid Task ID format' }),
		content: z.string({ message: 'Comment content is required' }).min(1, 'Comment cannot be empty'),
	}),
});

export const CommentValidation = {
	createCommentValidationSchema,
};
