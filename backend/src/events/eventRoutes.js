import { Router } from 'express';
import { listEvents } from './eventController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateToken, listEvents);

export default router;
