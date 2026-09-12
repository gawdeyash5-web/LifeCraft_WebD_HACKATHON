import { query, getClient } from '../database/db.js';
import { evaluateAchievements } from '../achievements/achievementService.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Economy & Cosmetics Controller
 * Handles item catalog, atomic shop purchases, user inventory, and equipping cosmetics.
 */

export const getShopItems = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, description, category, slot, price, region_target as "regionTarget", asset_key as "assetKey", rarity
       FROM items
       ORDER BY category ASC, price ASC`
    );

    return successResponse(res, result.rows, 200);
  } catch (err) {
    next(err);
  }
};

export const getUserInventory = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    }

    const result = await query(
      `SELECT
         inv.id,
         inv.item_id as "itemId",
         inv.is_equipped as "isEquipped",
         inv.acquired_at as "acquiredAt",
         i.name,
         i.description,
         i.category,
         i.slot,
         i.price,
         i.region_target as "regionTarget",
         i.asset_key as "assetKey",
         i.rarity
       FROM inventories inv
       JOIN items i ON inv.item_id = i.id
       WHERE inv.user_id = $1
       ORDER BY inv.acquired_at DESC`,
      [userId]
    );

    return successResponse(res, result.rows, 200);
  } catch (err) {
    next(err);
  }
};

export const buyItem = async (req, res, next) => {
  const { itemId } = req.body;
  const userId = req.user?.userId || req.user?.id;

  if (!itemId) {
    return errorResponse(res, 'itemId is required', 400, 'VALIDATION_ERROR');
  }

  if (!userId) {
    return errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
  }

  const client = await getClient();

  try {
    await client.query('BEGIN');

    // 1. Authoritative item check from catalog
    const itemResult = await client.query(
      `SELECT id, name, description, category, slot, price, region_target as "regionTarget", asset_key as "assetKey", rarity
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
      `SELECT gold, level, xp FROM players WHERE user_id = $1 FOR UPDATE`,
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
        `Insufficient gold. Item costs ${item.price} Gold, but you only have ${currentGold} Gold`,
        400,
        'INSUFFICIENT_GOLD'
      );
    }

    // 3. Prevent duplicate ownership
    const existingOwnership = await client.query(
      `SELECT id FROM inventories WHERE user_id = $1 AND item_id = $2`,
      [userId, item.id]
    );

    if (existingOwnership.rows.length > 0) {
      await client.query('ROLLBACK');
      return errorResponse(res, 'You already own this item', 400, 'ALREADY_OWNED');
    }

    // 4. Atomically deduct gold
    const remainingGold = currentGold - item.price;
    await client.query(
      `UPDATE players SET gold = $1 WHERE user_id = $2`,
      [remainingGold, userId]
    );

    // 5. Insert into inventories
    const inventoryResult = await client.query(
      `INSERT INTO inventories (user_id, item_id, is_equipped)
       VALUES ($1, $2, FALSE)
       RETURNING id, is_equipped as "isEquipped", acquired_at as "acquiredAt"`,
      [userId, item.id]
    );

    // 6. Record purchase event
    await client.query(
      `INSERT INTO events (user_id, type, title, description)
       VALUES ($1, 'item_purchased', $2, $3)`,
      [userId, `Purchased: ${item.name}`, `Acquired ${item.rarity} ${item.category} for ${item.price} Gold.`]
    );

    await client.query('COMMIT');

    // 7. Check achievements (e.g. collector)
    await evaluateAchievements(userId);

    const inventoryItem = {
      id: inventoryResult.rows[0].id,
      itemId: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      slot: item.slot,
      price: item.price,
      regionTarget: item.regionTarget,
      assetKey: item.assetKey,
      rarity: item.rarity,
      isEquipped: false,
      acquiredAt: inventoryResult.rows[0].acquiredAt,
    };

    return successResponse(res, {
      message: `Successfully purchased ${item.name}!`,
      remainingGold,
      inventoryItem,
    }, 200);
  } catch (dbErr) {
    await client.query('ROLLBACK');
    next(dbErr);
  } finally {
    client.release();
  }
};

export const equipItem = async (req, res, next) => {
  const id = req.params.id || req.body?.inventoryId || req.body?.id;
  const userId = req.user?.userId || req.user?.id;

  if (!userId) {
    return errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
  }

  const client = await getClient();

  try {
    await client.query('BEGIN');

    // 1. Verify user owns this inventory record
    const invRes = await client.query(
      `SELECT inv.id, inv.is_equipped, i.id as item_id, i.name, i.slot, i.asset_key
       FROM inventories inv
       JOIN items i ON inv.item_id = i.id
       WHERE inv.id = $1 AND inv.user_id = $2`,
      [id, userId]
    );

    if (invRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return errorResponse(res, 'Inventory item not found', 404, 'NOT_FOUND');
    }

    const targetItem = invRes.rows[0];
    const slot = targetItem.slot; // 'skin' | 'pet' | 'decor' | 'theme'

    // 2. Un-equip any other item sharing the same slot
    await client.query(
      `UPDATE inventories
       SET is_equipped = FALSE
       WHERE user_id = $1 AND item_id IN (
         SELECT id FROM items WHERE slot = $2
       )`,
      [userId, slot]
    );

    // 3. Set this item as equipped
    await client.query(
      `UPDATE inventories
       SET is_equipped = TRUE
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    // 4. Update the player's active equipped slot
    let playerUpdateSql = '';
    if (slot === 'skin') {
      playerUpdateSql = `UPDATE players SET equipped_skin = $1 WHERE user_id = $2 RETURNING equipped_skin, equipped_pet, equipped_decor`;
    } else if (slot === 'pet') {
      playerUpdateSql = `UPDATE players SET equipped_pet = $1 WHERE user_id = $2 RETURNING equipped_skin, equipped_pet, equipped_decor`;
    } else if (slot === 'decor') {
      playerUpdateSql = `UPDATE players SET equipped_decor = $1 WHERE user_id = $2 RETURNING equipped_skin, equipped_pet, equipped_decor`;
    } else {
      playerUpdateSql = `SELECT equipped_skin, equipped_pet, equipped_decor FROM players WHERE user_id = $2`;
    }

    const playerRes = await client.query(playerUpdateSql, [targetItem.asset_key, userId]);

    // 5. Log equip event
    await client.query(
      `INSERT INTO events (user_id, type, title, description)
       VALUES ($1, 'item_equipped', $2, $3)`,
      [userId, `Equipped ${targetItem.name}`, `Equipped ${targetItem.slot} in your 3D living diorama.`]
    );

    await client.query('COMMIT');

    return successResponse(res, {
      message: `Equipped ${targetItem.name}`,
      equippedItem: {
        id: targetItem.id,
        name: targetItem.name,
        slot: targetItem.slot,
        assetKey: targetItem.asset_key,
        isEquipped: true,
      },
      equipped: {
        skin: playerRes.rows[0]?.equipped_skin || 'character-archer',
        pet: playerRes.rows[0]?.equipped_pet || null,
        decor: playerRes.rows[0]?.equipped_decor || null,
      },
    }, 200);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

export const unequipItem = async (req, res, next) => {
  const id = req.params.id || req.body?.inventoryId || req.body?.id;
  const userId = req.user?.userId || req.user?.id;

  if (!userId) {
    return errorResponse(res, 'Unauthorized', 401, 'UNAUTHORIZED');
  }

  const client = await getClient();

  try {
    await client.query('BEGIN');

    const invRes = await client.query(
      `SELECT inv.id, i.slot, i.name
       FROM inventories inv
       JOIN items i ON inv.item_id = i.id
       WHERE inv.id = $1 AND inv.user_id = $2`,
      [id, userId]
    );

    if (invRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return errorResponse(res, 'Inventory item not found', 404, 'NOT_FOUND');
    }

    const targetItem = invRes.rows[0];
    const slot = targetItem.slot;

    // Set unequipped in inventories
    await client.query(
      `UPDATE inventories SET is_equipped = FALSE WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    // Reset player slot to default
    let playerUpdateSql = '';
    if (slot === 'skin') {
      playerUpdateSql = `UPDATE players SET equipped_skin = 'character-archer' WHERE user_id = $1 RETURNING equipped_skin, equipped_pet, equipped_decor`;
    } else if (slot === 'pet') {
      playerUpdateSql = `UPDATE players SET equipped_pet = NULL WHERE user_id = $1 RETURNING equipped_skin, equipped_pet, equipped_decor`;
    } else if (slot === 'decor') {
      playerUpdateSql = `UPDATE players SET equipped_decor = NULL WHERE user_id = $1 RETURNING equipped_skin, equipped_pet, equipped_decor`;
    } else {
      playerUpdateSql = `SELECT equipped_skin, equipped_pet, equipped_decor FROM players WHERE user_id = $1`;
    }

    const playerRes = await client.query(playerUpdateSql, [userId]);
    await client.query('COMMIT');

    return successResponse(res, {
      message: `Unequipped ${targetItem.name}`,
      equipped: {
        skin: playerRes.rows[0]?.equipped_skin || 'character-archer',
        pet: playerRes.rows[0]?.equipped_pet || null,
        decor: playerRes.rows[0]?.equipped_decor || null,
      },
    }, 200);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};
