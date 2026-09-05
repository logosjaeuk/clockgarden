export type SoundName = 'chime' | 'pulse' | 'bright';

const patterns: Record<SoundName, Array<[number, number]>> = {
  chime: [
    [660, 0],
    [880, 0.28],
    [990, 0.56],
  ],
  pulse: [
    [520, 0],
    [520, 0.3],
    [520, 0.6],
  ],
  bright: [
    [880, 0],
    [1100, 0.2],
    [1320, 0.4],
  ],
};

let audioContext: AudioContext | null = null;
export function unlockAudio(): AudioContext | null {
  try {
    audioContext ??= new AudioContext();
    if (audioContext.state === 'suspended') void audioContext.resume().catch(() => {});
    return audioContext;
  } catch {
    return null;
  }
}

export function playSound(name: SoundName = 'chime'): void {
  try {
    const context = unlockAudio();
    if (!context) return;
    const master = context.createGain();
    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.02);
    master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.1);
    master.connect(context.destination);
    for (const [frequency, delay] of patterns[name]) {
      const oscillator = context.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      oscillator.connect(master);
      oscillator.start(context.currentTime + delay);
      oscillator.stop(context.currentTime + delay + 0.42);
    }
    setTimeout(() => master.disconnect(), 1400);
  } catch {
    // Audio may be unavailable or blocked; visual completion state remains.
  }
}
