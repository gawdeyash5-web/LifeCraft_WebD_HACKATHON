import { pool, query } from '../database/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Economy & Shop Controller (Owned by Member 3)
 * Handles item catalog, atomic shop purchases, and inventory lookups.
 */

export const getShopItems = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, description, type, price, region_target
       FROM items
       ORDER BY price ASC`
    );

    const items = result.rows.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      type: item.type,
      price: item.price,
      regionTarget: item.region_target,
    }));

    return successResponse(res, items);
  } catch (err) {
    next(err);
  }
};

export const buyItem = async (req, res, next) => {
  const { itemId } = req.body;
  const userId = req.user?.userId;

  if (!itemId) {
    return errorResponse(res, 'itemId is required', 400, 'VALIDATION_ERROR');
  }

  if (!userId) {
    return errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Authoritative price & existence check from DB
    const itemResult = await client.query(
      `SELECT id, name, description, type, price, region_target
       FROM items
       WHERE id = $1`,
      [itemId]
    );

    if (itemResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return errorResponse(res, 'Item not found in catalog', 404, 'ITEM_NOT_FOUND');
    }

    const item = itemResult.rows[0];

    // 2. Lock player row and verify gold balance
    const playerResult = await client.query(
      `SELECT gold FROM players WHERE user_id = $1 FOR UPDATE`,
      [userId]
    );

    if (playerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return errorResponse(res, 'Player profile not found', 404, 'PLAYER_NOT_FOUND');
    }

    const currentGold = playerResult.rows[0].gold;
    if (currentGold < item.price) {
      await client.query('ROLLBACK');
      return errorResponse(
        res,
        `Insufficient gold. Item costs ${item.price} G, but you only have ${currentGold} G`,
        400,
        'INSUFFICIENT_GOLD'
      );
    }

    // 3. Check duplicate ownership
    const existingOwnership = await client.query(
      `SELECT id FROM inventories WHERE user_id = $1 AND item_id = $2`,
      [userId, item.id]
    );

    if (existingOwnership.rows.length > 0) {
      await client.query('ROLLBACK');
      return errorResponse(res, 'You already own this item', 400, 'ITEM_ALREADY_OWNED');
    }

    // 4. Deduct gold atomically
    const updateResult = await client.query(
      `UPDATE players
       SET gold = gold - $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING gold`,
      [item.price, userId]
    );
    const remainingGold = updateResult.rows[0].gold;

    // 5. Insert into inventories table
    const insertResult = await client.query(
      `INSERT INTO inventories (user_id, item_id, is_equipped)
       VALUES ($1, $2, FALSE)
       RETURNING id, user_id, item_id, is_equipped, acquired_at`,
      [userId, item.id]
    );
    const newInventoryItem = insertResult.rows[0];

    await client.query('COMMIT');

    return successResponse(res, {
      inventoryItem: {
        id: newInventoryItem.id,
        itemId: newInventoryItem.item_id,
        name: item.name,
        type: item.type,
        regionTarget: item.region_target,
        isEquipped: newInventoryItem.is_equipped,
        acquiredAt: newInventoryItem.acquired_at,
      },
      remainingGold,
    }, 200, `Successfully purchased ${item.name}`);
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return errorResponse(res, 'You already own this item', 400, 'ITEM_ALREADY_OWNED');
    }
    next(err);
  } finally {
    client.release();
  }
};

export const getInventory = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    }

    const result = await query(
      `SELECT
         inv.id,
         inv.item_id,
         inv.is_equipped,
         inv.acquired_at,
         itm.name,
         itm.description,
         itm.type,
         itm.price,
         itm.region_target
       FROM inventories inv
       JOIN items itm ON inv.item_id = itm.id
       WHERE inv.user_id = $1
       ORDER BY inv.acquired_at DESC`,
      [userId]
    );

    const inventory = result.rows.map(row => ({
      id: row.id,
      itemId: row.item_id,
      name: row.name,
      description: row.description,
      type: row.type,
      price: row.price,
      regionTarget: row.region_target,
      isEquipped: row.is_equipped,
      acquiredAt: row.acquired_at,
    }));

    return successResponse(res, inventory);
  } catch (err) {
    next(err);
  }
};
