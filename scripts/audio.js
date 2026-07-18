const SOUNDS = Object.freeze({
  correct: { frequency: 880, endFrequency: 1320, duration: 0.42, type: 'sine' },
  wrong: { frequency: 120, endFrequency: 72, duration: 0.4, type: 'triangle' },
  flip: { frequency: 420, endFrequency: 360, duration: 0.12, type: 'sine' }
});

export function createAudioController(AudioContextClass) {
  let enabled = false;
  let context = null;
  const supported = typeof AudioContextClass === 'function';

  function setEnabled(nextEnabled) {
    if (!supported) return false;
    enabled = Boolean(nextEnabled);
    if (enabled && context?.state === 'suspended') context.resume();
    return enabled;
  }

  function play(name) {
    if (!supported || !enabled || !SOUNDS[name]) return false;
    context ??= new AudioContextClass();
    if (context.state === 'suspended') context.resume();
    const sound = SOUNDS[name];
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = sound.type;
    oscillator.frequency.setValueAtTime(sound.frequency, context.currentTime);
    if (typeof oscillator.frequency.exponentialRampToValueAtTime === 'function') {
      oscillator.frequency.exponentialRampToValueAtTime(
        sound.endFrequency,
        context.currentTime + sound.duration
      );
    }
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.11, context.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + sound.duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + sound.duration);
    return true;
  }

  return {
    supported,
    setEnabled,
    play,
    get enabled() {
      return enabled;
    }
  };
}
