import { Router } from 'express';
import authRoutes from '../auth/authRoutes.js';
import playerRoutes from '../player/playerRoutes.js';
import questRoutes from '../quests/questRoutes.js';
import economyRoutes from '../economy/economyRoutes.js';
import achievementRoutes from '../achievements/achievementRoutes.js';
import eventRoutes from '../events/eventRoutes.js';
import { successResponse } from '../utils/response.js';

const router = Router();

// Health Check Endpoint
router.get('/health', (req, res) => {
  return successResponse(res, {
    status: 'healthy',
    service: 'lifecraft-backend',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount Subsystem Routers
router.use('/auth', authRoutes);
router.use('/player', playerRoutes);
router.use('/quests', questRoutes);
router.use('/economy', economyRoutes);
router.use('/achievements', achievementRoutes);
router.use('/events', eventRoutes);

export default router;
