import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import { CommentControllers } from './comment.controller';

const router = Router();

// Create a new comment
router.post('/:id/comments', auth(), CommentControllers.addComment);

// Get all comments for a specific task
router.get('/:taskId', auth(Role.ADMIN, Role.MANAGER, Role.MEMBER), CommentControllers.getTaskComments);

export const CommentRoutes = router;
