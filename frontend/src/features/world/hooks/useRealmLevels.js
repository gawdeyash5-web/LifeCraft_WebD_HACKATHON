import { useState, useCallback } from 'react';

export const DEFAULT_REALM_LEVELS = {
  mind: 1,
  body: 1,
  craft: 1,
};

/**
 * Isolated Visual Realm Evolution State Container (Member 1 Dev / Test Mode)
 * 
 * Cleanly isolates the temporary visual test state for Member 1's 3D world testing.
 * When Member 2 connects the backend progression API, this hook seamlessly accepts
 * incoming external levels: { mindLevel, bodyLevel, craftLevel }.
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
