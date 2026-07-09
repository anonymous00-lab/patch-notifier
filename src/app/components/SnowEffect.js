'use client';

import { useEffect, useState } from 'react';

export default function SnowEffect() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // 0 to 100vw
      animationDuration: Math.random() * 10 + 10, // 10 to 20s
      animationDelay: Math.random() * 5, // 0 to 5s
      opacity: Math.random() * 0.5 + 0.2, // 0.2 to 0.7
      size: Math.random() * 4 + 2, // 2 to 6px
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white blur-[1px] animate-snowfall"
          style={{
            left: `${p.left}vw`,
            top: `-20px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.animationDuration}s`,
            animationDelay: `${p.animationDelay}s`,
          }}
        />
      ))}
    </div>
  );
}
