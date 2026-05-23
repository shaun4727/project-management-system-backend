import { Role } from '@prisma/client';
import prisma from '../../utils/prisma';

const getDashboardSummaryFromDB = async (userId: string, role: Role) => {
	// If the user is an Admin or Manager, they see company-wide stats.
	// If they are a Member, they only see stats relevant to them.
	const isManagement = role === Role.ADMIN || role === Role.MANAGER;

	const [
		totalProjects,
		myActiveTasks,
		myCompletedTasks,
		recentActivity,
		timeLogAggregation, // <-- 1. Add our new query result here
	] = await Promise.all([
		// 1. Get total projects
		prisma.project.count(),

		// 2. Get active tasks assigned to this user
		prisma.task.count({
			where: {
				assignees: { some: { id: userId } },
				status: { not: 'DONE' },
			},
		}),

		// 3. Get completed tasks assigned to this user
		prisma.task.count({
			where: {
				assignees: { some: { id: userId } },
				status: 'DONE',
			},
		}),

		// 4. Get the 5 most recent activities
		prisma.activityLog.findMany({
			take: 5,
			orderBy: { createdAt: 'desc' },
			include: {
				user: { select: { name: true } },
				project: { select: { title: true } },
			},
		}),

		// 5. SUM all hours logged by this specific user
		prisma.timeLog.aggregate({
			where: { userId: userId },
			_sum: {
				hoursLogged: true,
			},
		}),
	]);

	// Prisma returns null if there are no logs, so we default to 0
	const totalHoursLogged = timeLogAggregation._sum.hoursLogged || 0;

	return {
		overview: {
			totalProjects,
			activeTasks: myActiveTasks,
			completedTasks: myCompletedTasks,
			totalHoursLogged, // <-- 2. Expose it to the frontend
		},
		recentActivity,
	};
};

export const DashboardServices = {
	getDashboardSummaryFromDB,
};
