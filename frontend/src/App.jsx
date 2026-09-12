import React, { useState } from 'react';
import Navbar from './components/Navbar';
import SidebarNav from './components/SidebarNav';
import RightOverlayDrawer from './components/RightOverlayDrawer';
import BottomRealmDock from './components/BottomRealmDock';
import WorldCanvas from './features/world/WorldCanvas';
import PlayerStatsPlaceholder from './features/player/PlayerStatsPlaceholder';
import ShopPlaceholder from './features/economy/ShopPlaceholder';
import { INITIAL_PLAYER_STATE, REGIONS } from './utils/contracts';
import CloseButton from './components/CloseButton';
import useRealmLevels from './features/world/hooks/useRealmLevels';

/**
 * LIFECRAFT Root Application Layout
 * 
 * Re-architected to match the visual reference composition:
 * Immersive full-viewport 3D world as the visual HERO, with glassmorphic
 * Left Sidebar, Right Quest/Stats Drawer, and Bottom Realm Dock floating over it.
 */
export default function App() {
  const { realmLevels, setRealmLevel } = useRealmLevels();
  const [player, setPlayer] = useState({
    ...INITIAL_PLAYER_STATE,
    level: 12,
    xp: 420,
    nextLevelXp: 1000,
    gold: 840,
    streak: 14,
    username: 'Yash',
  });
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'quests' | 'inventory' | 'shop' | 'stats' | 'achievements'
  const [activeRegion, setActiveRegion] = useState(null); // Starts in central plaza home overview

  // Handle region focus from 3D world click or bottom dock
  const handleSelectRegion = (regionId) => {
    setActiveRegion(regionId);
    if (regionId) {
      setPlayer((prev) => ({ ...prev, activeRegion: regionId }));
    }
  };

  // Quest completion handler
  const handleCompleteQuest = (quest) => {
    setPlayer((prev) => ({
      ...prev,
      xp: prev.xp + quest.xpReward,
      gold: prev.gold + quest.goldReward,
    }));
  };

  // Item buy handler
  const handleBuyItem = (item) => {
    if (player.gold >= item.price) {
      setPlayer((prev) => ({
        ...prev,
        gold: prev.gold - item.price,
      }));
    }
  };

  // Keyboard Escape listener to close open modal panels
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveTab('home');
      }
    };
    if (activeTab === 'shop' || activeTab === 'stats') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [activeTab]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#060913] text-slate-100 flex flex-col select-none">
      {/* 1. Header Navigation HUD */}
      <Navbar
        player={player}
        activeTab={activeTab}
        onTabSelect={setActiveTab}
      />

      {/* 2. Main Viewport: Full 3D World Canvas with Layered HUD */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Full-bleed 3D World Canvas Hero */}
        <div className="absolute inset-0 z-0">
          <WorldCanvas
            activeRegion={activeRegion}
            onSelectRegion={handleSelectRegion}
            realmLevels={realmLevels}
            onSetRealmLevel={setRealmLevel}
          />
        </div>

        {/* 3. Floating Left Sidebar (Matching Reference) */}
        <SidebarNav
          activeTab={activeTab}
          onTabSelect={setActiveTab}
        />

        {/* 4. Floating Right Panel: Today's Quests & Player Stats (Matching Reference) */}
        <RightOverlayDrawer
          player={player}
          activeRegion={activeRegion}
          onCompleteQuest={handleCompleteQuest}
          onOpenStats={() => setActiveTab('stats')}
        />

        {/* 5. Floating Bottom Dock: 3 Realm Preview Cards & Utilities (Matching Reference) */}
        <BottomRealmDock
          activeRegion={activeRegion}
          onSelectRegion={handleSelectRegion}
          realmLevels={realmLevels}
          onOpenShop={() => setActiveTab('shop')}
          onOpenInventory={() => setActiveTab('inventory')}
          onOpenAchievements={() => setActiveTab('achievements')}
        />

        {/* Modal Overlay for Realm Shop or Character Stats (Layer 4 & 5) */}
        {(activeTab === 'shop' || activeTab === 'stats') && (
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setActiveTab('home')}
            className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative z-50 w-full max-w-md max-h-[85vh] overflow-y-auto"
            >
              <div className="absolute top-3 right-3 z-50">
                <CloseButton onClose={() => setActiveTab('home')} />
              </div>
              {activeTab === 'shop' && (
                <ShopPlaceholder
                  gold={player.gold}
                  onBuyItem={handleBuyItem}
                />
              )}
              {activeTab === 'stats' && (
                <PlayerStatsPlaceholder
                  player={player}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
