import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Coins, Sparkles, Package, Check, AlertCircle, RefreshCw, Layers, Shield, Wand2, Trees } from 'lucide-react';
import { Api } from '../../services/api';

const RARITY_COLORS = {
  common: 'text-slate-400 border-slate-700 bg-slate-800/40',
  rare: 'text-sky-300 border-sky-500/40 bg-sky-500/10',
  epic: 'text-purple-300 border-purple-500/40 bg-purple-500/10',
  legendary: 'text-amber-300 border-amber-500/40 bg-amber-500/10',
};

const CATEGORY_ICONS = {
  pet: Sparkles,
  skin: Shield,
  decor: Trees,
  theme: Wand2,
};

export default function ShopPlaceholder({
  gold = 150,
  onBuyItem,
  onEquipChange,
  onOpenAuth,
  initialTab = 'catalog',
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'catalog' | 'inventory'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'pet' | 'skin' | 'decor'
  const [catalog, setCatalog] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buyingId, setBuyingId] = useState(null);
  const [equippingId, setEquippingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const isAuthenticated = Boolean(localStorage.getItem('lifecraft_token'));

  const fetchEconomyData = useCallback(async () => {
    setLoading(true);
    setFeedback(null);

    try {
      // 1. Fetch live catalog
      const items = await Api.economy.getItems();
      if (Array.isArray(items) && items.length > 0) {
        setCatalog(items);
      }
    } catch (err) {
      console.warn('[Shop] Could not load live catalog:', err.message);
    }

    // 2. Fetch user inventory if authenticated
    if (isAuthenticated) {
      try {
        const invData = await Api.economy.getInventory();
        const items = Array.isArray(invData) ? invData : (invData?.inventory || []);
        setInventory(items);
      } catch (err) {
        console.warn('[Shop] Could not load live inventory:', err.message);
      }
    }

    setLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    fetchEconomyData();
  }, [fetchEconomyData]);

  // Check if item is already owned
  const getOwnedInventoryItem = (itemId) => {
    return inventory.find((inv) => inv.itemId === itemId || inv.id === itemId);
  };

  const handlePurchase = async (item) => {
    setFeedback(null);
    setBuyingId(item.id);

    if (isAuthenticated) {
      try {
        const result = await Api.economy.buyItem(item.id);
        const newItem = result?.inventoryItem || {
          id: `inv-${Date.now()}`,
          itemId: item.id,
          name: item.name,
          category: item.category,
          slot: item.slot,
          price: item.price,
          regionTarget: item.regionTarget,
          assetKey: item.assetKey,
          rarity: item.rarity,
          isEquipped: false,
          acquiredAt: new Date().toISOString(),
        };

        setInventory((prev) => [newItem, ...prev]);
        onBuyItem?.({ ...item, remainingGold: result?.remainingGold });
        setFeedback({
          type: 'success',
          message: `Acquired ${item.name}! Added to your inventory.`,
        });
      } catch (err) {
        setFeedback({
          type: 'error',
          message: err.message || 'Purchase failed.',
        });
      } finally {
        setBuyingId(null);
      }
    } else {
      // Guest mode
      if (gold >= item.price) {
        onBuyItem?.(item);
        const guestItem = {
          id: `guest-${Date.now()}`,
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
          acquiredAt: new Date().toISOString(),
        };
        setInventory((prev) => [guestItem, ...prev]);
        setFeedback({
          type: 'success',
          message: `Acquired ${item.name}! (Note: Log in to save purchases permanently)`,
        });
      }
      setBuyingId(null);
    }
  };

  const handleEquipToggle = async (invItem) => {
    setFeedback(null);
    setEquippingId(invItem.id);

    if (isAuthenticated) {
      try {
        if (invItem.isEquipped) {
          const res = await Api.economy.unequipItem(invItem.id);
          setInventory((prev) =>
            prev.map((i) => (i.id === invItem.id ? { ...i, isEquipped: false } : i))
          );
          if (res?.equipped) {
            onEquipChange?.(res.equipped);
          }
          setFeedback({ type: 'success', message: `Unequipped ${invItem.name}.` });
        } else {
          const res = await Api.economy.equipItem(invItem.id);
          setInventory((prev) =>
            prev.map((i) => {
              if (i.slot === invItem.slot) {
                return { ...i, isEquipped: i.id === invItem.id };
              }
              return i;
            })
          );
          if (res?.equipped) {
            onEquipChange?.(res.equipped);
          }
          setFeedback({ type: 'success', message: `Equipped ${invItem.name} in your living diorama!` });
        }
      } catch (err) {
        setFeedback({ type: 'error', message: err.message || 'Could not update equipment' });
      } finally {
        setEquippingId(null);
      }
    } else {
      // Guest mode optimistic equip
      const nextEquipped = !invItem.isEquipped;
      setInventory((prev) =>
        prev.map((i) => {
          if (i.slot === invItem.slot) {
            return { ...i, isEquipped: i.id === invItem.id ? nextEquipped : false };
          }
          return i;
        })
      );
      // Dispatch optimistic slot update
      onEquipChange?.({
        [invItem.slot]: nextEquipped ? invItem.assetKey : (invItem.slot === 'skin' ? 'character-archer' : null),
      });
      setFeedback({ type: 'success', message: `${nextEquipped ? 'Equipped' : 'Unequipped'} ${invItem.name}.` });
      setEquippingId(null);
    }
  };

  // Filter items
  const filteredCatalog = catalog.filter((item) => {
    if (categoryFilter === 'all') return true;
    return item.category === categoryFilter || item.slot === categoryFilter;
  });

  const filteredInventory = inventory.filter((item) => {
    if (categoryFilter === 'all') return true;
    return item.category === categoryFilter || item.slot === categoryFilter;
  });

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-full space-y-4 max-h-[82vh] overflow-hidden">
      {/* Header & Balance */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-rpg tracking-wide">
              Realm Bazaar & Armory
            </h2>
            <p className="text-xs text-slate-400">
              Transform your 3D world with companion pets, skins, and heraldry
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchEconomyData}
            disabled={loading}
            title="Refresh shop & inventory"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-sm">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{gold} Gold</span>
          </div>
        </div>
      </div>

      {/* Guest Mode Notice */}
      {!isAuthenticated && (
        <div className="p-2.5 rounded-xl bg-indigo-950/50 border border-indigo-500/30 flex items-center justify-between text-xs text-indigo-300 flex-shrink-0">
          <span>Demo Mode: Purchases and equipped items will not persist across devices.</span>
          {onOpenAuth && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] ml-2 flex-shrink-0 transition"
            >
              Sign In
            </button>
          )}
        </div>
      )}

      {/* Tab Switcher: Catalog vs Backpack */}
      <div className="flex p-1 bg-slate-950/70 rounded-xl border border-slate-800 text-xs font-semibold flex-shrink-0">
        <button
          onClick={() => { setActiveTab('catalog'); setFeedback(null); }}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'catalog'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Shop Catalog</span>
        </button>
        <button
          onClick={() => { setActiveTab('inventory'); setFeedback(null); }}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'inventory'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>My Backpack ({inventory.length})</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex space-x-1.5 text-[11px] font-semibold flex-shrink-0 overflow-x-auto scrollbar-none py-0.5">
        {[
          { key: 'all', label: 'All Items' },
          { key: 'pet', label: 'Companion Pets' },
          { key: 'skin', label: 'Character Skins' },
          { key: 'decor', label: 'World Decor' },
        ].map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setCategoryFilter(cat.key)}
            className={`px-2.5 py-1 rounded-lg border transition ${
              categoryFilter === cat.key
                ? 'bg-slate-800 text-slate-100 border-indigo-500/50'
                : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Feedback Alert Toast */}
      {feedback && (
        <div
          className={`p-2.5 rounded-xl border text-xs flex items-center space-x-2 flex-shrink-0 transition animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Tab Content */}
      {activeTab === 'catalog' ? (
        /* Catalog Items List */
        <div className="space-y-3 overflow-y-auto flex-1 pr-1 scrollbar-none">
          {filteredCatalog.map((item) => {
            const ownedInv = getOwnedInventoryItem(item.id);
            const canAfford = gold >= item.price;
            const isProcessing = buyingId === item.id;
            const Icon = CATEGORY_ICONS[item.category] || Sparkles;
            const rarityStyle = RARITY_COLORS[item.rarity] || RARITY_COLORS.rare;

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/90 flex items-center justify-between transition hover:border-slate-700 shadow-sm"
              >
                <div className="space-y-1 max-w-[65%]">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-300 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-100">{item.name}</span>
                    <span className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded border ${rarityStyle}`}>
                      {item.rarity || 'rare'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center space-x-2 pt-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/50">
                      Slot: {item.slot || item.category}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-1.5 flex-shrink-0">
                  {ownedInv ? (
                    <button
                      type="button"
                      onClick={() => handleEquipToggle(ownedInv)}
                      disabled={equippingId === ownedInv.id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                        ownedInv.isEquipped
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                          : 'bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/40'
                      }`}
                    >
                      {ownedInv.isEquipped ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Equipped</span>
                        </>
                      ) : (
                        <span>Equip</span>
                      )}
                    </button>
                  ) : (
                    <button
                      disabled={!canAfford || isProcessing}
                      onClick={() => handlePurchase(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                        canAfford && !isProcessing
                          ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/30 hover:from-amber-500/30 hover:to-amber-600/40 text-amber-300 border border-amber-500/50 shadow-sm'
                          : 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-800'
                      }`}
                    >
                      {isProcessing ? (
                        <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          <span>{item.price} G</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Inventory Items List */
        <div className="space-y-3 overflow-y-auto flex-1 pr-1 scrollbar-none">
          {filteredInventory.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs space-y-2">
              <Package className="w-8 h-8 mx-auto text-slate-600" />
              <p>No cosmetics found in this category.</p>
              <p className="text-[11px] text-slate-600">
                Explore the Shop Catalog to acquire companion pets and character skins!
              </p>
            </div>
          ) : (
            filteredInventory.map((inv) => {
              const Icon = CATEGORY_ICONS[inv.category] || Layers;
              const isEquipping = equippingId === inv.id;

              return (
                <div
                  key={inv.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                    inv.isEquipped
                      ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1 max-w-[70%]">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-300 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-100">{inv.name}</span>
                      {inv.isEquipped && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    {inv.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 leading-relaxed">
                        {inv.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 pt-0.5 text-[10px] text-slate-400">
                      <span className="uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700/50">
                        Slot: {inv.slot || inv.category}
                      </span>
                      {inv.rarity && (
                        <span className="uppercase font-mono text-slate-400">{inv.rarity}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEquipToggle(inv)}
                      disabled={isEquipping}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                        inv.isEquipped
                          ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                      }`}
                    >
                      {isEquipping ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : inv.isEquipped ? (
                        <span>Unequip</span>
                      ) : (
                        <span>Equip to Diorama</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Footer info without developer copy */}
      <div className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-800 flex items-center justify-center space-x-1.5">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>Cosmetics visibly transform your player avatar, companion pet, and living world diorama.</span>
      </div>
    </div>
  );
}
