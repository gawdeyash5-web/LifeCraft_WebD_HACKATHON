import { Router } from 'express';
import { register, login } from './authController.js';
import { successResponse } from '../utils/response.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', (req, res) => {
  return successResponse(res, null, 200, 'Logged out successfully');
});

export default router;
