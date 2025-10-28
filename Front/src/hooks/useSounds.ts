import { useEffect, useRef } from 'react';
import { Howl } from 'howler';

export const useSounds = () => {
  const buySoundRef = useRef<Howl | null>(null);
  const sellSoundRef = useRef<Howl | null>(null);

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

    // Cleanup on unmount
    return () => {
      buySoundRef.current?.unload();
      sellSoundRef.current?.unload();
    };
  }, []);

  const playBuySound = () => {
    buySoundRef.current?.play();
  };

  const playSellSound = () => {
    sellSoundRef.current?.play();
  };

  return {
    playBuySound,
    playSellSound,
  };
};
