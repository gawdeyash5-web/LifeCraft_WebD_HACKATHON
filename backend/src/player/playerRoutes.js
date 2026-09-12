import { Router } from 'express';
import { getPlayerProfile, updatePlayerRegion } from './playerController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Routes owned by Member 3
// Note: When Member 3 finishes auth testing, add requireAuth to these routes
router.get('/me', getPlayerProfile);
router.patch('/region', updatePlayerRegion);

export default router;
