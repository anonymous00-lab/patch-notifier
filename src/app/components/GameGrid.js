'use client';

import { useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import GameCard from './GameCard';

export default function GameGrid({
  games = [],
  subscribedGameIds = new Set(),
  onToggleSubscription,
  searchQuery: externalQuery,
  onSearchChange: externalOnChange,
}) {
  const [internalQuery, setInternalQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [gridRef] = useAutoAnimate();

  const searchQuery =
    externalQuery !== undefined ? externalQuery : internalQuery;
  const onSearchChange = externalOnChange || setInternalQuery;

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'steam', label: 'Steam' },
    { id: 'scraper', label: 'Scraper' },
  ];

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === 'all' ||
      game.source_type?.toLowerCase() === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 w-full">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            id="game-search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search games..."
            className="search-input w-full pl-10 pr-4 py-2.5 rounded-lg"
          />
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {filters.map((filter) => (
            <button
              key={filter.id}
              id={`filter-${filter.id}`}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeFilter === filter.id
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'bg-white/5 text-muted border border-white/10 hover:text-foreground hover:border-white/20'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Game Grid */}
      {filteredGames.length > 0 ? (
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game, index) => (
            <div
              key={game.slug || game.id}
              className="animate-fadeIn"
              style={{
                animationDelay: `${index * 0.05}s`,
                animationFillMode: 'both',
              }}
            >
              <GameCard
                game={game}
                isSubscribed={subscribedGameIds.has(game.id)}
                onToggle={onToggleSubscription}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4 opacity-40">🔍</div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No games found
          </h3>
          <p className="text-muted text-sm">
            Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}
