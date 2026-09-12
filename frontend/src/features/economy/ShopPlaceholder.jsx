import React from 'react';
import { ShoppingBag, Coins, Sparkles } from 'lucide-react';

/**
 * Economy & Rewards Shop Module (Owned by Member 3)
 * 
 * Displays available shop items, cosmetic unlocks, and buy actions.
 */
export default function ShopPlaceholder({ gold = 75, onBuyItem }) {
  const shopItems = [
    {
      id: '1',
      name: 'Astral Knowledge Orb',
      region: 'Mind Realm',
      price: 100,
      description: 'Glows with celestial blue light when study streaks are maintained.',
    },
    {
      id: '2',
      name: 'Titan Monolith',
      region: 'Body Realm',
      price: 150,
      description: 'An imposing obsidian monolith in the physical world quadrant.',
    },
    {
      id: '3',
      name: 'Cyber Node Lattice',
      region: 'Craft Realm',
      price: 200,
      description: 'Pulsing wireframe node that activates during code quests.',
    },
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
          <ShoppingBag className="w-5 h-5 text-amber-400" />
          <span>Realm Shop</span>
        </h2>
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
          <Coins className="w-4 h-4 text-amber-400" />
          <span>{gold} Gold</span>
        </div>
      </div>

      {/* Items Grid */}
      <div className="space-y-3 overflow-y-auto flex-1">
        {shopItems.map((item) => {
          const canAfford = gold >= item.price;
          return (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
            >
              <div className="space-y-1 max-w-[70%]">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-sm font-semibold text-slate-200">{item.name}</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1">{item.description}</p>
                <span className="inline-block text-[10px] text-slate-500 uppercase font-semibold">
                  Target: {item.region}
                </span>
              </div>

              <button
                disabled={!canAfford}
                onClick={() => onBuyItem?.(item)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                  canAfford
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
                }`}
              >
                <Coins className="w-3 h-3" />
                <span>{item.price} G</span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="text-[11px] text-slate-500 italic text-center pt-2 border-t border-slate-800">
        Owned by Member 3 &bull; Hook with `/api/economy/items` & `/api/economy/buy`
      </div>
    </div>
  );
}
