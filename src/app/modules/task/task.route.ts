import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { TaskControllers } from './task.controller';
import { TaskValidation } from './task.validation';

const router = Router();

router.post(
	'/',
	auth(Role.ADMIN, Role.MANAGER),
	validateRequest(TaskValidation.createTaskValidationSchema),
	TaskControllers.createTask,
);

router.get('/', auth(Role.ADMIN, Role.MANAGER, Role.MEMBER), TaskControllers.getAllTasks);

router.patch(
	'/:id',
	auth(Role.ADMIN, Role.MANAGER, Role.MEMBER),
	validateRequest(TaskValidation.updateTaskValidationSchema),
	TaskControllers.updateTask,
);

router.delete(
	'/:id',
	auth(Role.ADMIN, Role.MANAGER), // Members cannot delete
	TaskControllers.deleteTask,
);

router.post(
	'/:id/time',
	auth(Role.ADMIN, Role.MANAGER, Role.MEMBER),
	validateRequest(TaskValidation.logTimeValidationSchema),
	TaskControllers.logTime,
);

export const TaskRoutes = router;
