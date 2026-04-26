type Note = { freq: number; duration: number; delay?: number };

function playNotes(notes: Note[], volume = 0.18) {
  if (typeof window === "undefined") return;
  try {
    const ctx = new AudioContext();
    notes.forEach(({ freq, duration, delay = 0 }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    });
    const total = Math.max(...notes.map((n) => (n.delay ?? 0) + n.duration));
    setTimeout(() => ctx.close(), (total + 0.2) * 1000);
  } catch {
    // AudioContext not supported — fail silently
  }
}

export const sounds = {
  collect: () =>
    playNotes([
      { freq: 523, duration: 0.12 },
      { freq: 659, duration: 0.12, delay: 0.1 },
      { freq: 784, duration: 0.2, delay: 0.2 },
    ]),

  scanComplete: () =>
    playNotes([
      { freq: 440, duration: 0.1 },
      { freq: 554, duration: 0.15, delay: 0.1 },
    ]),

  badgeUnlock: () =>
    playNotes(
      [
        { freq: 523, duration: 0.1 },
        { freq: 659, duration: 0.1, delay: 0.1 },
        { freq: 784, duration: 0.1, delay: 0.2 },
        { freq: 1047, duration: 0.3, delay: 0.3 },
      ],
      0.15
    ),

  error: () =>
    playNotes([
      { freq: 220, duration: 0.15 },
      { freq: 180, duration: 0.2, delay: 0.14 },
    ], 0.12),
};
