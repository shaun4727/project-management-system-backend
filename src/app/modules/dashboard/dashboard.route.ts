import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import { DashboardControllers } from './dashboard.controller';

const router = Router();

router.get('/', auth(Role.ADMIN, Role.MANAGER, Role.MEMBER), DashboardControllers.getDashboardSummary);

export const DashboardRoutes = router;
