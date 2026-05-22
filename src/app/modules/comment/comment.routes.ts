import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { CommentControllers } from './comment.controller';
import { CommentValidation } from './comment.validation';

const router = Router();

// Create a new comment
router.post(
	'/',
	auth(Role.ADMIN, Role.MANAGER, Role.MEMBER),
	validateRequest(CommentValidation.createCommentValidationSchema),
	CommentControllers.createComment,
);

// Get all comments for a specific task
router.get('/:taskId', auth(Role.ADMIN, Role.MANAGER, Role.MEMBER), CommentControllers.getTaskComments);

export const CommentRoutes = router;
