import { Router } from 'express';
import { getShopItems, buyItem, getInventory } from './economyController.js';

const router = Router();

// Routes owned by Member 3
router.get('/items', getShopItems);
router.post('/buy', buyItem);
router.get('/inventory', getInventory);

export default router;
