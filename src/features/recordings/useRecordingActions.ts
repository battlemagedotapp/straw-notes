import { Alert } from 'react-native';
import { useAppDispatch, useNotes, useDeletedNotes } from '../notes/NotesProvider';
import { noteTitle } from '../notes/model';
export function useRecordingActions() {
  const dispatch = useAppDispatch();
  const { notes } = useNotes();
  const deletedNotes = useDeletedNotes();
  return {
    trash(ids: string[], done?: () => void) {
      const used = [...notes, ...deletedNotes].filter((n) =>
        n.recordingIds.some((id) => ids.includes(id)),
      );
      const remove = () => {
        dispatch({ type: 'trashRecordings', ids, now: new Date().toISOString() });
        done?.();
      };
      if (!used.length) {
        remove();
        return;
      }
      Alert.alert(
        'Delete linked audio?',
        `Audio will be unavailable in ${used.map(noteTitle).join(', ')}. Restore it from Recently Deleted to reconnect it. Your writing stays intact.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete audio', style: 'destructive', onPress: remove },
        ],
      );
    },
    remove(ids: string[], done?: () => void) {
      Alert.alert(
        'Delete audio permanently?',
        'This removes the audio, transcripts, marked moments and attachments from all notes. This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete permanently',
            style: 'destructive',
            onPress: () => {
              dispatch({ type: 'deleteRecordingsPermanently', ids });
              done?.();
            },
          },
        ],
      );
    },
  };
}
