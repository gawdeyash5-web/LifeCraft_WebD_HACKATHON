import React, { useState } from 'react';
import Navbar from './components/Navbar';
import WorldCanvas from './features/world/WorldCanvas';
import QuestListPlaceholder from './features/quests/QuestListPlaceholder';
import PlayerStatsPlaceholder from './features/player/PlayerStatsPlaceholder';
import ShopPlaceholder from './features/economy/ShopPlaceholder';
import { INITIAL_PLAYER_STATE, REGIONS } from './utils/contracts';

/**
 * LIFECRAFT Root Application Layout
 * 
 * Coordinates the 3D visual canvas and the 2D HUD panels.
 * Note: Avoid modifying this shared orchestrator casually to prevent merge conflicts.
 */
export default function App() {
  const [player, setPlayer] = useState(INITIAL_PLAYER_STATE);
  const [activeTab, setActiveTab] = useState('quests'); // 'quests' | 'shop' | 'stats'
  const [activeRegion, setActiveRegion] = useState('mind');

  // Handle region focus from 3D world click
  const handleSelectRegion = (regionId) => {
    setActiveRegion(regionId);
    setPlayer((prev) => ({ ...prev, activeRegion: regionId }));
  };

  // Prototype quest completion handler
  const handleCompleteQuest = (quest) => {
    setPlayer((prev) => ({
      ...prev,
      xp: prev.xp + quest.xpReward,
      gold: prev.gold + quest.goldReward,
    }));
  };

  // Prototype item buy handler
  const handleBuyItem = (item) => {
    if (player.gold >= item.price) {
      setPlayer((prev) => ({
        ...prev,
        gold: prev.gold - item.price,
      }));
    }
  };

  const currentRegionInfo = REGIONS[activeRegion] || REGIONS.mind;

  return (
    <div className="min-h-screen flex flex-col bg-[#070a11] text-slate-100">
      {/* 1. Header & Quick HUD */}
      <Navbar
        player={player}
        activeTab={activeTab}
        onTabSelect={setActiveTab}
      />

      {/* 2. Main Workstation Area */}
      <main className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] w-full mx-auto">
        {/* Left / Center 3D World Viewport (7 Cols) */}
        <section className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex-1 min-h-[420px] rounded-2xl">
            <WorldCanvas
              activeRegion={activeRegion}
              onSelectRegion={handleSelectRegion}
            />
          </div>

          {/* Active Region Banner (Member 1) */}
          <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-l-4" style={{ borderLeftColor: currentRegionInfo.color }}>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Focused Realm</div>
              <h3 className="text-base font-bold text-slate-100">{currentRegionInfo.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{currentRegionInfo.description}</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                Governs: {currentRegionInfo.attribute}
              </span>
            </div>
          </div>
        </section>

        {/* Right 2D HUD Panel (5 Cols) */}
        <section className="lg:col-span-5 flex flex-col">
          {activeTab === 'quests' && (
            <QuestListPlaceholder
              activeRegion={activeRegion}
              onCompleteQuest={handleCompleteQuest}
            />
          )}

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
        </section>
      </main>
    </div>
  );
}
