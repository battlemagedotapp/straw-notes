import { useUnsavedRecordingsAction } from './toolbar';
import { useAudioActions } from './useAudioActions';
import { ContentUnavailableView, Host, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundColor, padding } from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useIsFocused } from 'expo-router/react-navigation';
import { useEffect, useRef } from 'react';
import { colors } from '@/ui/tokens';
import { useAccessibility } from '@/ui/useAccessibility';
import { createId, useAppDispatch, useNotes } from '../notes/NotesProvider';
import { TranscriptPassages } from './TranscriptPassages';
import { CompactPlayback } from './CompactPlayback';
import { usePlayback } from './usePlayback';
import { formatTime } from './model';
import type { AudioAttachment } from '../notes/types';

function Transcript({ item, at }: { item: AudioAttachment; at?: string }) {
  const controls = usePlayback(item);
  const { closePlayer } = useAudioActions();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const unsavedAction = useUnsavedRecordingsAction();
  const { largeText } = useAccessibility();
  const focused = useIsFocused();
  const appliedEntry = useRef<string | null>(null);
  useEffect(() => {
    if (!focused || at === undefined || appliedEntry.current === at) return;
    appliedEntry.current = at;
    controls.onSeek(Number(at));
  }, [at, focused, controls]);
  const openControls = () => router.push({ pathname: '/playback/[id]', params: { id: item.id } });
  const header = (
    <VStack alignment="leading" spacing={12}>
      <Text modifiers={[font({ textStyle: 'title', weight: 'bold' }), padding({ horizontal: 8 })]}>
        {item.title}
      </Text>
      <Text
        modifiers={[
          font({ textStyle: 'caption' }),
          foregroundColor(colors.secondary),
          padding({ horizontal: 8 }),
        ]}
      >
        Transcript · {formatTime(item.durationMs)}
      </Text>
      <CompactPlayback {...controls} onControls={openControls} />
    </VStack>
  );
  return (
    <>
      <Stack.Screen options={{ title: 'Transcript' }} />
      <Stack.Toolbar placement="right">
        {unsavedAction}
        <Stack.Toolbar.Button
          icon="xmark"
          accessibilityLabel="Close player"
          onPress={() => {
            closePlayer(item.id);
            router.back();
          }}
        >
          Close player
        </Stack.Toolbar.Button>
        <Stack.Toolbar.Menu icon="ellipsis" accessibilityLabel="Transcript actions">
          <Stack.Toolbar.MenuAction icon="slider.horizontal.3" onPress={openControls}>
            Playback controls
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            icon="bookmark"
            onPress={() => router.push({ pathname: '/moments', params: { audioId: item.id } })}
          >
            Marked moments
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
      <Host style={{ flex: 1, backgroundColor: colors.background }}>
        <VStack spacing={0}>
          {!largeText ? <VStack modifiers={[padding({ all: 16 })]}>{header}</VStack> : null}
          <TranscriptPassages
            segments={item.segments}
            header={largeText ? header : undefined}
            initialTimeMs={at === undefined ? undefined : Number(at)}
            positionMs={controls.positionMs}
            playing={controls.playing}
            moments={item.moments}
            onSeek={controls.onSeek}
            onBookmark={(segment) =>
              dispatch({
                type: 'bookmark',
                audioId: item.id,
                timeMs:
                  item.moments.find(
                    (moment) =>
                      moment.timeMs >= segment.startMs &&
                      moment.timeMs <
                        (item.segments[item.segments.indexOf(segment) + 1]?.startMs ?? Infinity),
                  )?.timeMs ?? segment.startMs,
                id: createId(),
                name: segment.text.split(/[.!?]/)[0] || 'Moment',
              })
            }
          />
        </VStack>
      </Host>
    </>
  );
}
export function TranscriptScreen() {
  const { id, at } = useLocalSearchParams<{ id: string; at?: string }>();
  const item = useNotes()
    .notes.flatMap((n) => n.audio)
    .find((a) => a.id === id);
  return item ? (
    <Transcript key={id} item={item} at={at} />
  ) : (
    <Host style={{ flex: 1 }}>
      <ContentUnavailableView title="Audio unavailable" systemImage="waveform" />
    </Host>
  );
}
