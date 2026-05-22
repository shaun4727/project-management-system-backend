import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserControllers } from './user.controller';
import { UserValidation } from './user.validation';

const router = Router();

router.post(
	'/',
	auth(Role.ADMIN, Role.MANAGER),
	validateRequest(UserValidation.createUserValidationSchema),
	UserControllers.createUser,
);

router.get('/me', auth(Role.ADMIN, Role.MANAGER, Role.MEMBER), UserControllers.getMe);

router.get('/', auth(Role.ADMIN, Role.MANAGER, Role.MEMBER), UserControllers.getAllUsers);

export const UserRoutes = router;
