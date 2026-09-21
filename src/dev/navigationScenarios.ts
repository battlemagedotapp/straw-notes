import { createSeedNotes, createSeedRecordings, folders, transcript } from '@/fixtures/notes';
import type { AppAction } from '@/features/notes/model';

export const navigationPreviews = [
  'idle',
  'recording',
  'paused',
  'interrupted',
  'save-failed',
  'playing',
  'playback-paused',
  'replay',
  'long-title',
] as const;
export type NavigationPreview = (typeof navigationPreviews)[number];

/** Repeatable session-only states for reviewing real native navigation placements. */
export function navigationPreviewActions(
  preview: NavigationPreview,
  now = new Date(),
): AppAction[] {
  const recordings = createSeedRecordings(now);
  const actions: AppAction[] = [
    { type: 'reset', notes: createSeedNotes(now), recordings, folders },
  ];
  if (['recording', 'paused', 'interrupted', 'save-failed'].includes(preview)) {
    const id = 'navigation-capture';
    actions.push(
      { type: 'audio', action: { type: 'start', id, title: 'Ideas for the studio workshop' } },
      { type: 'audio', action: { type: 'tick', deltaMs: 83000, segments: transcript } },
    );
    if (preview === 'paused')
      actions.push({ type: 'audio', action: { type: 'toggleCapture', captureId: id } });
    if (preview === 'interrupted') actions.push({ type: 'audio', action: { type: 'interrupt' } });
    if (preview === 'save-failed')
      actions.push(
        { type: 'setFailure', operationId: 'save:' + id },
        { type: 'finishCapture', captureId: id, now: now.toISOString() },
      );
  } else if (preview !== 'idle') {
    const recording = recordings.find(
      (item) => item.id === (preview === 'long-title' ? 'design-review' : 'morning-audio'),
    )!;
    actions.push({
      type: 'audio',
      action: {
        type: 'seek',
        audioId: recording.id,
        durationMs: recording.durationMs,
        positionMs: preview === 'replay' ? recording.durationMs : 67000,
      },
    });
    if (preview === 'playing' || preview === 'long-title')
      actions.push({
        type: 'audio',
        action: {
          type: 'play',
          audioId: recording.id,
          durationMs: recording.durationMs,
        },
      });
  }
  return actions;
}
