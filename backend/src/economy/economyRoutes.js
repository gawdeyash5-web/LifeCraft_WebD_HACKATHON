import { Router } from 'express';
import { getShopItems, buyItem, getInventory } from './economyController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Routes owned by Member 3
router.get('/items', getShopItems);
router.post('/buy', requireAuth, buyItem);
router.get('/inventory', requireAuth, getInventory);

export default router;
