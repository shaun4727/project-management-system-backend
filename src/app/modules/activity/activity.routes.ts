import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import { ActivityControllers } from './activity.controller';

const router = Router();

router.get('/:projectId', auth(Role.ADMIN, Role.MANAGER, Role.MEMBER), ActivityControllers.getProjectActivities);

export const ActivityRoutes = router;
