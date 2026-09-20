/* eslint-disable react-hooks/immutability -- Expo useNativeState exposes native scroll bindings through .value. */
import {
  Button,
  ContentUnavailableView,
  HStack,
  ScrollView,
  Text,
  VStack,
  useNativeState,
} from '@expo/ui/swift-ui';
import {
  buttonStyle,
  font,
  foregroundColor,
  frame,
  id,
  onScrollPhaseChange,
  padding,
  scrollPosition,
  scrollTargetLayout,
} from '@expo/ui/swift-ui/modifiers';
import { useEffect, useState, type ReactNode } from 'react';
import { colors } from '@/ui/tokens';
import { useAccessibility } from '@/ui/useAccessibility';
import type { Moment, TranscriptSegment } from '../notes/types';
import { TranscriptPassage } from './TranscriptPassage';

export function TranscriptPassages({
  segments,
  live = false,
  initialTimeMs,
  positionMs,
  playing = false,
  moments = [],
  onSeek,
  onBookmark,
  header,
}: {
  header?: ReactNode;
  segments: TranscriptSegment[];
  live?: boolean;
  initialTimeMs?: number;
  positionMs?: number;
  playing?: boolean;
  moments?: Moment[];
  onSeek?: (timeMs: number) => void;
  onBookmark?: (segment: TranscriptSegment) => void;
}) {
  const target = useNativeState<string | null>(null);
  const [following, setFollowing] = useState(true);
  const { largeText } = useAccessibility();
  const active = [...segments].reverse().find((s) => s.startMs <= (positionMs ?? -1));
  const followId = live ? segments.at(-1)?.id : active?.id;
  useEffect(() => {
    if (following && followId && (live || playing)) target.value = followId;
  }, [following, followId, live, playing, target]);
  useEffect(() => {
    if (initialTimeMs !== undefined)
      target.value = [...segments].reverse().find((s) => s.startMs <= initialTimeMs)?.id ?? null;
  }, [initialTimeMs, segments, target]);
  return (
    <VStack spacing={8} modifiers={[frame({ maxWidth: Infinity, maxHeight: Infinity })]}>
      <ScrollView
        modifiers={[
          padding({ horizontal: 16 }),
          scrollPosition(target, { anchor: 'top' }),
          onScrollPhaseChange((phase) => {
            if (phase === 'interacting') setFollowing(false);
          }),
        ]}
      >
        <VStack
          alignment="leading"
          spacing={24}
          modifiers={[scrollTargetLayout(), padding({ vertical: 8 })]}
        >
          {header}
          {segments.length ? (
            segments.map((segment) => {
              const marked = moments.some(
                (m) =>
                  m.timeMs >= segment.startMs &&
                  m.timeMs < (segments[segments.indexOf(segment) + 1]?.startMs ?? Infinity),
              );
              const selected = active?.id === segment.id && !live;
              return (
                <VStack key={segment.id} alignment="leading" modifiers={[id(segment.id)]}>
                  <TranscriptPassage
                    segment={segment}
                    live={live}
                    largeText={largeText}
                    selected={selected}
                    marked={marked}
                    onSeek={onSeek}
                    onBookmark={onBookmark}
                  />
                </VStack>
              );
            })
          ) : (
            <ContentUnavailableView
              title={live ? 'Waiting for words…' : 'No transcript'}
              systemImage="text.bubble"
              description={
                live ? 'Your words will appear here.' : 'Your recording is still available.'
              }
            />
          )}
        </VStack>
      </ScrollView>
      {(live && !following) || playing ? (
        <HStack
          modifiers={[
            frame({ maxWidth: Infinity, alignment: live ? 'center' : 'leading' }),
            padding({ horizontal: 24, bottom: 16 }),
          ]}
        >
          {!following ? (
            <Button
              label={live ? 'Follow live' : 'Follow audio'}
              systemImage="chevron.down"
              modifiers={[buttonStyle('bordered')]}
              onPress={() => {
                setFollowing(true);
                target.value = followId ?? null;
              }}
            />
          ) : !live ? (
            <Text modifiers={[font({ textStyle: 'caption' }), foregroundColor(colors.signal)]}>
              Following audio
            </Text>
          ) : null}
        </HStack>
      ) : null}
    </VStack>
  );
}
