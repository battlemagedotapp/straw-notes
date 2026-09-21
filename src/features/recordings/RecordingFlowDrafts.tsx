import { useNotes, useRecordings } from '../notes/NotesProvider';
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
export interface FlowDraft {
  query: string;
  destination: string;
  folder: string;
  title?: string;
  selected: string[];
  operationId: string;
  newNoteId: string;
  review: boolean;
}
const RecordingFlowDraftsContext = createContext<{
  drafts: Record<string, FlowDraft>;
  update: (key: string, value: Partial<FlowDraft>) => void;
  clear: (key: string) => void;
} | null>(null);
const emptyDraft: FlowDraft = {
  query: '',
  destination: '',
  folder: 'personal',
  selected: [],
  operationId: '',
  newNoteId: '',
  review: false,
};
/** Session-only task drafts survive native sheet dismissal. */
export function RecordingFlowDraftsProvider({ children }: { children: ReactNode }) {
  const [drafts, setDrafts] = useState<Record<string, FlowDraft>>({});
  const { notes } = useNotes();
  const recordings = useRecordings();
  const validKey = (key: string) =>
    key.startsWith('note:')
      ? notes.some((n) => n.id === key.slice(5))
      : key.startsWith('recordings:')
        ? key
            .slice(11)
            .split(',')
            .every((id) => recordings.some((r) => r.id === id && !r.deletedAt))
        : true;
  if (Object.keys(drafts).some((key) => !validKey(key)))
    setDrafts(Object.fromEntries(Object.entries(drafts).filter(([key]) => validKey(key))));
  const update = useCallback(
    (key: string, value: Partial<FlowDraft>) =>
      setDrafts((old) => ({ ...old, [key]: { ...(old[key] ?? emptyDraft), ...value } })),
    [],
  );
  const clear = useCallback(
    (key: string) =>
      setDrafts((old) =>
        key in old ? Object.fromEntries(Object.entries(old).filter(([id]) => id !== key)) : old,
      ),
    [],
  );
  return (
    <RecordingFlowDraftsContext value={{ drafts, update, clear }}>
      {children}
    </RecordingFlowDraftsContext>
  );
}
export function useRecordingFlowDraft(key: string) {
  const value = useContext(RecordingFlowDraftsContext);
  const updateDraft = value?.update;
  const clearDraft = value?.clear;
  const update = useCallback(
    (next: Partial<FlowDraft>) => updateDraft?.(key, next),
    [key, updateDraft],
  );
  const clear = useCallback(() => clearDraft?.(key), [key, clearDraft]);
  if (!value) throw new Error('Flow drafts require provider');
  return {
    draft: value.drafts[key] ?? emptyDraft,
    update,
    clear,
  };
}
