import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserControllers } from './user.controller';
import { UserValidation } from './user.validation';

const router = Router();

router.post(
	'/',
	auth(Role.ADMIN, Role.MANAGER), // Only Admins and Managers can access
	validateRequest(UserValidation.createUserValidationSchema),
	UserControllers.createUser,
);

export const UserRoutes = router;
