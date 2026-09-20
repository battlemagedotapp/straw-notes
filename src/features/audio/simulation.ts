const signal = Array.from(
  { length: 48 },
  (_, i) => 0.18 + Math.abs(Math.sin(i * 2.17) * Math.cos(i * 0.73)) * 0.82,
);
export const playbackSamples: readonly number[] = signal;
export function recordingSamples(elapsedMs: number, animate: boolean): readonly number[] {
  const phase = animate ? Math.floor(elapsedMs / 500) % signal.length : 0;
  return signal.slice(phase).concat(signal.slice(0, phase));
}
