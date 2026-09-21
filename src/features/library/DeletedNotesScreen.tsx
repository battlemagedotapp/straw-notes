import { notePreview } from '../notes/presentation';
import { Button, ContentUnavailableView, Host, List } from '@expo/ui/swift-ui';
import { colors } from '@/ui/tokens';
import { buttonStyle, listStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useDeletedNotes, useNotes, useRecordings } from '../notes/NotesProvider';
import { NoteRow } from '../notes/NoteRow';
export function DeletedNotesScreen() {
  const notes = useDeletedNotes();
  const recordings = useRecordings();
  const { folders } = useNotes();
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ title: 'Recently Deleted', headerLargeTitleEnabled: true }} />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          disabled={!notes.length}
          onPress={() => router.push({ pathname: '/select-notes', params: { deleted: 'true' } })}
        >
          Select
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Host style={{ flex: 1, backgroundColor: colors.grouped }}>
        {notes.length ? (
          <List modifiers={[listStyle('insetGrouped')]}>
            {notes.map((note) => (
              <Button
                key={note.id}
                modifiers={[buttonStyle('plain')]}
                onPress={() => router.push({ pathname: '/note/[id]', params: { id: note.id } })}
              >
                <NoteRow
                  note={note}
                  preview={notePreview(note, recordings)}
                  folderName={folders.find((f) => f.id === note.folderId)?.name ?? 'Notes'}
                />
              </Button>
            ))}
          </List>
        ) : (
          <ContentUnavailableView
            title="No deleted notes"
            systemImage="trash"
            description="Deleted notes will appear here."
          />
        )}
      </Host>
    </>
  );
}
