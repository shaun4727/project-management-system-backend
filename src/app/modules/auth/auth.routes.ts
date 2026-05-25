import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AuthControllers } from './auth.controller';
import { AuthValidation } from './auth.validation';

const router = Router();

router.post('/login', validateRequest(AuthValidation.loginValidationSchema), AuthControllers.loginUser);
router.post('/logout', AuthControllers.logout);

export const AuthRoutes = router;
