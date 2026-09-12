import { Router } from 'express';
import { getPlayerProfile, updatePlayerRegion } from './playerController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Routes owned by Member 3
router.get('/me', requireAuth, getPlayerProfile);
router.patch('/region', requireAuth, updatePlayerRegion);

export default router;
