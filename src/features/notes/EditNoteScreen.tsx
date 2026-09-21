import { useAudioTaskAction } from '../audio/useAudioTaskAction';
import { colors } from '@/ui/tokens';
import {
  ContentUnavailableView,
  Host,
  ScrollView,
  TextField,
  Text,
  VStack,
  useNativeState,
} from '@expo/ui/swift-ui';
import {
  accessibilityLabel,
  font,
  foregroundColor,
  frame,
  padding,
  scrollDismissesKeyboard,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useAppDispatch, useNotes } from './NotesProvider';
import { documentMetadata } from './presentation';
import type { Note } from './types';

function Editor({ note }: { note: Note }) {
  const { folders } = useNotes();
  const title = useNativeState(note.title);
  const body = useNativeState(note.body);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const audioAction = useAudioTaskAction();
  const save = (field: 'title' | 'body', value: string) =>
    dispatch({
      type: 'write',
      id: note.id,
      title: field === 'title' ? value : title.value,
      body: field === 'body' ? value : body.value,
      updatedAt: new Date().toISOString(),
    });
  return (
    <>
      <Stack.Toolbar placement="right">
        {audioAction}
        <Stack.Toolbar.Button
          variant="done"
          onPress={() => router.dismissTo({ pathname: '/note/[id]', params: { id: note.id } })}
        >
          Done
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Host style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView modifiers={[scrollDismissesKeyboard('interactively')]}>
          <VStack
            alignment="leading"
            spacing={16}
            modifiers={[
              frame({ maxWidth: Infinity, alignment: 'leading' }),
              padding({ horizontal: 24, vertical: 16 }),
            ]}
          >
            <TextField
              text={title}
              axis="vertical"
              placeholder="Title"
              onTextChange={(value) => save('title', value)}
              modifiers={[
                font({ textStyle: 'title', weight: 'bold' }),
                accessibilityLabel('Note title'),
              ]}
            />
            <Text
              modifiers={[
                font({ textStyle: 'caption' }),
                foregroundColor(colors.secondary),
                padding({ bottom: 16 }),
              ]}
            >
              {documentMetadata(note, folders.find((f) => f.id === note.folderId)?.name ?? 'Notes')}
            </Text>
            <TextField
              text={body}
              axis="vertical"
              autoFocus
              placeholder="Start writing…"
              onTextChange={(value) => save('body', value)}
              modifiers={[font({ textStyle: 'body' }), accessibilityLabel('Note body')]}
            />
          </VStack>
        </ScrollView>
      </Host>
    </>
  );
}
export function EditNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const note = useNotes().notes.find((n) => n.id === id);
  return (
    <>
      <Stack.Screen options={{ title: 'Writing' }} />
      {note ? (
        <Editor key={id} note={note} />
      ) : (
        <Host style={{ flex: 1, backgroundColor: colors.background }}>
          <ContentUnavailableView title="Note unavailable" systemImage="note.text" />
        </Host>
      )}
    </>
  );
}
