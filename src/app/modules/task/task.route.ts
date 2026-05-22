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

// Add this before the export statement
router.patch(
	'/:id',
	auth(Role.ADMIN, Role.MANAGER, Role.MEMBER),
	validateRequest(TaskValidation.updateTaskValidationSchema),
	TaskControllers.updateTask,
);

export const TaskRoutes = router;
