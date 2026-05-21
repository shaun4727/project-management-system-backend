import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AppError from '../../errors/appError';
import prisma from '../../utils/prisma';

const loginUser = async (payload: any) => {
	// 1. Check if the user exists in the database
	const user = await prisma.user.findUnique({
		where: {
			email: payload.email,
		},
	});

	if (!user) {
		throw new AppError(404, 'User not found');
	}

	// 2. Check if the password is correct
	const isPasswordMatched = await bcrypt.compare(payload.password, user.password);

	if (!isPasswordMatched) {
		throw new AppError(401, 'Incorrect password');
	}

	// 3. Create the JWT payload
	const jwtPayload = {
		id: user.id,
		email: user.email,
		role: user.role,
	};

	// 4. Generate the token

	const token = jwt.sign(jwtPayload, process.env.JWT_SECRET as string, {
		expiresIn: (process.env.JWT_EXPIRES_IN || '10d') as any,
	});

	// 5. Return the exact structure requested by the API contract
	return {
		token,
		user: {
			id: user.id,
			name: user.name,
			role: user.role,
		},
	};
};

export const AuthServices = {
	loginUser,
};
