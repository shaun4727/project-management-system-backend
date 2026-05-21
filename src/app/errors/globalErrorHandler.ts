// src/app/middlewares/globalErrorHandler.ts
import { Prisma } from '@prisma/client';
import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
	// 1. Default Error Values
	let statusCode = 500;
	let message = 'Something went wrong!';
	let errorSources: any = [
		{
			path: '',
			message: 'Internal Server Error',
		},
	];

	// 2. Handle Zod Validation Errors
	if (err instanceof ZodError) {
		statusCode = 400;
		message = 'Validation Error';
		errorSources = err.issues.map((issue) => ({
			path: issue.path[issue.path.length - 1],
			message: issue.message,
		}));
	}

	// 3. Handle Prisma Known Request Errors (e.g., duplicate emails)
	else if (err instanceof Prisma.PrismaClientKnownRequestError) {
		if (err.code === 'P2002') {
			statusCode = 409; // Conflict
			message = 'Duplicate Entry';
			// Prisma puts the target fields in err.meta.target
			const target = (err.meta?.target as string[])?.join(', ') || 'field';
			errorSources = [
				{
					path: target,
					message: `The ${target} already exists. Please use a different one.`,
				},
			];
		}
		// You can add more Prisma error codes here later (like P2025 for 'Record not found')
	}

	// 4. Handle standard generic Errors
	else if (err instanceof Error) {
		message = err.message;
		errorSources = [
			{
				path: '',
				message: err.message,
			},
		];
	}

	// 5. Send the final response
	res.status(statusCode).json({
		success: false,
		message,
		errorSources,
		// Only send the stack trace in development mode for security
		stack: process.env.NODE_ENV === 'development' ? err?.stack : null,
	});
};

export default globalErrorHandler;
