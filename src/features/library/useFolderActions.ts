import { Alert } from 'react-native';
import { useAppDispatch, useNotes } from '../notes/NotesProvider';

export function useFolderActions() {
  const dispatch = useAppDispatch();
  const { folders } = useNotes();
  return {
    remove(ids: string[], onComplete?: () => void) {
      const deletable = ids.filter((id) => id !== 'personal' && folders.some((f) => f.id === id));
      if (!deletable.length) return;
      const home = folders.find((f) => f.id === 'personal')?.name ?? 'Personal';
      Alert.alert(
        deletable.length === 1 ? 'Delete folder?' : `Delete ${deletable.length} folders?`,
        `Their notes will move to ${home}.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              for (const id of deletable) dispatch({ type: 'deleteFolder', id });
              onComplete?.();
            },
          },
        ],
      );
    },
  };
}
