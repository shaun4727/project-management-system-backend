import bcrypt from 'bcryptjs';
import AppError from '../../errors/appError';
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

const getMeFromDB = async (userId: string) => {
	const result = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			department: true,
			skills: true,
			createdAt: true,
			// Bonus: Fetch their active tasks for their dashboard!
			tasks: {
				where: {
					status: {
						not: 'DONE', // Only show pending/active tasks
					},
				},
				select: {
					id: true,
					title: true,
					status: true,
					priority: true,
					dueDate: true,
					sprint: {
						select: {
							id: true,
							title: true,
							project: {
								select: {
									id: true,
									title: true,
								},
							},
						},
					},
				},
			},
		},
	});

	if (!result) {
		throw new AppError(404, 'User not found');
	}

	return result;
};

const getAllUsersFromDB = async () => {
	const result = await prisma.user.findMany({
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			department: true,
			skills: true,
		},
		orderBy: {
			name: 'asc', // Alphabetical order for the frontend dropdown
		},
	});

	return result;
};

const updateUser = async (id: string, payload: any) => {
	const result = await prisma.user.update({
		where: { id },
		data: payload, // Payload will now contain { skills: ["React", "Node"] }
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			skills: true, // FIXED: Changed from 'skill' to 'skills'
			department: true,
		},
	});
	return result;
};

// Update your export block
export const UserServices = {
	createUserIntoDB,
	getMeFromDB,
	getAllUsersFromDB,
	updateUser,
};
