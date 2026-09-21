import {
  Button,
  ContentUnavailableView,
  Host,
  HStack,
  Image,
  List,
  Section,
  Text,
} from '@expo/ui/swift-ui';
import {
  accessibilityValue,
  buttonStyle,
  listStyle,
  foregroundColor,
  contentShape,
  shapes,
  font,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/ui/tokens';
import { useState } from 'react';
import { useAppDispatch, useDeletedNotes, useNotes, useRecordings } from '../notes/NotesProvider';
import { NoteRow } from '../notes/NoteRow';
import { notePreview, dateGroup } from '../notes/presentation';
import { useNoteActions } from '../notes/useNoteActions';

export function SelectNotesScreen() {
  const { folderId, deleted } = useLocalSearchParams<{ folderId?: string; deleted?: string }>();
  const { notes: active, folders } = useNotes();
  const removed = useDeletedNotes();
  const notes = (deleted ? removed : active).filter((n) => !folderId || n.folderId === folderId);
  const [selected, setSelected] = useState<string[]>([]);
  const ids = selected.filter((id) => notes.some((n) => n.id === id));
  const recordings = useRecordings();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const actions = useNoteActions();
  const groups = [
    ...new Set(
      notes.map((n) => (deleted ? 'Deleted notes' : n.pinned ? 'Pinned' : dateGroup(n.updatedAt))),
    ),
  ];
  groups.sort((a, b) => (a === 'Pinned' ? -1 : b === 'Pinned' ? 1 : 0));
  const finish = () => router.back();
  return (
    <>
      <Stack.Screen options={{ title: `${ids.length} Selected`, headerBackVisible: false }} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          disabled={!notes.length}
          onPress={() => setSelected(ids.length === notes.length ? [] : notes.map((n) => n.id))}
        >
          {ids.length === notes.length && notes.length ? 'Deselect All' : 'Select All'}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu icon="ellipsis" accessibilityLabel="Selection actions">
          {deleted ? (
            <Stack.Toolbar.MenuAction
              icon="arrow.uturn.backward"
              disabled={!ids.length}
              onPress={() => {
                dispatch({ type: 'restore', ids });
                finish();
              }}
            >
              Restore
            </Stack.Toolbar.MenuAction>
          ) : (
            <Stack.Toolbar.MenuAction
              icon="folder"
              disabled={!ids.length}
              onPress={() =>
                router.push({ pathname: '/move-notes', params: { ids: ids.join(',') } })
              }
            >
              Move
            </Stack.Toolbar.MenuAction>
          )}
          <Stack.Toolbar.MenuAction
            icon="trash"
            destructive
            disabled={!ids.length}
            onPress={() => (deleted ? actions.remove(ids, finish) : actions.trash(ids, finish))}
          >
            Delete
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
        <Stack.Toolbar.Button variant="done" onPress={finish}>
          Done
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Host style={{ flex: 1 }}>
        <List modifiers={[listStyle('insetGrouped')]}>
          {notes.length ? (
            groups.map((group) => (
              <Section
                key={group}
                title={group}
                footer={
                  deleted ? (
                    <Text>
                      Deleting permanently removes the note and writing. Audio stays in your
                      library.
                    </Text>
                  ) : undefined
                }
              >
                {notes
                  .filter(
                    (n) =>
                      (deleted ? 'Deleted notes' : n.pinned ? 'Pinned' : dateGroup(n.updatedAt)) ===
                      group,
                  )
                  .map((note) => (
                    <Button
                      key={note.id}
                      modifiers={[
                        buttonStyle('plain'),
                        accessibilityValue(ids.includes(note.id) ? 'Selected' : 'Not selected'),
                      ]}
                      onPress={() =>
                        setSelected((current) =>
                          current.includes(note.id)
                            ? current.filter((id) => id !== note.id)
                            : [...current, note.id],
                        )
                      }
                    >
                      <HStack modifiers={[contentShape(shapes.rectangle())]}>
                        <NoteRow
                          note={note}
                          folderName={
                            folderId
                              ? undefined
                              : (folders.find((f) => f.id === note.folderId)?.name ?? 'Notes')
                          }
                          preview={folderId || deleted ? notePreview(note, recordings) : undefined}
                        />
                        <Image
                          modifiers={[
                            font({ textStyle: 'title3' }),
                            foregroundColor(
                              ids.includes(note.id) ? colors.signal : colors.secondary,
                            ),
                          ]}
                          systemName={ids.includes(note.id) ? 'checkmark.circle.fill' : 'circle'}
                        />
                      </HStack>
                    </Button>
                  ))}
              </Section>
            ))
          ) : (
            <ContentUnavailableView title="No notes" systemImage="note.text" />
          )}
        </List>
      </Host>
    </>
  );
}
