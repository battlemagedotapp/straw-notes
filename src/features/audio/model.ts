import type { Moment, TranscriptSegment } from '../notes/types';

interface CaptureContent {
  id: string;
  title: string;
  elapsedMs: number;
  moments: Moment[];
  segments: TranscriptSegment[];
}
export type Capture = CaptureContent &
  ({ status: 'recording' } | { status: 'paused' } | { status: 'interrupted' });
export type PendingCapture = CaptureContent & { status: 'finished' };
export type Playback =
  | { status: 'idle' }
  | { status: 'playing' | 'paused'; audioId: string; positionMs: number; durationMs: number };
export interface AudioState {
  capture: Capture | null;
  pending: PendingCapture[];
  playback: Playback;
  saveErrors: Record<string, string>;
  listeningPositions: Record<string, number>;
  playbackRate: number;
}
export const initialAudioState: AudioState = {
  capture: null,
  pending: [],
  playback: { status: 'idle' },
  saveErrors: {},
  listeningPositions: {},
  playbackRate: 1,
};
export type AudioAction =
  | { type: 'closePlayer'; audioId: string }
  | { type: 'discard'; captureId: string }
  | { type: 'rate'; rate: number }
  | { type: 'start'; id: string; title: string }
  | { type: 'tick'; deltaMs: number; segments: TranscriptSegment[] }
  | { type: 'toggleCapture' }
  | { type: 'interrupt' }
  | { type: 'finish'; captureId?: string }
  | { type: 'mark'; id: string }
  | { type: 'nameMoment'; captureId: string; momentId: string; name: string }
  | { type: 'play'; audioId: string; durationMs: number }
  | { type: 'seek'; audioId: string; durationMs: number; positionMs: number }
  | { type: 'saveFailed'; captureId: string }
  | { type: 'attached'; captureId: string };

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
/** One projection for every global placement. Pending audio must never hide a player. */
export function audioPresentation(state: AudioState): 'capture' | 'playback' | 'pending' | 'idle' {
  if (state.capture) return 'capture';
  if (state.playback.status !== 'idle') return 'playback';
  return state.pending.length ? 'pending' : 'idle';
}

export function audioReducer(state: AudioState, action: AudioAction): AudioState {
  const capture = state.capture;
  switch (action.type) {
    case 'closePlayer':
      return state.playback.status !== 'idle' && state.playback.audioId === action.audioId
        ? rememberPlayback({ ...state, playback: { status: 'idle' } }, state.playback)
        : state;
    case 'discard': {
      const saveErrors = { ...state.saveErrors };
      delete saveErrors[action.captureId];
      return {
        ...state,
        capture: capture?.id === action.captureId ? null : capture,
        pending: state.pending.filter((c) => c.id !== action.captureId),
        saveErrors,
      };
    }
    case 'rate':
      return [0.75, 1, 1.25, 1.5, 2].includes(action.rate)
        ? { ...state, playbackRate: action.rate }
        : state;
    case 'start':
      return {
        ...state,
        pending: capture ? [...state.pending, { ...capture, status: 'finished' }] : state.pending,
        capture: {
          id: action.id,
          title: action.title,
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
      return capture
        ? {
            ...state,
            capture: {
              ...capture,
              status: capture.status === 'recording' ? 'paused' : 'recording',
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
    case 'finish':
      return capture && (!action.captureId || capture.id === action.captureId)
        ? {
            ...state,
            capture: null,
            pending: [...state.pending, { ...capture, status: 'finished' }],
          }
        : state;
    case 'mark':
      return capture
        ? {
            ...state,
            capture: {
              ...capture,
              moments: [
                ...capture.moments,
                { id: action.id, timeMs: capture.elapsedMs, name: 'Moment' },
              ],
            },
          }
        : state;
    case 'nameMoment': {
      const rename = <T extends CaptureContent>(item: T): T =>
        item.id !== action.captureId
          ? item
          : {
              ...item,
              moments: item.moments.map((m) =>
                m.id === action.momentId ? { ...m, name: action.name.trim() || m.name } : m,
              ),
            };
      return {
        ...state,
        capture: capture ? rename(capture) : null,
        pending: state.pending.map(rename),
      };
    }
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
      return {
        ...state,
        saveErrors: {
          ...state.saveErrors,
          [action.captureId]:
            'Couldn’t save the recording. Your audio and destination are still here. Try again.',
        },
      };
    case 'attached': {
      const saveErrors = { ...state.saveErrors };
      delete saveErrors[action.captureId];
      return {
        ...state,
        pending: state.pending.filter((c) => c.id !== action.captureId),
        saveErrors,
      };
    }
  }
}
export function formatTime(ms: number): string {
  const seconds = Math.floor(Math.max(0, ms) / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
