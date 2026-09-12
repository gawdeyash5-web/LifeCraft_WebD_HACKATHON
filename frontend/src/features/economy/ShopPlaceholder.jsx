import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Coins, Sparkles, Package, Check, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { Api } from '../../services/api';

const DEFAULT_CATALOG = [
  {
    id: 'catalog-1',
    name: 'Astral Knowledge Orb',
    regionTarget: 'mind',
    price: 100,
    type: 'cosmetic',
    description: 'A shimmering blue orb that hovers over the Mind Island.',
  },
  {
    id: 'catalog-2',
    name: 'Titan Obelisk',
    regionTarget: 'body',
    price: 150,
    type: 'cosmetic',
    description: 'A towering monolith radiating crimson energy for the Body Island.',
  },
  {
    id: 'catalog-3',
    name: 'Cyber Matrix Node',
    regionTarget: 'craft',
    price: 200,
    type: 'cosmetic',
    description: 'An animated wireframe beacon for the Craft & Coding Island.',
  },
  {
    id: 'catalog-4',
    name: 'Crown of Discipline',
    regionTarget: 'avatar',
    price: 300,
    type: 'cosmetic',
    description: 'A gold aura that crowns your avatar.',
  },
];

/**
 * Economy & Rewards Shop Module (Owned by Member 3)
 * 
 * Displays live shop catalog, executes atomic purchases,
 * and tracks acquired inventory items.
 */
export default function ShopPlaceholder({ gold = 75, onBuyItem }) {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'inventory'
  const [catalog, setCatalog] = useState(DEFAULT_CATALOG);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buyingId, setBuyingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const fetchEconomyData = useCallback(async () => {
    setLoading(true);
    setFeedback(null);

    // 1. Fetch catalog items
    try {
      const items = await Api.economy.getItems();
      if (Array.isArray(items) && items.length > 0) {
        setCatalog(items);
      }
    } catch (err) {
      console.warn('[Shop] Could not load live catalog, using default items:', err.message);
    }

    // 2. Fetch user inventory if token exists
    const token = localStorage.getItem('lifecraft_token');
    if (token) {
      try {
        const invData = await Api.economy.getInventory();
        const items = Array.isArray(invData) ? invData : (invData?.inventory || []);
        setInventory(items);
      } catch (err) {
        console.warn('[Shop] Could not load live inventory:', err.message);
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEconomyData();
  }, [fetchEconomyData]);

  // Check if item is already owned
  const isItemOwned = (itemId) => {
    return inventory.some((inv) => inv.itemId === itemId || inv.id === itemId);
  };

  const handlePurchase = async (item) => {
    setFeedback(null);
    setBuyingId(item.id);

    const token = localStorage.getItem('lifecraft_token');

    if (token) {
      try {
        const result = await Api.economy.buyItem(item.id);
        const newItem = result?.inventoryItem || {
          id: `inv-${Date.now()}`,
          itemId: item.id,
          name: item.name,
          price: item.price,
          regionTarget: item.regionTarget,
          acquiredAt: new Date().toISOString(),
        };

        setInventory((prev) => [newItem, ...prev]);
        onBuyItem?.(item);
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
      // Guest mode: local optimistic purchase
      if (gold >= item.price) {
        onBuyItem?.(item);
        const guestItem = {
          id: `guest-${Date.now()}`,
          itemId: item.id,
          name: item.name,
          price: item.price,
          regionTarget: item.regionTarget,
          acquiredAt: new Date().toISOString(),
        };
        setInventory((prev) => [guestItem, ...prev]);
        setFeedback({
          type: 'success',
          message: `Purchased ${item.name}! (Guest mode: log in to persist to PostgreSQL)`,
        });
      }
      setBuyingId(null);
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col h-full space-y-4">
      {/* Header & Balance */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-slate-100">Realm Economy</h2>
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
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{gold} Gold</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher: Catalog vs Inventory */}
      <div className="flex p-1 bg-slate-950/70 rounded-xl border border-slate-800 text-xs font-semibold">
        <button
          onClick={() => { setActiveTab('catalog'); setFeedback(null); }}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'catalog'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Shop Catalog ({catalog.length})</span>
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

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center space-x-2 transition ${
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

      {/* Tab Content */}
      {activeTab === 'catalog' ? (
        /* Catalog Items List */
        <div className="space-y-3 overflow-y-auto flex-1 max-h-[380px] pr-1">
          {catalog.map((item) => {
            const owned = isItemOwned(item.id);
            const canAfford = gold >= item.price;
            const isProcessing = buyingId === item.id;

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between transition hover:border-slate-700/80"
              >
                <div className="space-y-1 max-w-[65%]">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-sm font-semibold text-slate-200">{item.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                  <div className="flex items-center space-x-2 pt-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/50">
                      Realm: {item.regionTarget || item.region || 'General'}
                    </span>
                    {item.type && (
                      <span className="text-[10px] text-indigo-300 uppercase font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                        {item.type}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {owned ? (
                    <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Owned</span>
                    </div>
                  ) : (
                    <button
                      disabled={!canAfford || isProcessing}
                      onClick={() => handlePurchase(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                        canAfford && !isProcessing
                          ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-sm'
                          : 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-800'
                      }`}
                    >
                      {isProcessing ? (
                        <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Coins className="w-3 h-3" />
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
        <div className="space-y-3 overflow-y-auto flex-1 max-h-[380px] pr-1">
          {inventory.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs space-y-2">
              <Package className="w-8 h-8 mx-auto text-slate-600" />
              <p>Your backpack is empty.</p>
              <p className="text-[11px] text-slate-600">
                Visit the Shop Catalog to unlock realm cosmetics with your gold!
              </p>
            </div>
          ) : (
            inventory.map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-indigo-500/20 flex items-center justify-between"
              >
                <div className="space-y-1 max-w-[75%]">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-sm font-semibold text-slate-200">
                      {inv.name || 'Realm Artifact'}
                    </span>
                  </div>
                  {inv.description && (
                    <p className="text-xs text-slate-400 line-clamp-1">{inv.description}</p>
                  )}
                  <div className="flex items-center space-x-2 pt-0.5 text-[10px] text-slate-400">
                    <span className="uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700/50">
                      Realm: {inv.regionTarget || 'General'}
                    </span>
                    {inv.acquiredAt && (
                      <span className="text-slate-500">
                        Acquired: {new Date(inv.acquiredAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                    Unlocked
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="text-[11px] text-slate-500 italic text-center pt-2 border-t border-slate-800">
        Owned by Member 3 &bull; Atomic PostgreSQL Transactions
      </div>
    </div>
  );
}
