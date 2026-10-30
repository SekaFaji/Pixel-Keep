import { useRef } from "react";

/** Browser-generated SFX; no engine dependency or audio samples. */
export function useGameAudio(soundOnRef: { current: boolean }) {
  const audioRef = useRef<AudioContext | null>(null);

  const ensureAudio = () => {
    if (!audioRef.current) {
      try {
        const Ctx =
          window.AudioContext ||
          ((window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
        audioRef.current = new Ctx();
      } catch {
        /* no audio */
      }
    }
  };

  const beep = (freq: number, dur = 0.07, type: OscillatorType = "square", vol = 0.05) => {
    try {
      if (!soundOnRef.current) return;
      const ctx = audioRef.current;
      if (!ctx) return;
      const o = ctx.createOscillator();
      const gain = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.connect(gain);
      gain.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + dur);
    } catch {
      /* ignore */
    }
  };

  return { ensureAudio, beep };
}
