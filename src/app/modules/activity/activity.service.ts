import prisma from '../../utils/prisma';

// This is an internal utility function. It doesn't need a controller or route!
const logActivity = async (projectId: string, userId: string, action: string, details: string) => {
	await prisma.activityLog.create({
		data: {
			projectId,
			userId,
			action,
			details,
		},
	});
};

// This is the function that will power the GET API
const getProjectActivitiesFromDB = async (projectId: string) => {
	const result = await prisma.activityLog.findMany({
		where: { projectId },
		orderBy: { createdAt: 'desc' }, // Newest events first
		include: {
			user: {
				select: { id: true, name: true, role: true },
			},
		},
	});

	return result;
};

export const ActivityServices = {
	logActivity,
	getProjectActivitiesFromDB,
};
