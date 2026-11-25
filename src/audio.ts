const notes: Record<string, number[]> = {
  click: [330], correct: [523, 659, 784], wrong: [230, 175], countdown: [440], bomb: [280, 220], explosion: [105, 65, 42], victory: [392, 523, 659, 784, 1047]
};
let context: AudioContext | undefined;
export function sound(name: string, enabled: boolean) {
  if (!enabled) return;
  try {
    context ||= new AudioContext();
    const audio = context;
    void audio.resume().catch(() => {});
    (notes[name] || notes.click).forEach((frequency, index) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      const time = audio.currentTime + index * 0.075;
      oscillator.type = name === 'explosion' ? 'sawtooth' : 'square';
      oscillator.frequency.setValueAtTime(frequency, time);
      gain.gain.setValueAtTime(0.035, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(time); oscillator.stop(time + 0.13);
    });
  } catch { /* Audio is optional on unsupported devices. */ }
}
