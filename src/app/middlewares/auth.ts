// src/app/middlewares/auth.ts
import { Role } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import AppError from '../errors/appError';
import catchAsync from '../utils/catchAsync';

const auth = (...requiredRoles: Role[]) => {
	return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		const token = req.headers.authorization?.split(' ')[1]; // Expecting "Bearer <token>"

		if (!token) {
			throw new AppError(401, 'You are not authorized');
		}

		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

		// Check if the user's role is in the array of required roles
		if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
			throw new AppError(403, 'Forbidden: You do not have permission to perform this action');
		}

		// Attach decoded user info to the request object
		req.user = decoded;
		next();
	});
};

export default auth;
