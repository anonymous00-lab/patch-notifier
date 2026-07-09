'use client';

import { useState, useEffect } from 'react';
import GameGrid from '../components/GameGrid';

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/games')
      .then((res) => res.json())
      .then((data) => {
        setGames(Array.isArray(data) ? data : data.games || []);
      })
      .catch((err) => console.error('Failed to fetch games:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12 animate-fadeIn">
        <h1 className="text-4xl sm:text-5xl font-bold gradient-text-hero mb-4">
          Game Catalog
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Browse all the games we track. Head to the{' '}
          <a href="/setup" className="text-accent hover:underline">
            Setup
          </a>{' '}
          page to subscribe to notifications.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading games...</p>
        </div>
      ) : (
        <GameGrid games={games} />
      )}
    </div>
  );
}
