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
import { fetchQuests } from './features/quests/questService';
import { calculateLevelProgression } from './utils/progression';
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
  const [quests, setQuests] = useState([]);
  const [initialCreateQuest, setInitialCreateQuest] = useState(false);

  // Developer View & Visual Preview State (Decoupled from real progression)
  const [isDevPasscodeOpen, setIsDevPasscodeOpen] = useState(false);
  const [isDeveloperViewOpen, setIsDeveloperViewOpen] = useState(false);
  const [devPreview, setDevPreview] = useState({
    active: false,
    levels: { mind: null, body: null, craft: null },
    expansions: { mind_library: null, body_coliseum: null, craft_foundry: null },
  });

  // Load authoritative quests from backend or resilient local fallback
  const loadQuests = useCallback(async () => {
    try {
      const data = await fetchQuests();
      if (Array.isArray(data)) {
        setQuests(data);
      }
    } catch (err) {
      console.warn('[App] Could not load quests:', err.message);
    }
  }, []);

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
          totalXp: data.totalXp ?? prev.totalXp,
          currentLevelBaseXp: data.currentLevelBaseXp ?? prev.currentLevelBaseXp,
          gold: data.gold ?? prev.gold,
          streak: data.streak ?? prev.streak,
          mindXp: data.mindXp,
          bodyXp: data.bodyXp,
          craftXp: data.craftXp,
          attributes: data.attributes || prev.attributes,
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
        loadQuests();
      }
    } catch (err) {
      console.warn('[App] Could not hydrate profile from backend:', err.message);
    }
  }, [setAllLevels, loadQuests]);

  useEffect(() => {
    hydratePlayerProfile();
    loadQuests();
  }, [hydratePlayerProfile, loadQuests]);

  // Handle region focus from 3D world click or bottom dock
  const handleSelectRegion = useCallback((regionId) => {
    setActiveRegion(regionId);
    if (regionId) {
      setPlayer((prev) => (prev.activeRegion === regionId ? prev : { ...prev, activeRegion: regionId }));
    }
  }, []);

  // Quest completion handler with authoritative backend synchronization & excess XP carryover
  const handleCompleteQuest = async (questOrResult) => {
    const completedId = questOrResult?.id || questOrResult?.quest?.id;
    let playerUpdate = questOrResult?.player;

    if (!playerUpdate && completedId) {
      try {
        const res = await Api.quests.complete(completedId);
        if (res?.player) {
          playerUpdate = res.player;
        }
      } catch (err) {
        console.warn('[App] Quest complete API call failed, applying fallback:', err.message);
      }
    }

    if (playerUpdate) {
      setPlayer((prev) => ({
        ...prev,
        level: playerUpdate.level ?? prev.level,
        xp: playerUpdate.xp ?? prev.xp,
        gold: playerUpdate.gold ?? prev.gold,
        nextLevelXp: playerUpdate.nextLevelXp ?? prev.nextLevelXp,
        totalXp: playerUpdate.totalXp ?? prev.totalXp,
        currentLevelBaseXp: playerUpdate.currentLevelBaseXp ?? prev.currentLevelBaseXp,
      }));
      setAllLevels({
        mind: playerUpdate.mindLevel ?? playerUpdate.mind_level ?? 1,
        body: playerUpdate.bodyLevel ?? playerUpdate.body_level ?? 1,
        craft: playerUpdate.craftLevel ?? playerUpdate.craft_level ?? 1,
      });
      if (playerUpdate.masteryExpansions) {
        setMasteryExpansions(playerUpdate.masteryExpansions);
      }
    } else {
      // Pure fallback progression calculation carrying excess XP forward
      const xpGain = questOrResult?.xp_reward ?? questOrResult?.xpReward ?? 50;
      const goldGain = questOrResult?.gold_reward ?? questOrResult?.goldReward ?? 25;
      setPlayer((prev) => {
        const currentBase = prev.currentLevelBaseXp || 0;
        const currentTotal = (prev.totalXp ?? (currentBase + prev.xp)) + xpGain;
        const prog = calculateLevelProgression(currentTotal);
        return {
          ...prev,
          level: prog.level,
          xp: prog.currentLevelXp,
          nextLevelXp: prog.nextLevelThreshold,
          totalXp: currentTotal,
          currentLevelBaseXp: prog.currentLevelBaseXp,
          gold: prev.gold + goldGain,
        };
      });
    }

    // Mark completed locally immediately to avoid UI lag and re-fetch
    if (completedId) {
      setQuests((prev) =>
        prev.map((q) =>
          q.id === completedId
            ? { ...q, completed: true, completed_at: new Date().toISOString() }
            : q
        )
      );
    }
    loadQuests();
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
    loadQuests();
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
    // If player is currently focused on an expansion that was only in preview, return to main island
    if (activeRegion && ['mind_library', 'body_coliseum', 'craft_foundry'].includes(activeRegion)) {
      if (!masteryExpansions.includes(activeRegion)) {
        setActiveRegion(null);
      }
    }
  };

  // Compute Effective Realm Levels (Real Authoritative vs Developer Preview)
  const effectiveRealmLevels = React.useMemo(() => {
    if (!devPreview.active) return realmLevels;
    return {
      mind: devPreview.levels.mind ?? realmLevels.mind ?? 1,
      body: devPreview.levels.body ?? realmLevels.body ?? 1,
      craft: devPreview.levels.craft ?? realmLevels.craft ?? 1,
    };
  }, [devPreview.active, devPreview.levels.mind, devPreview.levels.body, devPreview.levels.craft, realmLevels]);

  // Compute Effective Mastery Expansions (Real Authoritative vs Developer Preview)
  const effectiveMasteryExpansions = React.useMemo(() => {
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
  }, [devPreview.active, devPreview.expansions, masteryExpansions]);

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

        {/* Developer Preview Active HUD Floating Badge */}
        {devPreview.active && (
          <div className="absolute top-14 left-4 md:left-52 z-20 flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md border border-amber-500/50 px-3 py-1.5 rounded-xl text-xs font-mono text-amber-300 shadow-xl pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-bold">DEV PREVIEW ACTIVE</span>
            <button
              type="button"
              onClick={handleResetPreview}
              className="ml-2 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 text-[10px] font-bold border border-amber-500/40 transition"
            >
              Reset Preview
            </button>
          </div>
        )}

        {/* 3. Floating Left Sidebar */}
        <SidebarNav
          activeTab={activeTab}
          onTabSelect={(tab) => {
            if (tab === 'quests') setInitialCreateQuest(false);
            setActiveTab(tab);
          }}
          onOpenDeveloperView={handleOpenDeveloperView}
        />

        {/* 4. Floating Right Panel: Today's Quests & Player Stats */}
        <RightOverlayDrawer
          player={player}
          quests={quests}
          activeRegion={activeRegion}
          onCompleteQuest={handleCompleteQuest}
          onOpenStats={() => setActiveTab('stats')}
          onOpenQuests={() => {
            setInitialCreateQuest(false);
            setActiveTab('quests');
          }}
          onOpenCreateQuest={() => {
            setInitialCreateQuest(true);
            setActiveTab('quests');
          }}
        />

        {/* 5. Floating Bottom Dock: 3 Realm Preview Cards & Utilities */}
        <BottomRealmDock
          activeRegion={activeRegion}
          onSelectRegion={handleSelectRegion}
          realmLevels={effectiveRealmLevels}
          masteryExpansions={effectiveMasteryExpansions}
          onOpenShop={() => setActiveTab('shop')}
          onOpenInventory={() => setActiveTab('inventory')}
          onOpenAchievements={() => setActiveTab('achievements')}
        />

        {/* Modal Overlay for Realm Shop, Backpack Inventory, Character Stats, or Quests */}
        {(activeTab === 'shop' || activeTab === 'inventory' || activeTab === 'stats' || activeTab === 'quests') && (
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => {
              setInitialCreateQuest(false);
              setActiveTab('home');
            }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full ${activeTab === 'quests' || activeTab === 'shop' || activeTab === 'inventory' ? 'max-w-2xl' : 'max-w-md'} flex flex-col items-end`}
            >
              {/* Standalone clean Close Button positioned above panel */}
              <div className="mb-2">
                <CloseButton onClose={() => { setInitialCreateQuest(false); setActiveTab('home'); }} />
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
                    onQuestChange={loadQuests}
                    initialCreate={initialCreateQuest}
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
