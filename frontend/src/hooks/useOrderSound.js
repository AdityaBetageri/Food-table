import { useRef, useCallback } from 'react';

/**
 * Kitchen order-alert sound hook.
 *
 * The audio is loaded from a static file so you can swap it any time:
 *   public/sounds/order-notification.wav   ← replace with any WAV or MP3
 *
 * To change the sound:
 *   1. Drop your new file into  frontend/public/sounds/
 *   2. Update SOUND_PATH below to match the new filename.
 *
 * Returns:  playOrderSound() — call when a new order arrives.
 */

const SOUND_PATH = '/sounds/order-notification.wav'; // ← change filename here

export function useOrderSound() {
  const audioRef = useRef(null);

  /** Lazily create the Audio element once */
  function getAudio() {
    if (!audioRef.current) {
      audioRef.current = new Audio(SOUND_PATH);
      audioRef.current.preload = 'auto';
      audioRef.current.volume  = 1.0; // 0.0 – 1.0
    }
    return audioRef.current;
  }

  const playOrderSound = useCallback(() => {
    try {
      const audio = getAudio();
      // Rewind to start so rapid successive orders all play fully
      audio.currentTime = 0;
      audio.play().catch(err => {
        // Browser blocks autoplay until a user gesture — safe to ignore
        console.warn('Order sound blocked by browser:', err.message);
      });
    } catch (err) {
      console.warn('Order sound error:', err);
    }
  }, []);

  return { playOrderSound };
}
