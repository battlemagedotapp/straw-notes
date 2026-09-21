import { useAppDispatch, useDeletedNotes, useNotice, useRecordings } from './NotesProvider';

/** Recovery remains available until replaced by another deletion; navigation never restarts it. */
export function useUndoDeletion(resource: 'notes' | 'recordings') {
  const notice = useNotice();
  const deletedNotes = useDeletedNotes();
  const recordings = useRecordings();
  const dispatch = useAppDispatch();
  const candidates =
    resource === 'notes' ? deletedNotes : recordings.filter((item) => item.deletedAt);
  const ids =
    notice?.undo?.resource === resource
      ? notice.undo.ids.filter((id) => candidates.some((item) => item.id === id))
      : [];
  return {
    available: ids.length > 0,
    undo: () => {
      if (!notice || !ids.length) return;
      dispatch(
        resource === 'notes' ? { type: 'restore', ids } : { type: 'restoreRecordings', ids },
      );
      dispatch({ type: 'clearNotice', id: notice.id });
    },
  };
}
