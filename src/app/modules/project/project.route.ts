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

router.get('/:id', auth(Role.ADMIN, Role.MANAGER, Role.MEMBER), ProjectControllers.getSingleProject);

router.patch(
	'/:id',
	auth(Role.ADMIN, Role.MANAGER), // Restrict to Admin/Manager
	validateRequest(ProjectValidation.updateProjectValidationSchema),
	ProjectControllers.updateProject,
);

router.delete('/:id', auth(Role.ADMIN, Role.MANAGER), ProjectControllers.deleteProject);

router.get('/:id/analytics', auth(Role.ADMIN, Role.MANAGER, Role.MEMBER), ProjectControllers.getProjectAnalytics);

router.get(
	'/:id/export/tasks',
	auth(Role.ADMIN, Role.MANAGER), // Restrict exports to management
	ProjectControllers.exportTasksCSV,
);

export const ProjectRoutes = router;
