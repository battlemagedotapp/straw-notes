import { audioReducer, initialAudioState, type AudioAction, type AudioState } from '../audio/model';
import type { Folder, Note } from './types';

export interface NotesState {
  notes: Note[];
  folders: Folder[];
}
export interface AppState {
  notes: NotesState;
  audio: AudioState;
  failNextSave: boolean;
}
export type AppAction =
  | { type: 'pin'; ids: string[]; pinned: boolean }
  | { type: 'move'; ids: string[]; folderId: string; updatedAt: string }
  | { type: 'trash'; ids: string[]; deletedAt: string }
  | { type: 'restore'; ids: string[] }
  | { type: 'deletePermanently'; ids: string[] }
  | { type: 'saveFolder'; folder: Folder }
  | { type: 'deleteFolder'; id: string }
  | { type: 'bookmark'; audioId: string; timeMs: number; id: string; name: string }
  | { type: 'audio'; action: AudioAction }
  | { type: 'create'; note: Note }
  | { type: 'write'; id: string; title: string; body: string; updatedAt: string }
  | { type: 'attach'; captureId: string; noteId: string; newNote?: Note; updatedAt: string }
  | { type: 'failNextSave' }
  | { type: 'reset'; notes: Note[]; folders: Folder[] };
export function createAppState(notes: Note[], folders: Folder[]): AppState {
  return { notes: { notes, folders }, audio: initialAudioState, failNextSave: false };
}
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'pin':
      return {
        ...state,
        notes: {
          ...state.notes,
          notes: state.notes.notes.map((n) =>
            action.ids.includes(n.id) && !n.deletedAt ? { ...n, pinned: action.pinned } : n,
          ),
        },
      };
    case 'move':
      if (!state.notes.folders.some((f) => f.id === action.folderId)) return state;
      return {
        ...state,
        notes: {
          ...state.notes,
          notes: state.notes.notes.map((n) =>
            action.ids.includes(n.id) && !n.deletedAt
              ? { ...n, folderId: action.folderId, updatedAt: action.updatedAt }
              : n,
          ),
        },
      };
    case 'trash': {
      const affected = state.notes.notes.filter((n) => action.ids.includes(n.id));
      const playback = state.audio.playback;
      const ownsPlayback =
        playback.status !== 'idle' &&
        affected.some((n) => n.audio.some((a) => a.id === playback.audioId));
      return {
        ...state,
        audio: ownsPlayback
          ? audioReducer(state.audio, { type: 'closePlayer', audioId: playback.audioId })
          : state.audio,
        notes: {
          ...state.notes,
          notes: state.notes.notes.map((n) =>
            action.ids.includes(n.id) && !n.deletedAt ? { ...n, deletedAt: action.deletedAt } : n,
          ),
        },
      };
    }
    case 'restore':
      return {
        ...state,
        notes: {
          ...state.notes,
          notes: state.notes.notes.map((n) => {
            if (!action.ids.includes(n.id)) return n;
            const { deletedAt: _deletedAt, ...restored } = n;
            return restored;
          }),
        },
      };
    case 'deletePermanently':
      return {
        ...state,
        notes: {
          ...state.notes,
          notes: state.notes.notes.filter((n) => !n.deletedAt || !action.ids.includes(n.id)),
        },
      };
    case 'saveFolder': {
      const name = action.folder.name.trim();
      if (
        !name ||
        state.notes.folders.some(
          (f) =>
            f.id !== action.folder.id && f.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
        )
      )
        return state;
      const folder = { ...action.folder, name };
      return {
        ...state,
        notes: {
          ...state.notes,
          folders: state.notes.folders.some((f) => f.id === folder.id)
            ? state.notes.folders.map((f) => (f.id === folder.id ? folder : f))
            : [...state.notes.folders, folder],
        },
      };
    }
    case 'deleteFolder':
      if (action.id === 'personal') return state;
      return {
        ...state,
        notes: {
          notes: state.notes.notes.map((n) =>
            n.folderId === action.id ? { ...n, folderId: 'personal' } : n,
          ),
          folders: state.notes.folders.filter((f) => f.id !== action.id),
        },
      };
    case 'bookmark':
      return {
        ...state,
        notes: {
          ...state.notes,
          notes: state.notes.notes.map((n) => ({
            ...n,
            audio: n.audio.map((a) =>
              a.id !== action.audioId
                ? a
                : {
                    ...a,
                    moments: a.moments.some((m) => m.timeMs === action.timeMs)
                      ? a.moments.filter((m) => m.timeMs !== action.timeMs)
                      : [
                          ...a.moments,
                          { id: action.id, timeMs: action.timeMs, name: action.name },
                        ].sort((a, b) => a.timeMs - b.timeMs),
                  },
            ),
          })),
        },
      };

    case 'audio':
      if (
        (action.action.type === 'play' || action.action.type === 'seek') &&
        !state.notes.notes.some(
          (n) =>
            !n.deletedAt &&
            n.audio.some((a) => a.id === ('audioId' in action.action ? action.action.audioId : '')),
        )
      )
        return state;
      return { ...state, audio: audioReducer(state.audio, action.action) };
    case 'create':
      return { ...state, notes: { ...state.notes, notes: [action.note, ...state.notes.notes] } };
    case 'write':
      return {
        ...state,
        notes: {
          ...state.notes,
          notes: state.notes.notes.map((n) =>
            n.id === action.id
              ? { ...n, title: action.title, body: action.body, updatedAt: action.updatedAt }
              : n,
          ),
        },
      };
    case 'failNextSave':
      return { ...state, failNextSave: true };
    case 'reset':
      return createAppState(action.notes, action.folders);
    case 'attach': {
      const capture = state.audio.pending.find((c) => c.id === action.captureId);
      if (!capture) return state; // Duplicate submission must never duplicate an attachment.
      const target =
        state.notes.notes.find((n) => n.id === action.noteId && !n.deletedAt) ?? action.newNote;
      if (
        state.failNextSave ||
        !target ||
        !state.notes.folders.some((f) => f.id === target.folderId)
      )
        return {
          ...state,
          failNextSave: false,
          audio: audioReducer(state.audio, { type: 'saveFailed', captureId: capture.id }),
        };
      const note = {
        ...target,
        updatedAt: action.updatedAt,
        audio: [
          ...target.audio,
          {
            id: capture.id,
            title: capture.title,
            durationMs: capture.elapsedMs,
            segments: capture.segments,
            moments: capture.moments,
          },
        ],
      };
      return {
        ...state,
        audio: audioReducer(state.audio, { type: 'attached', captureId: capture.id }),
        notes: {
          ...state.notes,
          notes: [note, ...state.notes.notes.filter((n) => n.id !== note.id)],
        },
      };
    }
  }
}
export function newNote(id: string, folderId: string, now: string, title = ''): Note {
  return { id, title, body: '', folderId, updatedAt: now, pinned: false, audio: [] };
}
export function noteTitle(note: Note): string {
  return note.title.trim() || 'New note';
}
