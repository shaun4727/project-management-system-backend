import bcrypt from 'bcryptjs';
import prisma from '../../utils/prisma';

const createUserIntoDB = async (payload: any) => {
	// Hash the password (Cost factor 12 is standard security)
	const hashedPassword = await bcrypt.hash(payload.password, 12);

	// Create user
	const newUser = await prisma.user.create({
		data: {
			...payload,
			password: hashedPassword,
		},
		// Prisma allows us to specifically select the fields we want to return!
		select: {
			id: true,
			name: true,
			role: true,
		},
	});

	return newUser;
};

export const UserServices = {
	createUserIntoDB,
};
