import { useCallback, useEffect, useRef, useState } from 'react';

export function useAudio() {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem('kabu-picnic:sound') !== 'off';
    } catch {
      return true;
    }
  });
  const context = useRef<AudioContext | null>(null);
  const speak = useCallback(
    (text: string) => {
      if (!enabled || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      const voice = window.speechSynthesis.getVoices().find((item) => item.lang === 'zh-CN');
      if (voice) utterance.voice = voice;
      utterance.rate = 0.85;
      utterance.pitch = 1.12;
      window.speechSynthesis.speak(utterance);
    },
    [enabled],
  );

  const chime = useCallback(() => {
    if (!enabled) return;
    try {
      context.current ??= new AudioContext();
      const audio = context.current;
      void audio
        .resume()
        .then(() => {
          [523.25, 659.25, 783.99].forEach((frequency, i) => {
            const oscillator = audio.createOscillator();
            const gain = audio.createGain();
            const start = audio.currentTime + i * 0.055;
            oscillator.type = 'sine';
            oscillator.frequency.value = frequency;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.055, start + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.32);
            oscillator.connect(gain);
            gain.connect(audio.destination);
            oscillator.start(start);
            oscillator.stop(start + 0.35);
          });
        })
        .catch(() => {});
    } catch {
      /* Audio is optional; a silent device is still fully playable. */
    }
  }, [enabled]);

  useEffect(
    () => () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (context.current) void context.current.close().catch(() => {});
    },
    [],
  );

  function toggle() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setEnabled(!enabled);
    try {
      localStorage.setItem('kabu-picnic:sound', enabled ? 'off' : 'on');
    } catch {
      /* optional */
    }
  }
  return { enabled, toggle, speak, chime };
}
