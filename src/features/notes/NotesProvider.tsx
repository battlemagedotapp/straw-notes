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
import {
  appReducer,
  createAppState,
  type AppAction,
  type NotesState,
  type OperationResult,
  type Notice,
} from './model';
import type { Folder, Note, Recording, TranscriptSegment } from './types';

const NotesContext = createContext<NotesState | null>(null);
const AudioContext = createContext<AudioState | null>(null);
const DispatchContext = createContext<Dispatch<AppAction> | null>(null);
const RecordingsContext = createContext<Recording[]>([]);
const OperationsContext = createContext<Record<string, OperationResult>>({});
const NoticeContext = createContext<Notice | null>(null);
const SamplesContext = createContext<ImportSample[]>([]);
export interface ImportSample {
  id: string;
  title: string;
  durationMs: number;
  outcome: 'success' | 'retry' | 'unsupported';
  segments: TranscriptSegment[];
}

export function NotesProvider({
  children,
  initialNotes,
  folders,
  simulatedTranscript,
  initialRecordings,
  importSamples,
}: {
  children: ReactNode;
  initialNotes: Note[];
  folders: Folder[];
  simulatedTranscript: TranscriptSegment[];
  initialRecordings: Recording[];
  importSamples: ImportSample[];
}) {
  const [state, dispatch] = useReducer(appReducer, undefined, () =>
    createAppState(initialNotes, folders, initialRecordings),
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
          <RecordingsContext value={state.recordings}>
            <OperationsContext value={state.operations}>
              <NoticeContext value={state.notice}>
                <SamplesContext value={importSamples}>{children}</SamplesContext>
              </NoticeContext>
            </OperationsContext>
          </RecordingsContext>
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
export function useRecordings() {
  return useContext(RecordingsContext);
}
export function useOperations() {
  return useContext(OperationsContext);
}
export function useNotice() {
  return useContext(NoticeContext);
}
export function useImportSamples() {
  return useContext(SamplesContext);
}
let sequence = 0;
export function createId() {
  return `${Date.now()}-${++sequence}`;
}
