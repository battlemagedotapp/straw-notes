import { Alert } from 'react-native';
import { useAppDispatch } from './NotesProvider';
/** Destructive presentation lives outside the pure model and row rendering. */
export function useNoteActions() {
  const dispatch = useAppDispatch();
  return {
    trash(ids: string[], onDone?: () => void) {
      dispatch({ type: 'trash', ids, deletedAt: new Date().toISOString() });
      onDone?.();
    },
    remove(ids: string[], onDone?: () => void) {
      Alert.alert(
        'Delete permanently?',
        'This removes the note and its writing. Audio stays in your library. This cannot be undone.',
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
