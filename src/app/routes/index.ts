// src/app/routes/index.ts
import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { ProjectRoutes } from '../modules/project/project.route';
import { SprintRoutes } from '../modules/sprint/sprint.route';
import { TaskRoutes } from '../modules/task/task.route';
import { UserRoutes } from '../modules/user/user.route';
// import { ProjectRoutes } from '../modules/project/project.route';

const router = Router();

const moduleRoutes = [
	{
		path: '/auth',
		route: AuthRoutes,
	},
	{
		path: '/users',
		route: UserRoutes,
	},
	{
		path: '/projects',
		route: ProjectRoutes,
	},
	{
		path: '/sprints',
		route: SprintRoutes,
	},
	{
		path: '/tasks',
		route: TaskRoutes,
	},
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
