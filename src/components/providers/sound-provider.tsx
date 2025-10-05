// src/components/providers/sound-provider.tsx
'use client';

import React, { createContext, useContext, useCallback, useEffect, useRef } from 'react';

export type SoundEffect = 'claim' | 'pop' | 'notification' | 'error';

const soundFiles: Record<SoundEffect, string> = {
    claim: 'https://cdn.pixabay.com/audio/2022/03/15/audio_229983de4b.mp3',
    pop: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c3b4cad547.mp3',
    notification: 'https://cdn.pixabay.com/audio/2022/10/28/audio_2435520a32.mp3',
    error: 'https://cdn.pixabay.com/audio/2022/03/13/audio_248c08bcec.mp3',
};

type SoundContextType = {
  playSound: (sound: SoundEffect) => void;
};

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider = ({ children }: { children: React.ReactNode }) => {
  const audioRefs = useRef<Record<SoundEffect, HTMLAudioElement | null>>({
      claim: null,
      pop: null,
      notification: null,
      error: null
  });

  useEffect(() => {
    // Preload audio files on the client
    (Object.keys(soundFiles) as SoundEffect[]).forEach(key => {
        if (typeof window !== 'undefined') {
            const audio = new Audio(soundFiles[key]);
            audio.preload = 'auto';
            audioRefs.current[key] = audio;
        }
    });
  }, []);

  const playSound = useCallback((sound: SoundEffect) => {
    const audio = audioRefs.current[sound];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(error => console.error(`Error playing sound: ${sound}`, error));
    }
  }, []);

  return (
    <SoundContext.Provider value={{ playSound }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
