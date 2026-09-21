import { useAudioNavigation } from '@/features/audio/useAudioNavigation';
import {
  Button,
  ContentUnavailableView,
  Host,
  HStack,
  Image,
  Spacer,
  List,
  Section,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import {
  buttonStyle,
  font,
  foregroundColor,
  listStyle,
  lineLimit,
  contentShape,
  shapes,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/ui/tokens';
import { useNotes, useAudio, useRecordings } from '../notes/NotesProvider';
import { formatTime } from './model';
import { momentExcerpt } from './momentPresentation';
export function MomentsScreen() {
  const { noteId, audioId, captureId } = useLocalSearchParams<{
    noteId?: string;
    audioId?: string;
    captureId?: string;
  }>();
  const { notes } = useNotes();
  const audio = useAudio();
  const recordings = useRecordings();
  const router = useRouter();
  const audioNavigation = useAudioNavigation();
  const note = notes.find((n) => n.id === noteId);
  const items = captureId
    ? audio.capture?.id === captureId
      ? [{ ...audio.capture, durationMs: audio.capture.elapsedMs }]
      : []
    : recordings.filter(
        (r) =>
          !r.deletedAt &&
          (!noteId || note?.recordingIds.includes(r.id)) &&
          (!audioId || r.id === audioId),
      );
  const count = items.reduce((n, a) => n + a.moments.length, 0);
  return (
    <>
      <Stack.Screen options={{ title: 'Marked moments' }} />
      {captureId ? (
        <Stack.Toolbar placement="left">
          <Stack.Toolbar.Button
            icon="xmark"
            accessibilityLabel="Close marked moments"
            onPress={() => router.back()}
          >
            Close
          </Stack.Toolbar.Button>
        </Stack.Toolbar>
      ) : null}
      <Host style={{ flex: 1 }}>
        {count ? (
          <List modifiers={[listStyle('insetGrouped')]}>
            {items
              .filter((a) => a.moments.length)
              .map((a, index) => (
                <Section
                  key={a.id}
                  header={
                    <VStack alignment="leading" spacing={12}>
                      {index === 0 ? (
                        <Text
                          modifiers={[
                            font({ textStyle: 'title', weight: 'bold' }),
                            foregroundColor(colors.primary),
                          ]}
                        >
                          Marked moments
                        </Text>
                      ) : null}
                      <Text
                        modifiers={[
                          font({ textStyle: 'subheadline' }),
                          foregroundColor(colors.secondary),
                        ]}
                      >
                        {a.title} · {a.moments.length}{' '}
                        {a.moments.length === 1 ? 'moment' : 'moments'}
                      </Text>
                    </VStack>
                  }
                >
                  {a.moments.map((m) => (
                    <Button
                      key={m.id}
                      modifiers={[buttonStyle('plain')]}
                      onPress={() =>
                        captureId
                          ? audioNavigation.openCapture(captureId, true)
                          : audioNavigation.openRecording(a.id, m.timeMs)
                      }
                    >
                      <HStack modifiers={[contentShape(shapes.rectangle())]}>
                        <VStack alignment="leading" spacing={4}>
                          <Text modifiers={[font({ textStyle: 'body' })]}>
                            {formatTime(m.timeMs)}
                          </Text>
                          <Text
                            modifiers={[
                              font({ textStyle: 'subheadline' }),
                              lineLimit(2),
                              foregroundColor(colors.secondary),
                            ]}
                          >
                            {momentExcerpt(a.segments, m.timeMs)}
                          </Text>
                        </VStack>
                        <Spacer />
                        <Image
                          systemName="chevron.right"
                          modifiers={[
                            font({ textStyle: 'caption' }),
                            foregroundColor(colors.secondary),
                          ]}
                        />
                      </HStack>
                    </Button>
                  ))}
                </Section>
              ))}
          </List>
        ) : (
          <ContentUnavailableView
            title="No marked moments"
            description="Mark a moment while recording, or bookmark a transcript passage."
            systemImage="bookmark"
          />
        )}
      </Host>
    </>
  );
}
