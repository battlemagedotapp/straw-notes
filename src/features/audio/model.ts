import type { Moment, TranscriptSegment } from '../notes/types';

interface CaptureContent {
  id: string;
  title: string;
  elapsedMs: number;
  noteId?: string;
  saveError?: string;
  moments: Moment[];
  segments: TranscriptSegment[];
}
export type Capture = CaptureContent &
  ({ status: 'recording' } | { status: 'paused' } | { status: 'interrupted' });
export type Playback =
  | { status: 'idle' }
  | { status: 'playing' | 'paused'; audioId: string; positionMs: number; durationMs: number };
export interface AudioState {
  capture: Capture | null;
  playback: Playback;
  listeningPositions: Record<string, number>;
  playbackRate: number;
}
export const initialAudioState: AudioState = {
  capture: null,
  playback: { status: 'idle' },
  listeningPositions: {},
  playbackRate: 1,
};
export type AudioAction =
  | { type: 'closePlayer'; audioId: string }
  | { type: 'discard'; captureId: string }
  | { type: 'rate'; rate: number }
  | { type: 'start'; id: string; title: string; noteId?: string }
  | { type: 'tick'; deltaMs: number; segments: TranscriptSegment[] }
  | { type: 'toggleCapture'; captureId: string }
  | { type: 'interrupt' }
  | { type: 'finished'; captureId: string }
  | { type: 'associate'; captureId: string; noteId: string }
  | { type: 'mark'; id: string; captureId: string }
  | { type: 'toggleMoment'; captureId: string; id: string; timeMs: number }
  | { type: 'play'; audioId: string; durationMs: number }
  | { type: 'seek'; audioId: string; durationMs: number; positionMs: number }
  | { type: 'saveFailed'; captureId: string };

function rememberPlayback(state: AudioState, playback: Playback): AudioState {
  return playback.status === 'idle'
    ? state
    : {
        ...state,
        listeningPositions: {
          ...state.listeningPositions,
          [playback.audioId]: playback.positionMs,
        },
      };
}
/** One projection for every global placement. Capture takes priority over an explicitly opened player. */
export function audioPresentation(state: AudioState): 'capture' | 'playback' | 'idle' {
  if (state.capture) return 'capture';
  if (state.playback.status !== 'idle') return 'playback';
  return 'idle';
}

/** Shared wording across workspace, library, accessory and header. */
export function captureStatus(capture: Capture): string {
  if (capture.saveError) return 'Save failed';
  return capture.status === 'recording'
    ? 'Recording'
    : capture.status === 'interrupted'
      ? 'Interrupted'
      : 'Paused';
}

export function audioReducer(state: AudioState, action: AudioAction): AudioState {
  const capture = state.capture;
  switch (action.type) {
    case 'closePlayer':
      return state.playback.status !== 'idle' && state.playback.audioId === action.audioId
        ? rememberPlayback({ ...state, playback: { status: 'idle' } }, state.playback)
        : state;
    case 'discard':
      return capture?.id === action.captureId ? { ...state, capture: null } : state;
    case 'associate':
      return capture?.id === action.captureId && !capture.noteId
        ? { ...state, capture: { ...capture, noteId: action.noteId } }
        : state;
    case 'rate':
      return [0.75, 1, 1.25, 1.5, 2].includes(action.rate)
        ? { ...state, playbackRate: action.rate }
        : state;
    case 'start':
      if (capture) return state;
      return {
        ...state,
        capture: {
          id: action.id,
          title: action.title,
          noteId: action.noteId,
          status: 'recording',
          elapsedMs: 0,
          moments: [],
          segments: [],
        },
        listeningPositions: rememberPlayback(state, state.playback).listeningPositions,
        playback: { status: 'idle' },
      };
    case 'tick': {
      if (!Number.isFinite(action.deltaMs) || action.deltaMs <= 0) return state;
      const elapsedMs = (capture?.elapsedMs ?? 0) + action.deltaMs;
      let playback = state.playback;
      if (playback.status === 'playing') {
        const positionMs = Math.min(
          playback.durationMs,
          playback.positionMs + action.deltaMs * state.playbackRate,
        );
        playback = {
          ...playback,
          positionMs,
          status: positionMs === playback.durationMs ? 'paused' : 'playing',
        };
      }
      return {
        ...state,
        playback,
        capture:
          capture?.status === 'recording'
            ? {
                ...capture,
                elapsedMs,
                segments: action.segments.filter((s) => s.startMs <= elapsedMs),
              }
            : capture,
      };
    }
    case 'toggleCapture':
      return capture?.id === action.captureId
        ? {
            ...state,
            capture: {
              ...capture,
              status: capture.status === 'recording' ? 'paused' : 'recording',
              saveError: undefined,
            },
          }
        : state;
    case 'interrupt':
      return {
        ...state,
        capture: capture?.status === 'recording' ? { ...capture, status: 'interrupted' } : capture,
        playback:
          state.playback.status === 'playing'
            ? { ...state.playback, status: 'paused' }
            : state.playback,
      };
    case 'finished':
      return capture?.id === action.captureId ? { ...state, capture: null } : state;
    case 'mark':
      return capture?.id === action.captureId &&
        !capture.moments.some((moment) => moment.timeMs === capture.elapsedMs)
        ? {
            ...state,
            capture: {
              ...capture,
              moments: [...capture.moments, { id: action.id, timeMs: capture.elapsedMs }],
            },
          }
        : state;
    case 'toggleMoment':
      if (
        capture?.id !== action.captureId ||
        !Number.isFinite(action.timeMs) ||
        action.timeMs < 0 ||
        action.timeMs > capture.elapsedMs
      )
        return state;
      return {
        ...state,
        capture: {
          ...capture,
          moments: capture.moments.some((m) => m.timeMs === action.timeMs)
            ? capture.moments.filter((m) => m.timeMs !== action.timeMs)
            : [...capture.moments, { id: action.id, timeMs: action.timeMs }].sort(
                (a, b) => a.timeMs - b.timeMs,
              ),
        },
      };
    case 'play': {
      if (capture) return state; // Recording must be finished before playback can begin.
      const current = state.playback;
      const same = current.status !== 'idle' && current.audioId === action.audioId;
      const remembered = same
        ? current.positionMs
        : (state.listeningPositions[action.audioId] ?? 0);
      return {
        ...rememberPlayback(state, current),
        playback: {
          audioId: action.audioId,
          durationMs: action.durationMs,
          status: same && current.status === 'playing' ? 'paused' : 'playing',
          positionMs: remembered < action.durationMs ? remembered : 0,
        },
      };
    }
    case 'seek':
      if (capture || !Number.isFinite(action.positionMs)) return state;
      return {
        ...rememberPlayback(state, state.playback),
        playback: {
          audioId: action.audioId,
          durationMs: action.durationMs,
          status:
            state.playback.status !== 'idle' && state.playback.audioId === action.audioId
              ? state.playback.status
              : 'paused',
          positionMs: Math.max(0, Math.min(action.durationMs, action.positionMs)),
        },
      };
    case 'saveFailed':
      return capture?.id === action.captureId
        ? {
            ...state,
            capture: {
              ...capture,
              status: 'paused',
              saveError: 'Couldn’t save. Your audio is kept. Try again.',
            },
          }
        : state;
  }
}
export function formatTime(ms: number): string {
  const seconds = Math.floor(Math.max(0, ms) / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
