import { Alert } from 'react-native';
import { useAppDispatch } from './NotesProvider';
/** Destructive presentation lives outside the pure model and row rendering. */
export function useNoteActions() {
  const dispatch = useAppDispatch();
  return {
    trash(ids: string[], onDone?: () => void) {
      Alert.alert(
        ids.length === 1 ? 'Delete note?' : `Delete ${ids.length} notes?`,
        'You can restore them from Recently Deleted.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              dispatch({ type: 'trash', ids, deletedAt: new Date().toISOString() });
              onDone?.();
            },
          },
        ],
      );
    },
    remove(ids: string[], onDone?: () => void) {
      Alert.alert(
        'Delete permanently?',
        'This removes the writing, audio, and transcripts. This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete permanently',
            style: 'destructive',
            onPress: () => {
              dispatch({ type: 'deletePermanently', ids });
              onDone?.();
            },
          },
        ],
      );
    },
  };
}
