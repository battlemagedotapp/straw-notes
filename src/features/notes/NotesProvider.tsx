import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import { AppState as NativeAppState } from 'react-native';
import type { AudioState } from '../audio/model';
import { appReducer, createAppState, type AppAction, type NotesState } from './model';
import type { Folder, Note, TranscriptSegment } from './types';

const NotesContext = createContext<NotesState | null>(null);
const AudioContext = createContext<AudioState | null>(null);
const DispatchContext = createContext<Dispatch<AppAction> | null>(null);
const FailureContext = createContext(false);

export function NotesProvider({
  children,
  initialNotes,
  folders,
  simulatedTranscript,
}: {
  children: ReactNode;
  initialNotes: Note[];
  folders: Folder[];
  simulatedTranscript: TranscriptSegment[];
}) {
  const [state, dispatch] = useReducer(appReducer, undefined, () =>
    createAppState(initialNotes, folders),
  );
  const running =
    state.audio.capture?.status === 'recording' || state.audio.playback.status === 'playing';
  useEffect(() => {
    if (!running) return;
    let previous = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      dispatch({
        type: 'audio',
        action: { type: 'tick', deltaMs: now - previous, segments: simulatedTranscript },
      });
      previous = now;
    }, 250);
    return () => clearInterval(timer);
  }, [running, simulatedTranscript]);
  useEffect(() => {
    const subscription = NativeAppState.addEventListener('change', (next) => {
      if (next === 'background') dispatch({ type: 'audio', action: { type: 'interrupt' } });
    });
    return () => subscription.remove();
  }, []);
  return (
    <DispatchContext value={dispatch}>
      <NotesContext value={state.notes}>
        <AudioContext value={state.audio}>
          <FailureContext value={state.failNextSave}>{children}</FailureContext>
        </AudioContext>
      </NotesContext>
    </DispatchContext>
  );
}
export function useNotes() {
  const value = useContext(NotesContext);
  if (!value) throw new Error('useNotes requires NotesProvider');
  return useMemo(() => ({ ...value, notes: value.notes.filter((n) => !n.deletedAt) }), [value]);
}
export function useDeletedNotes() {
  const value = useContext(NotesContext);
  if (!value) throw new Error('useDeletedNotes requires NotesProvider');
  return value.notes.filter((n) => n.deletedAt);
}
export function useAudio() {
  const value = useContext(AudioContext);
  if (!value) throw new Error('useAudio requires NotesProvider');
  return value;
}
export function useAppDispatch() {
  const value = useContext(DispatchContext);
  if (!value) throw new Error('useAppDispatch requires NotesProvider');
  return value;
}
export function useSaveFailureEnabled() {
  return useContext(FailureContext);
}
let sequence = 0;
export function createId() {
  return `${Date.now()}-${++sequence}`;
}
