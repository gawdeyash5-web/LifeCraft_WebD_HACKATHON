import { Router } from 'express';
import { register, login } from './authController.js';

const router = Router();

// Routes owned by Member 3
router.post('/register', register);
router.post('/login', login);

export default router;
