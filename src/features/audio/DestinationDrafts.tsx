import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

import { useAudio } from '../notes/NotesProvider';

interface DestinationDraft {
  query: string;
  destination: string;
  folder: string;
  title: string;
}
const emptyDraft: DestinationDraft = {
  query: '',
  destination: '',
  folder: 'personal',
  title: 'New recording',
};
const Context = createContext<{
  drafts: Record<string, DestinationDraft>;
  update: (id: string, value: Partial<DestinationDraft>) => void;
  clear: (id: string) => void;
} | null>(null);

/** Session-only sheet input survives dismissal without entering the audio domain model. */
export function DestinationDraftsProvider({ children }: { children: ReactNode }) {
  const [drafts, setDrafts] = useState<Record<string, DestinationDraft>>({});
  const { capture, pending } = useAudio();
  const activeId = capture?.id;
  // Reconcile drafts when their owning capture is removed, before exposing context.
  const retained = new Set([activeId, ...pending.map((c) => c.id)]);
  if (Object.keys(drafts).some((id) => !retained.has(id))) {
    setDrafts(Object.fromEntries(Object.entries(drafts).filter(([id]) => retained.has(id))));
  }
  const clear = useCallback(
    (id: string) =>
      setDrafts((current) => {
        if (!(id in current)) return current;
        const next = { ...current };
        delete next[id];
        return next;
      }),
    [],
  );
  return (
    <Context
      value={{
        drafts,
        update: (id, value) =>
          setDrafts((current) => ({
            ...current,
            [id]: { ...(current[id] ?? emptyDraft), ...value },
          })),
        clear,
      }}
    >
      {children}
    </Context>
  );
}
export function useDestinationDraft(id: string) {
  const context = useContext(Context);
  if (!context) throw new Error('Destination drafts require DestinationDraftsProvider');
  return {
    draft: context.drafts[id] ?? emptyDraft,
    update: (value: Partial<DestinationDraft>) => context.update(id, value),
    clear: (captureId = id) => context.clear(captureId),
  };
}
