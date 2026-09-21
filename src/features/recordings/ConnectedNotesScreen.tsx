import {
  Button,
  ContentUnavailableView,
  Host,
  HStack,
  Image,
  List,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import {
  buttonStyle,
  contentShape,
  shapes,
  font,
  foregroundColor,
  frame,
  lineLimit,
  listStyle,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/ui/tokens';
import { useNotes, useRecordings } from '../notes/NotesProvider';
import { noteTitle } from '../notes/model';
import { useAudioNavigation } from '../audio/useAudioNavigation';

/** A secondary resource task. Closing returns to the same audio workspace. */
export function ConnectedNotesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recording = useRecordings().find((item) => item.id === id && !item.deletedAt);
  const { notes, folders } = useNotes();
  const connected = notes.filter((note) => note.recordingIds.includes(id));
  const router = useRouter();
  const audioNavigation = useAudioNavigation();
  const close = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/recordings'));
  const add = () => router.replace({ pathname: '/link-recordings', params: { ids: id } });
  return (
    <>
      <Stack.Screen options={{ title: 'Connected Notes' }} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon="xmark"
          accessibilityLabel="Close connected notes"
          onPress={close}
        >
          Close
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      {recording ? (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button icon="plus" accessibilityLabel="Add audio to a note" onPress={add}>
            Add to Note
          </Stack.Toolbar.Button>
        </Stack.Toolbar>
      ) : null}
      <Host style={{ flex: 1 }}>
        {!recording ? (
          <ContentUnavailableView title="Audio unavailable" systemImage="waveform" />
        ) : connected.length ? (
          <List modifiers={[listStyle('plain')]}>
            {connected.map((note) => (
              <Button
                key={note.id}
                onPress={() => audioNavigation.openNote(note.id)}
                modifiers={[buttonStyle('plain')]}
              >
                <HStack spacing={12} modifiers={[contentShape(shapes.rectangle())]}>
                  <VStack
                    alignment="leading"
                    spacing={4}
                    modifiers={[frame({ maxWidth: Infinity, alignment: 'leading' })]}
                  >
                    <Text modifiers={[font({ textStyle: 'body' }), lineLimit(2)]}>
                      {noteTitle(note)}
                    </Text>
                    <Text
                      modifiers={[
                        font({ textStyle: 'subheadline' }),
                        foregroundColor(colors.secondary),
                      ]}
                    >
                      {folders.find((folder) => folder.id === note.folderId)?.name ?? 'Notes'}
                    </Text>
                  </VStack>
                  <Image
                    systemName="chevron.right"
                    modifiers={[font({ textStyle: 'caption' }), foregroundColor(colors.secondary)]}
                  />
                </HStack>
              </Button>
            ))}
          </List>
        ) : (
          <ContentUnavailableView
            title="No connected notes"
            description="Add this audio to a note anytime."
            systemImage="note.text"
          />
        )}
      </Host>
    </>
  );
}
