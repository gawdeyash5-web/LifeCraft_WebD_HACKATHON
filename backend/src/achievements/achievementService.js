import { query, getClient } from '../database/db.js';

/**
 * Evaluates all achievement criteria for a user against their real database stats.
 * Automatically unlocks new achievements, awards XP/Gold, and logs player events.
 */
export async function evaluateAchievements(userId) {
  if (!userId) return [];

  const client = await getClient();
  const unlockedNow = [];

  try {
    await client.query('BEGIN');

    // 1. Fetch current player stats
    const playerRes = await client.query(
      `SELECT * FROM players WHERE user_id = $1 FOR UPDATE`,
      [userId]
    );
    if (playerRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return [];
    }
    const player = playerRes.rows[0];

    // 2. Fetch completed quest count
    const questRes = await client.query(
      `SELECT count(*) as count FROM quests WHERE user_id = $1 AND completed = TRUE`,
      [userId]
    );
    const completedQuestsCount = parseInt(questRes.rows[0].count, 10) || 0;

    // 3. Fetch owned inventory items count
    const invRes = await client.query(
      `SELECT count(*) as count FROM inventories WHERE user_id = $1`,
      [userId]
    );
    const ownedItemsCount = parseInt(invRes.rows[0].count, 10) || 0;

    // 4. Fetch already unlocked achievements
    const alreadyRes = await client.query(
      `SELECT achievement_key FROM user_achievements WHERE user_id = $1`,
      [userId]
    );
    const alreadyUnlocked = new Set(alreadyRes.rows.map(r => r.achievement_key));

    // 5. Fetch all catalog achievements
    const achCatalogRes = await client.query(`SELECT * FROM achievements`);
    const catalog = achCatalogRes.rows;

    let bonusXp = 0;
    let bonusGold = 0;

    for (const ach of catalog) {
      if (alreadyUnlocked.has(ach.key)) continue;

      let satisfied = false;
      switch (ach.key) {
        case 'first_quest':
          satisfied = completedQuestsCount >= 1;
          break;
        case 'getting_started':
          satisfied = (player.mind_xp > 0 || player.body_xp > 0 || player.craft_xp > 0);
          break;
        case 'rising_adventurer':
          satisfied = player.level >= 2;
          break;
        case 'wealth_builder':
          satisfied = player.gold >= 200;
          break;
        case 'collector':
          satisfied = ownedItemsCount >= 1;
          break;
        case 'mind_initiate':
          satisfied = (player.mind_level || 1) >= 2;
          break;
        case 'body_initiate':
          satisfied = (player.body_level || 1) >= 2;
          break;
        case 'craft_initiate':
          satisfied = (player.craft_level || 1) >= 2;
          break;
        case 'realm_master':
          satisfied = (player.mind_level >= 3 || player.body_level >= 3 || player.craft_level >= 3);
          break;
        case 'streak_keeper':
          satisfied = player.streak >= 3;
          break;
        default:
          satisfied = false;
      }

      if (satisfied) {
        await client.query(
          `INSERT INTO user_achievements (user_id, achievement_key)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [userId, ach.key]
        );

        await client.query(
          `INSERT INTO events (user_id, type, title, description)
           VALUES ($1, 'achievement_unlocked', $2, $3)`,
          [userId, `Unlocked: ${ach.title}`, ach.description]
        );

        bonusXp += ach.xp_reward;
        bonusGold += ach.gold_reward;
        unlockedNow.push(ach);
      }
    }

    if (bonusXp > 0 || bonusGold > 0) {
      await client.query(
        `UPDATE players SET xp = xp + $1, gold = gold + $2 WHERE user_id = $3`,
        [bonusXp, bonusGold, userId]
      );
    }

    await client.query('COMMIT');
    return unlockedNow;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[AchievementService] Error evaluating achievements:', err.message);
    return [];
  } finally {
    client.release();
  }
}

/**
 * Returns full list of achievements with user unlock status and timestamp.
 */
export async function getUserAchievements(userId) {
  const result = await query(
    `SELECT
       a.id,
       a.key,
       a.title,
       a.description,
       a.category,
       a.xp_reward as "xpReward",
       a.gold_reward as "goldReward",
       a.icon,
       (ua.achievement_key IS NOT NULL) as "isUnlocked",
       (ua.achievement_key IS NOT NULL) as "unlocked",
       ua.unlocked_at as "unlockedAt"
     FROM achievements a
     LEFT JOIN user_achievements ua ON a.key = ua.achievement_key AND ua.user_id = $1
     ORDER BY a.category ASC, a.xp_reward ASC`,
    [userId]
  );
  return result.rows;
}
