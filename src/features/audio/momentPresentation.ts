import type { TranscriptSegment } from '../notes/types';

/** Derived context, never a separate editable moment name. */
export function momentExcerpt(segments: TranscriptSegment[], timeMs: number, limit = 64): string {
  const text = segments.findLast((segment) => segment.startMs <= timeMs)?.text.trim();
  if (!text) return 'Transcript unavailable';
  const compact = text.replace(/\s+/g, ' ');
  return compact.length > limit ? `${compact.slice(0, limit - 1).trimEnd()}…` : compact;
}
