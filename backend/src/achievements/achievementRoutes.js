import { Router } from 'express';
import { listAchievements } from './achievementController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateToken, listAchievements);

export default router;
