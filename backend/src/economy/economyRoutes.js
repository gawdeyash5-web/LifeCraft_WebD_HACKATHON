import { Router } from 'express';
import {
  getShopItems,
  buyItem,
  getUserInventory,
  equipItem,
  unequipItem,
} from './economyController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Catalog & Purchases
router.get('/items', getShopItems);
router.post('/buy', requireAuth, buyItem);

// Inventory & Equipping
router.get('/inventory', requireAuth, getUserInventory);
router.patch('/inventory/:id/equip', requireAuth, equipItem);
router.patch('/inventory/:id/unequip', requireAuth, unequipItem);
router.post('/equip', requireAuth, equipItem);
router.post('/unequip', requireAuth, unequipItem);

export default router;
