import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import SidebarNav from './components/SidebarNav';
import RightOverlayDrawer from './components/RightOverlayDrawer';
import BottomRealmDock from './components/BottomRealmDock';
import WorldCanvas from './features/world/WorldCanvas';
import PlayerStatsPlaceholder from './features/player/PlayerStatsPlaceholder';
import ShopPlaceholder from './features/economy/ShopPlaceholder';
import QuestListPlaceholder from './features/quests/QuestListPlaceholder';
import AchievementsModal from './features/player/AchievementsModal';
import EventsModal from './features/player/EventsModal';
import AuthModal from './features/player/AuthModal';
import CloseButton from './components/CloseButton';
import { INITIAL_PLAYER_STATE } from './utils/contracts';
import useRealmLevels from './features/world/hooks/useRealmLevels';
import { Api } from './services/api';
import DeveloperPasscodeModal from './features/developer/DeveloperPasscodeModal';
import DeveloperViewModal from './features/developer/DeveloperViewModal';

/**
 * LIFECRAFT Root Application Layout
 * 
 * Immersive full-viewport 3D world as the visual HERO, with glassmorphic
 * Left Sidebar, Right Quest/Stats Drawer, and Bottom Realm Dock floating over it.
 * Authoritative integration with backend persistence, inventory, achievements, and cosmetics.
 */
export default function App() {
  const { realmLevels, setAllLevels } = useRealmLevels();
  const [player, setPlayer] = useState({
    ...INITIAL_PLAYER_STATE,
    level: 1,
    xp: 0,
    nextLevelXp: 100,
    gold: 150,
    streak: 1,
    username: 'Adventurer',
  });
  const [equippedCosmetics, setEquippedCosmetics] = useState({
    skin: null,
    pet: null,
    decor: null,
  });
  const [masteryExpansions, setMasteryExpansions] = useState([]);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'quests' | 'inventory' | 'shop' | 'stats' | 'achievements' | 'events'
  const [activeRegion, setActiveRegion] = useState(null); // Starts in central plaza home overview
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Developer View & Visual Preview State (Decoupled from real progression)
  const [isDevPasscodeOpen, setIsDevPasscodeOpen] = useState(false);
  const [isDeveloperViewOpen, setIsDeveloperViewOpen] = useState(false);
  const [devPreview, setDevPreview] = useState({
    active: false,
    levels: { mind: null, body: null, craft: null },
    expansions: { mind_library: null, body_coliseum: null, craft_foundry: null },
  });

  // Hydrate user profile, realm levels, equipped cosmetics, and mastery expansions from backend
  const hydratePlayerProfile = useCallback(async () => {
    const token = localStorage.getItem('lifecraft_token');
    if (!token) return;
    try {
      const data = await Api.player.getMe();
      if (data) {
        setPlayer((prev) => ({
          ...prev,
          username: data.username || prev.username,
          level: data.level ?? prev.level,
          xp: data.xp ?? prev.xp,
          nextLevelXp: data.nextLevelXp ?? prev.nextLevelXp,
          gold: data.gold ?? prev.gold,
          streak: data.streak ?? prev.streak,
          mindXp: data.mindXp,
          bodyXp: data.bodyXp,
          craftXp: data.craftXp,
        }));
        if (data.realmLevels) {
          setAllLevels(data.realmLevels);
        } else if (data.mindLevel || data.bodyLevel || data.craftLevel) {
          setAllLevels({
            mind: data.mindLevel || 1,
            body: data.bodyLevel || 1,
            craft: data.craftLevel || 1,
          });
        }
        if (data.equipped) {
          setEquippedCosmetics(data.equipped);
        }
        if (Array.isArray(data.masteryExpansions)) {
          setMasteryExpansions(data.masteryExpansions);
        }
      }
    } catch (err) {
      console.warn('[App] Could not hydrate profile from backend:', err.message);
    }
  }, [setAllLevels]);

  useEffect(() => {
    hydratePlayerProfile();
  }, [hydratePlayerProfile]);

  // Handle region focus from 3D world click or bottom dock
  const handleSelectRegion = (regionId) => {
    setActiveRegion(regionId);
    if (regionId) {
      setPlayer((prev) => ({ ...prev, activeRegion: regionId }));
    }
  };

  // Quest completion handler with authoritative backend synchronization
  const handleCompleteQuest = async (questOrResult) => {
    if (questOrResult?.player) {
      const p = questOrResult.player;
      setPlayer((prev) => ({
        ...prev,
        level: p.level ?? prev.level,
        xp: p.xp ?? prev.xp,
        gold: p.gold ?? prev.gold,
        nextLevelXp: p.nextLevelXp ?? prev.nextLevelXp,
      }));
      setAllLevels({
        mind: p.mindLevel ?? p.mind_level ?? 1,
        body: p.bodyLevel ?? p.body_level ?? 1,
        craft: p.craftLevel ?? p.craft_level ?? 1,
      });
      if (p.masteryExpansions) {
        setMasteryExpansions(p.masteryExpansions);
      }
      return;
    }

    if (questOrResult?.id) {
      try {
        const res = await Api.quests.complete(questOrResult.id);
        if (res?.player) {
          const p = res.player;
          setPlayer((prev) => ({
            ...prev,
            level: p.level ?? prev.level,
            xp: p.xp ?? prev.xp,
            gold: p.gold ?? prev.gold,
            nextLevelXp: p.nextLevelXp ?? prev.nextLevelXp,
          }));
          setAllLevels({
            mind: p.mindLevel ?? p.mind_level ?? 1,
            body: p.bodyLevel ?? p.body_level ?? 1,
            craft: p.craftLevel ?? p.craft_level ?? 1,
          });
          if (p.masteryExpansions) {
            setMasteryExpansions(p.masteryExpansions);
          }
          return;
        }
      } catch (err) {
        console.warn('[App] Quest complete API call failed, applying fallback:', err.message);
      }
    }

    setPlayer((prev) => ({
      ...prev,
      xp: prev.xp + (questOrResult?.xpReward || 50),
      gold: prev.gold + (questOrResult?.goldReward || 25),
    }));
  };

  // Item buy handler
  const handleBuyItem = (item) => {
    if (item?.remainingGold !== undefined) {
      setPlayer((prev) => ({ ...prev, gold: item.remainingGold }));
    } else if (player.gold >= item.price) {
      setPlayer((prev) => ({
        ...prev,
        gold: prev.gold - item.price,
      }));
    }
  };

  // Cosmetic equip handler
  const handleEquipChange = (equipped) => {
    if (equipped) {
      setEquippedCosmetics(equipped);
    }
  };

  // Auth success handler
  const handleAuthSuccess = () => {
    hydratePlayerProfile();
  };

  // Developer View Handlers (Isolated visual simulation)
  const handleOpenDeveloperView = () => {
    setIsDevPasscodeOpen(true);
  };

  const handlePasscodeSuccess = () => {
    setIsDeveloperViewOpen(true);
  };

  const handleUpdatePreviewLevel = (realm, level) => {
    setDevPreview((prev) => ({
      ...prev,
      active: true,
      levels: {
        ...prev.levels,
        [realm]: level,
      },
    }));
  };

  const handleTogglePreviewExpansion = (expansionKey, unlocked) => {
    setDevPreview((prev) => ({
      ...prev,
      active: true,
      expansions: {
        ...prev.expansions,
        [expansionKey]: unlocked,
      },
    }));
  };

  const handleResetPreview = () => {
    setDevPreview({
      active: false,
      levels: { mind: null, body: null, craft: null },
      expansions: { mind_library: null, body_coliseum: null, craft_foundry: null },
    });
  };

  // Compute Effective Realm Levels (Real Authoritative vs Developer Preview)
  const effectiveRealmLevels = devPreview.active
    ? {
        mind: devPreview.levels.mind ?? realmLevels.mind ?? 1,
        body: devPreview.levels.body ?? realmLevels.body ?? 1,
        craft: devPreview.levels.craft ?? realmLevels.craft ?? 1,
      }
    : realmLevels;

  // Compute Effective Mastery Expansions (Real Authoritative vs Developer Preview)
  const effectiveMasteryExpansions = (() => {
    if (!devPreview.active) return masteryExpansions;
    let list = [...masteryExpansions];
    ['mind_library', 'body_coliseum', 'craft_foundry'].forEach((key) => {
      const override = devPreview.expansions[key];
      if (override === true && !list.includes(key)) {
        list.push(key);
      } else if (override === false) {
        list = list.filter((k) => k !== key);
      }
    });
    return list;
  })();

  // Keyboard Escape listener to close open modal panels
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveTab('home');
      }
    };
    if (activeTab !== 'home') {
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
            realmLevels={effectiveRealmLevels}
            equippedSkin={equippedCosmetics.skin}
            equippedPet={equippedCosmetics.pet}
            equippedDecor={equippedCosmetics.decor}
            masteryExpansions={effectiveMasteryExpansions}
          />
        </div>

        {/* 3. Floating Left Sidebar */}
        <SidebarNav
          activeTab={activeTab}
          onTabSelect={setActiveTab}
          onOpenDeveloperView={handleOpenDeveloperView}
        />

        {/* 4. Floating Right Panel: Today's Quests & Player Stats */}
        <RightOverlayDrawer
          player={player}
          activeRegion={activeRegion}
          onCompleteQuest={handleCompleteQuest}
          onOpenStats={() => setActiveTab('stats')}
          onOpenQuests={() => setActiveTab('quests')}
        />

        {/* 5. Floating Bottom Dock: 3 Realm Preview Cards & Utilities */}
        <BottomRealmDock
          activeRegion={activeRegion}
          onSelectRegion={handleSelectRegion}
          realmLevels={realmLevels}
          onOpenShop={() => setActiveTab('shop')}
          onOpenInventory={() => setActiveTab('inventory')}
          onOpenAchievements={() => setActiveTab('achievements')}
        />

        {/* Modal Overlay for Realm Shop, Backpack Inventory, Character Stats, or Quests */}
        {(activeTab === 'shop' || activeTab === 'inventory' || activeTab === 'stats' || activeTab === 'quests') && (
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setActiveTab('home')}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full ${activeTab === 'quests' || activeTab === 'shop' || activeTab === 'inventory' ? 'max-w-2xl' : 'max-w-md'} flex flex-col items-end`}
            >
              {/* Standalone clean Close Button positioned above panel */}
              <div className="mb-2">
                <CloseButton onClose={() => setActiveTab('home')} />
              </div>
              <div className="w-full max-h-[82vh] overflow-y-auto rounded-2xl shadow-2xl">
                {(activeTab === 'shop' || activeTab === 'inventory') && (
                  <ShopPlaceholder
                    gold={player.gold}
                    initialTab={activeTab === 'inventory' ? 'inventory' : 'catalog'}
                    onBuyItem={handleBuyItem}
                    onEquipChange={handleEquipChange}
                    onOpenAuth={() => setIsAuthModalOpen(true)}
                  />
                )}
                {activeTab === 'stats' && (
                  <PlayerStatsPlaceholder
                    player={player}
                    onOpenDeveloperView={handleOpenDeveloperView}
                  />
                )}
                {activeTab === 'quests' && (
                  <QuestListPlaceholder
                    activeRegion={activeRegion}
                    onCompleteQuest={handleCompleteQuest}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Standalone Achievements Modal */}
        <AchievementsModal
          isOpen={activeTab === 'achievements'}
          onClose={() => setActiveTab('home')}
        />

        {/* Standalone Events Activity Modal */}
        <EventsModal
          isOpen={activeTab === 'events'}
          onClose={() => setActiveTab('home')}
        />

        {/* Global Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />

        {/* Developer View Passcode Challenge Modal */}
        <DeveloperPasscodeModal
          isOpen={isDevPasscodeOpen}
          onClose={() => setIsDevPasscodeOpen(false)}
          onSuccess={handlePasscodeSuccess}
        />

        {/* Protected Developer View Inspector */}
        <DeveloperViewModal
          isOpen={isDeveloperViewOpen}
          onClose={() => setIsDeveloperViewOpen(false)}
          realRealmLevels={realmLevels}
          realMasteryExpansions={masteryExpansions}
          previewState={devPreview}
          onUpdatePreviewLevel={handleUpdatePreviewLevel}
          onTogglePreviewExpansion={handleTogglePreviewExpansion}
          onResetPreview={handleResetPreview}
        />
      </div>
    </div>
  );
}
