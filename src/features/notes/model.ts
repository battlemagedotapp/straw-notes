import { audioReducer, initialAudioState, type AudioAction, type AudioState } from '../audio/model';
import type { Folder, Note, Recording } from './types';

export interface NotesState {
  notes: Note[];
  folders: Folder[];
}
export interface AppState {
  notes: NotesState;
  audio: AudioState;
  recordings: Recording[];
  operations: Record<string, OperationResult>;
  failures: Record<string, boolean>;
  notice: Notice | null;
}
export interface OperationResult {
  status: 'success' | 'error';
  message?: string;
  noteId?: string;
  recordingIds?: string[];
}
export interface Notice {
  id: string;
  message: string;
  recordingId?: string;
  undo?: { resource: 'notes' | 'recordings'; ids: string[] };
}
export type AppAction =
  | { type: 'pin'; ids: string[]; pinned: boolean }
  | { type: 'move'; ids: string[]; folderId: string; updatedAt: string }
  | { type: 'trash'; ids: string[]; deletedAt: string }
  | { type: 'restore'; ids: string[] }
  | { type: 'deletePermanently'; ids: string[] }
  | { type: 'saveFolder'; folder: Folder }
  | { type: 'deleteFolder'; id: string }
  | { type: 'toggleRecordingMoment'; audioId: string; timeMs: number; id: string }
  | { type: 'audio'; action: AudioAction }
  | { type: 'create'; note: Note }
  | { type: 'write'; id: string; title: string; body: string; updatedAt: string }
  | { type: 'finishCapture'; captureId: string; now: string; playAfterId?: string }
  | { type: 'writeForCapture'; captureId: string; note: Note }
  | {
      type: 'linkRecordings';
      operationId: string;
      recordingIds: string[];
      noteId: string;
      newNote?: Note;
      now: string;
    }
  | { type: 'unlinkRecording'; noteId: string; recordingId: string; now: string }
  | { type: 'renameRecording'; id: string; title: string; now: string }
  | { type: 'trashRecordings'; ids: string[]; now: string }
  | { type: 'restoreRecordings'; ids: string[] }
  | { type: 'deleteRecordingsPermanently'; ids: string[] }
  | { type: 'importRecording'; operationId: string; recording: Recording; error?: string }
  | { type: 'setFailure'; operationId: string }
  | { type: 'clearNotice'; id: string }
  | { type: 'reset'; notes: Note[]; folders: Folder[]; recordings: Recording[] };
export function createAppState(
  notes: Note[],
  folders: Folder[],
  recordings: Recording[] = [],
): AppState {
  return {
    notes: { notes, folders },
    recordings,
    audio: initialAudioState,
    operations: {},
    failures: {},
    notice: null,
  };
}
function withOperationResult(state: AppState, id: string, result: OperationResult): AppState {
  return {
    ...state,
    failures: { ...state.failures, [id]: false },
    operations: { ...state.operations, [id]: result },
  };
}
function linkRecordings(
  state: AppState,
  action: Extract<AppAction, { type: 'linkRecordings' }>,
): AppState {
  if (state.operations[action.operationId]?.status === 'success') return state;
  const ids = [...new Set(action.recordingIds)];
  const existing = state.notes.notes.find((n) => n.id === action.noteId);
  const target = existing ?? action.newNote;
  if (
    state.failures[action.operationId] ||
    !ids.length ||
    !target ||
    target.id !== action.noteId ||
    target.deletedAt ||
    !state.notes.folders.some((f) => f.id === target.folderId) ||
    ids.some((id) => !state.recordings.some((r) => r.id === id && !r.deletedAt))
  ) {
    return withOperationResult(state, action.operationId, {
      status: 'error',
      message: 'Couldn’t add audio. Your audio is safe. Check the note and audio, then try again.',
      recordingIds: ids,
      noteId: action.noteId,
    });
  }
  const note = {
    ...target,
    recordingIds: [
      ...target.recordingIds,
      ...ids.filter((id) => !target.recordingIds.includes(id)),
    ],
    updatedAt: action.now,
  };
  return withOperationResult(
    {
      ...state,
      notes: {
        ...state.notes,
        notes: [note, ...state.notes.notes.filter((n) => n.id !== note.id)],
      },
    },
    action.operationId,
    { status: 'success', recordingIds: ids, noteId: note.id },
  );
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
      const affected = state.notes.notes
        .filter((n) => action.ids.includes(n.id) && !n.deletedAt)
        .map((n) => n.id);
      if (!affected.length) return state;
      return {
        ...state,
        notice: {
          id: action.deletedAt,
          message: 'Moved to Recently Deleted',
          undo: { resource: 'notes', ids: affected },
        },
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
    case 'toggleRecordingMoment':
      return {
        ...state,
        recordings: state.recordings.map((r) =>
          r.id !== action.audioId ||
          r.deletedAt ||
          !Number.isFinite(action.timeMs) ||
          action.timeMs < 0 ||
          action.timeMs > r.durationMs
            ? r
            : {
                ...r,
                moments: r.moments.some((m) => m.timeMs === action.timeMs)
                  ? r.moments.filter((m) => m.timeMs !== action.timeMs)
                  : [...r.moments, { id: action.id, timeMs: action.timeMs }].sort(
                      (a, b) => a.timeMs - b.timeMs,
                    ),
              },
        ),
      };

    case 'audio':
      if (
        (action.action.type === 'play' || action.action.type === 'seek') &&
        !state.recordings.some(
          (r) => !r.deletedAt && r.id === ('audioId' in action.action ? action.action.audioId : ''),
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
            n.id === action.id && !n.deletedAt
              ? { ...n, title: action.title, body: action.body, updatedAt: action.updatedAt }
              : n,
          ),
        },
      };
    case 'clearNotice':
      return state.notice?.id === action.id ? { ...state, notice: null } : state;
    case 'setFailure':
      return { ...state, failures: { ...state.failures, [action.operationId]: true } };
    case 'reset':
      return createAppState(action.notes, action.folders, action.recordings);
    case 'writeForCapture': {
      const capture = state.audio.capture;
      if (
        !capture ||
        capture.id !== action.captureId ||
        capture.noteId ||
        !state.notes.folders.some((f) => f.id === action.note.folderId)
      )
        return state;
      return {
        ...state,
        notes: { ...state.notes, notes: [action.note, ...state.notes.notes] },
        audio: audioReducer(state.audio, {
          type: 'associate',
          captureId: capture.id,
          noteId: action.note.id,
        }),
      };
    }
    case 'finishCapture': {
      const capture = state.audio.capture;
      if (!capture || capture.id !== action.captureId || capture.elapsedMs <= 0) return state;
      const op = 'save:' + capture.id;
      if (state.failures[op])
        return withOperationResult(
          {
            ...state,
            audio: audioReducer(state.audio, { type: 'saveFailed', captureId: capture.id }),
          },
          op,
          { status: 'error', message: 'Couldn’t save. Your audio is kept.' },
        );
      const recording: Recording = {
        id: capture.id,
        title: capture.title,
        durationMs: capture.elapsedMs,
        createdAt: action.now,
        updatedAt: action.now,
        origin: 'capture',
        transcriptStatus: capture.segments.length ? 'available' : 'unavailable',
        segments: capture.segments,
        moments: capture.moments,
      };
      let next = withOperationResult(
        {
          ...state,
          recordings: [recording, ...state.recordings.filter((r) => r.id !== capture.id)],
          audio: audioReducer(state.audio, { type: 'finished', captureId: capture.id }),
        },
        op,
        { status: 'success', recordingIds: [capture.id] },
      );
      if (capture.noteId) {
        next = linkRecordings(next, {
          type: 'linkRecordings',
          operationId: 'capture-link:' + capture.id,
          recordingIds: [capture.id],
          noteId: capture.noteId,
          now: action.now,
        });
        if (next.operations['capture-link:' + capture.id]?.status === 'error')
          next = {
            ...next,
            notice: {
              id: op,
              message: 'Audio saved, but not added to the note. Open it to choose a note or retry.',
              recordingId: capture.id,
            },
          };
      }
      if (action.playAfterId) {
        const item = next.recordings.find((r) => r.id === action.playAfterId && !r.deletedAt);
        if (item)
          next = {
            ...next,
            audio: audioReducer(next.audio, {
              type: 'play',
              audioId: item.id,
              durationMs: item.durationMs,
            }),
          };
      }
      return next;
    }
    case 'linkRecordings':
      return linkRecordings(state, action);
    case 'unlinkRecording':
      return {
        ...state,
        notes: {
          ...state.notes,
          notes: state.notes.notes.map((n) =>
            n.id === action.noteId && !n.deletedAt
              ? {
                  ...n,
                  recordingIds: n.recordingIds.filter((id) => id !== action.recordingId),
                  updatedAt: action.now,
                }
              : n,
          ),
        },
      };
    case 'renameRecording':
      return !action.title.trim()
        ? state
        : {
            ...state,
            recordings: state.recordings.map((r) =>
              r.id === action.id && !r.deletedAt
                ? { ...r, title: action.title.trim(), updatedAt: action.now }
                : r,
            ),
          };
    case 'trashRecordings': {
      const playback = state.audio.playback;
      const affected = state.recordings
        .filter((r) => action.ids.includes(r.id) && !r.deletedAt)
        .map((r) => r.id);
      if (!affected.length) return state;
      return {
        ...state,
        recordings: state.recordings.map((r) =>
          affected.includes(r.id) ? { ...r, deletedAt: action.now } : r,
        ),
        audio:
          playback.status !== 'idle' && affected.includes(playback.audioId)
            ? audioReducer(state.audio, { type: 'closePlayer', audioId: playback.audioId })
            : state.audio,
        notice: {
          id: action.now,
          message: 'Audio moved to Recently Deleted',
          undo: { resource: 'recordings', ids: affected },
        },
      };
    }
    case 'restoreRecordings':
      return {
        ...state,
        recordings: state.recordings.map((r) => {
          if (!action.ids.includes(r.id)) return r;
          const { deletedAt: _deletedAt, ...restored } = r;
          return restored;
        }),
      };
    case 'deleteRecordingsPermanently': {
      const ids = state.recordings
        .filter((r) => r.deletedAt && action.ids.includes(r.id))
        .map((r) => r.id);
      const positions = { ...state.audio.listeningPositions };
      for (const id of ids) delete positions[id];
      const operations = Object.fromEntries(
        Object.entries(state.operations).map(([id, op]) => [
          id,
          {
            ...op,
            recordingIds: op.recordingIds?.filter((recordingId) => !ids.includes(recordingId)),
          },
        ]),
      );
      return {
        ...state,
        operations,
        recordings: state.recordings.filter((r) => !ids.includes(r.id)),
        notes: {
          ...state.notes,
          notes: state.notes.notes.map((n) => ({
            ...n,
            recordingIds: n.recordingIds.filter((id) => !ids.includes(id)),
          })),
        },
        audio: { ...state.audio, listeningPositions: positions },
      };
    }
    case 'importRecording': {
      if (state.operations[action.operationId]?.status === 'success') return state;
      if (action.error)
        return withOperationResult(state, action.operationId, {
          status: 'error',
          message: action.error,
        });
      return withOperationResult(
        {
          ...state,
          recordings: [
            action.recording,
            ...state.recordings.filter((r) => r.id !== action.recording.id),
          ],
        },
        action.operationId,
        { status: 'success', recordingIds: [action.recording.id] },
      );
    }
  }
}
export function newNote(id: string, folderId: string, now: string, title = ''): Note {
  return { id, title, body: '', folderId, updatedAt: now, pinned: false, recordingIds: [] };
}
export function noteTitle(note: Note): string {
  return note.title.trim() || 'New note';
}
