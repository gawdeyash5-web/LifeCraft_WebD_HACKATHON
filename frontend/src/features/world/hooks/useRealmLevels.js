import { useState, useCallback } from 'react';

export const DEFAULT_REALM_LEVELS = {
  mind: 1,
  body: 1,
  craft: 1,
};

/**
 * Visual Realm Levels State Hook
 * Manages realm evolution levels: { mind, body, craft }.
 */
export function useRealmLevels(initialLevels = DEFAULT_REALM_LEVELS) {
  const [levels, setLevels] = useState(initialLevels);

  const setRealmLevel = useCallback((realmId, level) => {
    const clampedLevel = Math.max(1, Math.min(3, Math.round(level)));
    setLevels((prev) => ({
      ...prev,
      [realmId]: clampedLevel,
    }));
  }, []);

  const cycleRealmLevel = useCallback((realmId) => {
    setLevels((prev) => {
      const current = prev[realmId] || 1;
      const next = current >= 3 ? 1 : current + 1;
      return { ...prev, [realmId]: next };
    });
  }, []);

  const setAllLevels = useCallback((newLevels) => {
    setLevels({
      mind: Math.max(1, Math.min(3, newLevels.mind || newLevels.mindLevel || 1)),
      body: Math.max(1, Math.min(3, newLevels.body || newLevels.bodyLevel || 1)),
      craft: Math.max(1, Math.min(3, newLevels.craft || newLevels.craftLevel || 1)),
    });
  }, []);

  return {
    realmLevels: levels,
    setRealmLevel,
    cycleRealmLevel,
    setAllLevels,
  };
}

export default useRealmLevels;
