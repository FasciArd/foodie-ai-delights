import { useCallback, useState, useEffect } from 'react';

const NOTIFICATION_SOUNDS = {
  // Customer sounds
  orderAccepted: '/sounds/order-accepted.mp3',
  orderOnTheWay: '/sounds/order-on-the-way.mp3',
  orderDelivered: '/sounds/order-delivered.mp3',
  
  // Restaurant sounds
  newOrder: '/sounds/new-order.mp3',
  orderCancelled: '/sounds/order-cancelled.mp3',
  
  // Driver sounds
  newDelivery: '/sounds/new-delivery.mp3',
  
  // Generic
  notification: '/sounds/notification.mp3',
} as const;

type SoundType = keyof typeof NOTIFICATION_SOUNDS;

const STORAGE_KEY = 'foodiehub_sound_enabled';

export function useSoundNotifications() {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(soundEnabled));
  }, [soundEnabled]);

  const playSound = useCallback((type: SoundType = 'notification') => {
    if (!soundEnabled) return;

    try {
      // Use a simple beep using Web Audio API as fallback
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different tones for different notification types
      const tones: Record<SoundType, { frequency: number; duration: number; type: OscillatorType }> = {
        newOrder: { frequency: 800, duration: 0.3, type: 'sine' },
        orderAccepted: { frequency: 600, duration: 0.2, type: 'sine' },
        orderOnTheWay: { frequency: 700, duration: 0.25, type: 'sine' },
        orderDelivered: { frequency: 1000, duration: 0.4, type: 'sine' },
        orderCancelled: { frequency: 300, duration: 0.5, type: 'sawtooth' },
        newDelivery: { frequency: 750, duration: 0.3, type: 'sine' },
        notification: { frequency: 520, duration: 0.15, type: 'sine' },
      };

      const tone = tones[type];
      oscillator.type = tone.type;
      oscillator.frequency.setValueAtTime(tone.frequency, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + tone.duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + tone.duration);

      // Double beep for important notifications
      if (type === 'newOrder' || type === 'newDelivery') {
        setTimeout(() => {
          const osc2 = audioContext.createOscillator();
          const gain2 = audioContext.createGain();
          osc2.connect(gain2);
          gain2.connect(audioContext.destination);
          osc2.type = tone.type;
          osc2.frequency.setValueAtTime(tone.frequency * 1.2, audioContext.currentTime);
          gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          osc2.start();
          osc2.stop(audioContext.currentTime + 0.2);
        }, 200);
      }
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  return {
    soundEnabled,
    setSoundEnabled,
    toggleSound,
    playSound,
  };
}
