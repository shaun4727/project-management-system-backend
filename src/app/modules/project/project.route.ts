import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ProjectControllers } from './project.controller';
import { ProjectValidation } from './project.validation';

const router = Router();

// Only Admins and Managers can CREATE projects
router.post(
	'/',
	auth(Role.ADMIN, Role.MANAGER),
	validateRequest(ProjectValidation.createProjectValidationSchema),
	ProjectControllers.createProject,
);

// ALL authenticated users can VIEW projects
router.get('/', auth(Role.ADMIN, Role.MANAGER, Role.MEMBER), ProjectControllers.getAllProjects);

export const ProjectRoutes = router;
