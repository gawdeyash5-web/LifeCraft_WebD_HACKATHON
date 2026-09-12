import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Economy & Shop Controller (Owned by Member 3)
 * Handles item catalog, shop purchases, and inventory lookups.
 */

export const getShopItems = async (req, res, next) => {
  try {
    // TODO (Member 3):
    // 1. Fetch catalog items from `items` table via query()
    return successResponse(res, {
      message: 'Shop items endpoint ready. Member 3: fetch items from database.',
      items: [
        { id: '1', name: 'Astral Knowledge Orb', price: 100, regionTarget: 'mind', type: 'cosmetic' },
        { id: '2', name: 'Titan Obelisk', price: 150, regionTarget: 'body', type: 'cosmetic' },
        { id: '3', name: 'Cyber Matrix Node', price: 200, regionTarget: 'craft', type: 'cosmetic' }
      ]
    });
  } catch (err) {
    next(err);
  }
};

export const buyItem = async (req, res, next) => {
  try {
    const { itemId } = req.body;

    if (!itemId) {
      return errorResponse(res, 'itemId is required', 400, 'VALIDATION_ERROR');
    }

    // TODO (Member 3):
    // 1. Check player's gold balance in `players` table
    // 2. Ensure player has enough gold
    // 3. Deduct gold and insert row into `inventories` table inside a transaction

    return successResponse(res, {
      message: `Purchase endpoint ready for item ${itemId}. Member 3: execute transaction in DB.`,
      purchasedItemId: itemId
    });
  } catch (err) {
    next(err);
  }
};

export const getInventory = async (req, res, next) => {
  try {
    // TODO (Member 3):
    // 1. Fetch user's inventory joined with `items` table
    return successResponse(res, {
      message: 'Inventory endpoint ready. Member 3: query inventories table.',
      inventory: []
    });
  } catch (err) {
    next(err);
  }
};
