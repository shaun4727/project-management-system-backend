import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import { upload } from '../../utils/upload';
import { AttachmentControllers } from './attachment.controller';

const router = Router();

router.post(
	'/',
	auth(Role.ADMIN, Role.MANAGER, Role.MEMBER),
	upload.single('file'), // 'file' is the exact key the frontend must use in FormData
	AttachmentControllers.uploadAttachment,
);

export const AttachmentRoutes = router;
