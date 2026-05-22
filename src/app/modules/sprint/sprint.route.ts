import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { SprintControllers } from './sprint.controller';
import { SprintValidation } from './sprint.validation';

const router = Router();

router.post(
	'/',
	auth(Role.ADMIN, Role.MANAGER),
	validateRequest(SprintValidation.createSprintValidationSchema),
	SprintControllers.createSprint,
);

router.get('/', auth(Role.ADMIN, Role.MANAGER, Role.MEMBER), SprintControllers.getAllSprints);

export const SprintRoutes = router;
