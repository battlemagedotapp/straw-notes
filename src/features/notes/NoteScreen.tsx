import { useAudioTaskAction } from '../audio/useAudioTaskAction';
import { Button, ContentUnavailableView, Host, ScrollView, Text, VStack } from '@expo/ui/swift-ui';
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
import {
  useAppDispatch,
  useDeletedNotes,
  useNotes,
  useRecordings,
  useAudio,
} from './NotesProvider';
import { noteTitle } from './model';
import { useNoteActions } from './useNoteActions';
import { documentMetadata } from './presentation';

export function NoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, folders } = useNotes();
  const deleted = useDeletedNotes();
  const recordings = useRecordings();
  const { capture } = useAudio();
  const note = [...notes, ...deleted].find((n) => n.id === id);
  const audioAction = useAudioTaskAction({ attachmentIds: note?.recordingIds });
  const router = useRouter();
  const audio = useAudioActions();
  const actions = useNoteActions();
  const dispatch = useAppDispatch();
  if (!note)
    return (
      <>
        <Stack.Screen options={{ title: 'Note unavailable' }} />
        <Host style={{ flex: 1, backgroundColor: colors.background }}>
          <ContentUnavailableView
            title="Note unavailable"
            description="This note is no longer available."
            systemImage="note.text"
          />
        </Host>
      </>
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
            <Stack.Toolbar.Menu title="Add audio" icon="waveform">
              <Stack.Toolbar.MenuAction
                icon="waveform"
                onPress={() =>
                  router.push({ pathname: '/choose-recordings', params: { noteId: id } })
                }
              >
                Choose audio
              </Stack.Toolbar.MenuAction>
              <Stack.Toolbar.MenuAction icon="mic" onPress={() => audio.startCapture(id)}>
                {capture ? 'Open recorder' : 'Record new'}
              </Stack.Toolbar.MenuAction>
            </Stack.Toolbar.Menu>
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
            ) : !note.recordingIds.length ? (
              <Text modifiers={[foregroundColor(colors.secondary)]}>Start writing with Edit.</Text>
            ) : null}
            {note.recordingIds.map((recordingId) => {
              const item = recordings.find((r) => r.id === recordingId);
              if (!item) return null;
              const unlink = () =>
                dispatch({
                  type: 'unlinkRecording',
                  noteId: id,
                  recordingId: item.id,
                  now: new Date().toISOString(),
                });
              return (
                <VStack key={item.id} alignment="leading" spacing={8}>
                  {note.deletedAt ? (
                    <Text>
                      {item.title} · {item.deletedAt ? 'Audio deleted' : 'Audio'}
                    </Text>
                  ) : item.deletedAt ? (
                    <>
                      <Text>{item.title} · Audio deleted</Text>
                      <Button
                        label="Restore audio"
                        systemImage="arrow.uturn.backward"
                        onPress={() => dispatch({ type: 'restoreRecordings', ids: [item.id] })}
                      />
                    </>
                  ) : (
                    <AudioAttachment item={item} />
                  )}
                  {!note.deletedAt ? <Button label="Remove from Note" onPress={unlink} /> : null}
                </VStack>
              );
            })}
          </VStack>
        </ScrollView>
      </Host>
      {note.deletedAt ? (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            icon="arrow.uturn.backward"
            accessibilityLabel="Restore note"
            onPress={() => {
              dispatch({ type: 'restore', ids: [id] });
              router.back();
            }}
          >
            Restore
          </Stack.Toolbar.Button>
          <Stack.Toolbar.Button
            icon="trash"
            tintColor={colors.destructive}
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
