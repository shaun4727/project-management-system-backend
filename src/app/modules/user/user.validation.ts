import { Role } from '@prisma/client';
import { z } from 'zod';

const createUserValidationSchema = z.object({
	body: z.object({
		name: z.string({ message: 'Name is required' }),
		email: z.string({ message: 'Email is required' }).email({ message: 'Invalid email format' }),
		password: z
			.string({ message: 'Password is required' })
			.min(6, { message: 'Password must be at least 6 characters' }),
		role: z.nativeEnum(Role).optional(),
		department: z.string().optional(),
		skills: z.array(z.string()).optional(),
	}),
});

export const UserValidation = {
	createUserValidationSchema,
};
