'use client';

import { useMemo, useEffect } from 'react';

type EmojiBurstProps = {
  emojis: string;
};

// A grid of 10x10 particles should be enough
const PARTICLE_COUNT = 100; 

export function EmojiBurst({ emojis }: EmojiBurstProps) {
  
  const particles = useMemo(() => {
    const emojiArray = [...emojis];
    return Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * 400 + 50; // Random radius from 50px to 450px
      const tx = `${Math.cos(angle) * radius}px`;
      const ty = `${Math.sin(angle) * radius}px`;
      const delay = `${Math.random() * 0.3}s`;
      const emoji = emojiArray[i % emojiArray.length];

      return { tx, ty, delay, emoji, key: i };
    });
  }, [emojis]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 animate-container-fade-out">
      <div className="relative h-full w-full">
        {particles.map(({ tx, ty, delay, emoji, key }) => (
          <div
            key={key}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl animate-emoji-burst"
            style={{
              '--tx': tx,
              '--ty': ty,
              animationDelay: delay,
            } as React.CSSProperties}
          >
            {emoji}
          </div>
        ))}
      </div>
    </div>
  );
}
