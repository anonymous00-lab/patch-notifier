'use client';

import { useState } from 'react';

export default function GameCard({ game, isSubscribed = false, onToggle }) {
  const [isHoveredOnSubscribed, setIsHoveredOnSubscribed] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const gameColor = game.embed_color || '#5865F2';

  const sourceBadgeColors = {
    steam: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    scraper: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    rss: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };

  const badgeClass =
    sourceBadgeColors[game.source_type?.toLowerCase()] ||
    sourceBadgeColors.steam;

  return (
    <div
      id={`game-card-${game.slug || game.id}`}
      className="glass-card overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:border-card-hover-border"
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
      style={{
        '--game-color': gameColor,
        boxShadow: isCardHovered
          ? `0 0 25px ${gameColor}40, 0 0 50px ${gameColor}1A`
          : 'none',
      }}
    >
      {/* Game Image */}
      <div className="relative h-44 overflow-hidden group/image bg-surface">
        {game.image_url ? (
          <>
            <img
              src={game.image_url}
              alt={game.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div style={{display: 'none'}} className="w-full h-full bg-gradient-to-br from-[var(--game-color)] to-surface/20 flex items-center justify-center">
              <span className="text-5xl font-bold text-white/40">{game.name?.charAt(0)}</span>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--game-color)] to-surface/20 flex items-center justify-center">
            <span className="text-5xl font-bold text-white/40">{game.name?.charAt(0)}</span>
          </div>
        )}
        {/* Gradient overlay fading to card bg */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg text-foreground leading-tight">
            {game.name}
          </h3>
          <span
            className={`source-badge text-xs px-2 py-0.5 rounded-full border whitespace-nowrap ${badgeClass}`}
          >
            {game.source_type || 'Steam'}
          </span>
        </div>

        {game.description && (
          <p className="text-sm text-muted line-clamp-2">
            {game.description}
          </p>
        )}

        {onToggle && (
          <button
            id={`subscribe-btn-${game.id}`}
            onClick={() => onToggle(game.id)}
            onMouseEnter={() => isSubscribed && setIsHoveredOnSubscribed(true)}
            onMouseLeave={() => setIsHoveredOnSubscribed(false)}
            className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              isSubscribed
                ? isHoveredOnSubscribed
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'btn-primary'
            }`}
          >
            {isSubscribed
              ? isHoveredOnSubscribed
                ? 'Unsubscribe'
                : 'Subscribed ✓'
              : 'Subscribe'}
          </button>
        )}
      </div>
    </div>
  );
}
