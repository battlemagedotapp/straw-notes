import { useAudioTaskAction, useUnsavedRecordingsAction } from '../audio/toolbar';
import { ContentUnavailableView, Host, ScrollView, Text, VStack } from '@expo/ui/swift-ui';
import {
  fixedSize,
  font,
  foregroundColor,
  frame,
  padding,
  textSelection,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/ui/tokens';
import { AudioAttachment } from '../audio/AudioAttachment';
import { useAudioActions } from '../audio/useAudioActions';
import { useAppDispatch, useDeletedNotes, useNotes } from './NotesProvider';
import { noteTitle } from './model';
import { useNoteActions } from './useNoteActions';
import { documentMetadata } from './presentation';

export function NoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, folders } = useNotes();
  const deleted = useDeletedNotes();
  const note = [...notes, ...deleted].find((n) => n.id === id);
  const audioAction = useAudioTaskAction({ attachmentIds: note?.audio.map((a) => a.id) });
  const router = useRouter();
  const unsavedAction = useUnsavedRecordingsAction({ menu: true });
  const audio = useAudioActions();
  const actions = useNoteActions();
  const dispatch = useAppDispatch();
  if (!note)
    return (
      <Host style={{ flex: 1, backgroundColor: colors.background }}>
        <ContentUnavailableView
          title="Note unavailable"
          description="This note is no longer available."
          systemImage="note.text"
        />
      </Host>
    );
  const edit = () => router.push({ pathname: '/note/[id]/edit', params: { id } });
  return (
    <>
      <Stack.Screen options={{ title: note.deletedAt ? 'Deleted note' : 'Notes' }} />
      {!note.deletedAt ? (
        <Stack.Toolbar placement="right">
          {audioAction}
          <Stack.Toolbar.Button icon="pencil" accessibilityLabel="Edit note" onPress={edit}>
            Edit
          </Stack.Toolbar.Button>
          <Stack.Toolbar.Menu icon="ellipsis" accessibilityLabel="Note actions">
            {unsavedAction}
            <Stack.Toolbar.MenuAction
              icon="pencil"
              onPress={() => router.push({ pathname: '/rename-note', params: { id } })}
            >
              Rename note
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction
              icon={note.pinned ? 'pin.slash' : 'pin'}
              onPress={() => dispatch({ type: 'pin', ids: [id], pinned: !note.pinned })}
            >
              {note.pinned ? 'Unpin' : 'Pin'}
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction
              icon="folder"
              onPress={() => router.push({ pathname: '/move-notes', params: { ids: id } })}
            >
              Move to folder
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction
              icon="bookmark"
              onPress={() => router.push({ pathname: '/moments', params: { noteId: id } })}
            >
              Marked moments
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction icon="mic" onPress={audio.startRecording}>
              Record
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction
              icon="trash"
              destructive
              onPress={() => actions.trash([id], () => router.back())}
            >
              Delete
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
        </Stack.Toolbar>
      ) : null}
      <Host style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView>
          <VStack
            alignment="leading"
            spacing={32}
            modifiers={[
              frame({ maxWidth: Infinity, alignment: 'leading' }),
              padding({ vertical: 16, horizontal: 16 }),
            ]}
          >
            <VStack alignment="leading" spacing={8} modifiers={[padding({ horizontal: 8 })]}>
              <Text
                modifiers={[
                  font({ textStyle: 'title', weight: 'bold' }),
                  fixedSize({ horizontal: false, vertical: true }),
                ]}
              >
                {noteTitle(note)}
              </Text>
              <Text modifiers={[font({ textStyle: 'caption' }), foregroundColor(colors.secondary)]}>
                {documentMetadata(
                  note,
                  folders.find((f) => f.id === note.folderId)?.name ?? 'Notes',
                )}
              </Text>
            </VStack>
            {note.body ? (
              <VStack alignment="leading" spacing={16} modifiers={[padding({ horizontal: 8 })]}>
                {note.body.split(/\n\n+/).map((paragraph, i) => (
                  <Text
                    key={i}
                    modifiers={[
                      font({ textStyle: 'body' }),
                      fixedSize({ horizontal: false, vertical: true }),
                      textSelection(true),
                    ]}
                  >
                    {paragraph}
                  </Text>
                ))}
              </VStack>
            ) : !note.audio.length ? (
              <Text modifiers={[foregroundColor(colors.secondary)]}>Start writing with Edit.</Text>
            ) : null}
            {note.deletedAt
              ? note.audio.map((item) => <Text key={item.id}>{item.title} · Audio recording</Text>)
              : note.audio.map((item) => <AudioAttachment key={item.id} item={item} />)}
          </VStack>
        </ScrollView>
      </Host>
      {note.deletedAt ? (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            onPress={() => {
              dispatch({ type: 'restore', ids: [id] });
              router.back();
            }}
          >
            Restore
          </Stack.Toolbar.Button>
          <Stack.Toolbar.Button
            icon="trash"
            accessibilityLabel="Delete permanently"
            onPress={() => actions.remove([id], () => router.back())}
          >
            Delete
          </Stack.Toolbar.Button>
        </Stack.Toolbar>
      ) : null}
    </>
  );
}
