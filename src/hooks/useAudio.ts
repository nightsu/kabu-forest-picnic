import { useCallback, useEffect, useRef, useState } from 'react';
import { VoicePlayer } from '../lib/VoicePlayer';

export function useAudio() {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem('kabu-picnic:sound') !== 'off';
    } catch {
      return true;
    }
  });
  const context = useRef<AudioContext | null>(null);
  const player = useRef<VoicePlayer | null>(null);
  const chimeVersion = useRef(0);
  const notes = useRef(new Set<OscillatorNode>());
  const speak = useCallback(
    (text: string) => {
      if (!enabled) return;
      player.current ??= new VoicePlayer(import.meta.env.BASE_URL);
      player.current.speak(text);
    },
    [enabled],
  );

  const chime = useCallback(() => {
    if (!enabled) return;
    chimeVersion.current += 1;
    for (const note of notes.current) note.stop();
    notes.current.clear();
    try {
      context.current ??= new AudioContext();
      const audio = context.current;
      const version = chimeVersion.current;
      void audio
        .resume()
        .then(() => {
          if (version !== chimeVersion.current) return;
          [523.25, 659.25, 783.99].forEach((frequency, i) => {
            const oscillator = audio.createOscillator();
            const gain = audio.createGain();
            const start = audio.currentTime + i * 0.055;
            notes.current.add(oscillator);
            oscillator.onended = () => notes.current.delete(oscillator);
            oscillator.type = 'sine';
            oscillator.frequency.value = frequency;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.025, start + 0.015);
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
      player.current?.stop();
      if (context.current) void context.current.close().catch(() => {});
    },
    [],
  );

  function toggle() {
    player.current?.stop();
    chimeVersion.current += 1;
    for (const note of notes.current) note.stop();
    notes.current.clear();
    setEnabled(!enabled);
    try {
      localStorage.setItem('kabu-picnic:sound', enabled ? 'off' : 'on');
    } catch {
      /* optional */
    }
  }
  return { enabled, toggle, speak, chime };
}
