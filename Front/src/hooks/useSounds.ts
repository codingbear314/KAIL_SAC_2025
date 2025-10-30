import { useCallback, useEffect, useRef } from 'react';
import { Howl } from 'howler';

import bgmSrc from '../Sound/arcade-bgm.opus';

export const useSounds = () => {
  const buySoundRef = useRef<Howl | null>(null);
  const sellSoundRef = useRef<Howl | null>(null);
  const backgroundSoundRef = useRef<Howl | null>(null);

  useEffect(() => {
    // Initialize sounds
    buySoundRef.current = new Howl({
      src: ['/src/Sound/mixkit-winning-a-coin-video-game-2069.wav'],
      volume: 0.5,
      preload: true,
    });

    sellSoundRef.current = new Howl({
      src: ['/src/Sound/mixkit-video-game-treasure-2066.wav'],
      volume: 0.5,
      preload: true,
    });

    backgroundSoundRef.current = new Howl({
      src: [bgmSrc],
      volume: 0.3,
      preload: true,
      loop: true,
    });

    // Cleanup on unmount
    return () => {
      buySoundRef.current?.unload();
      sellSoundRef.current?.unload();
      backgroundSoundRef.current?.unload();
    };
  }, []);

  const playBuySound = useCallback(() => {
    buySoundRef.current?.play();
  }, []);

  const playSellSound = useCallback(() => {
    sellSoundRef.current?.play();
  }, []);

  const playBackgroundMusic = useCallback(() => {
    if (!backgroundSoundRef.current) return;
    if (!backgroundSoundRef.current.playing()) {
      backgroundSoundRef.current.play();
    }
  }, []);

  const stopBackgroundMusic = useCallback(() => {
    backgroundSoundRef.current?.stop();
  }, []);

  return {
    playBuySound,
    playSellSound,
    playBackgroundMusic,
    stopBackgroundMusic,
  };
};
