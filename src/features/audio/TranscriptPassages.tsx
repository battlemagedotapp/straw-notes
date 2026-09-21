/* eslint-disable react-hooks/immutability -- Expo useNativeState exposes native scroll bindings through .value. */
import { ContentUnavailableView, ScrollView, VStack, useNativeState } from '@expo/ui/swift-ui';
import {
  frame,
  id,
  onScrollPhaseChange,
  onAppear,
  padding,
  scrollPosition,
  scrollTargetLayout,
} from '@expo/ui/swift-ui/modifiers';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Moment, TranscriptSegment } from '../notes/types';
import { TranscriptPassage } from './TranscriptPassage';

export function TranscriptPassages({
  segments,
  live = false,
  initialTimeMs,
  positionMs,
  following,
  onManualScroll,
  moments = [],
  onSeek,
  onToggleMoment,
  header,
  followEnabled = true,
  jump,
}: {
  header?: ReactNode;
  jump?: { timeMs: number; key: number };
  followEnabled?: boolean;
  segments: TranscriptSegment[];
  live?: boolean;
  initialTimeMs?: number;
  positionMs?: number;
  following: boolean;
  onManualScroll: () => void;
  moments?: Moment[];
  onSeek?: (timeMs: number) => void;
  onToggleMoment?: (timeMs: number) => void;
}) {
  const appliedEntry = useRef<number | undefined>(undefined);
  const appliedJump = useRef<number | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const target = useNativeState<string | null>(null);
  const active = segments.findLast((s) => s.startMs <= (positionMs ?? -1));
  const followId = live ? segments.at(-1)?.id : active?.id;
  useEffect(() => {
    if (ready && followEnabled && following && followId) target.value = followId;
  }, [ready, followEnabled, following, followId, target]);
  useEffect(() => {
    if (
      ready &&
      followEnabled &&
      initialTimeMs !== undefined &&
      appliedEntry.current !== initialTimeMs &&
      segments.length
    ) {
      appliedEntry.current = initialTimeMs;
      target.value = segments.findLast((s) => s.startMs <= initialTimeMs)?.id ?? null;
    }
  }, [ready, followEnabled, initialTimeMs, segments, target]);
  useEffect(() => {
    if (!followEnabled) {
      target.value = 'workspace-controls';
      appliedEntry.current = undefined;
    }
  }, [followEnabled, target]);
  useEffect(() => {
    if (jump && appliedJump.current !== jump.key) {
      appliedJump.current = jump.key;
      target.value = segments.findLast((s) => s.startMs <= jump.timeMs)?.id ?? null;
    }
  }, [jump, segments, target]);
  return (
    <ScrollView
      modifiers={[
        onAppear(() => setReady(true)),
        scrollPosition(target, { anchor: 'top' }),
        onScrollPhaseChange((phase) => {
          if (phase === 'interacting') onManualScroll();
        }),
      ]}
    >
      <VStack
        alignment="leading"
        spacing={24}
        modifiers={[
          scrollTargetLayout(),
          padding({ top: 8, bottom: 16, horizontal: 16 }),
          frame({ maxWidth: Infinity, alignment: 'leading' }),
        ]}
      >
        <VStack modifiers={[id('workspace-controls')]}>{header}</VStack>
        {segments.length ? (
          segments.map((segment, index) => {
            const moment = moments.find(
              (m) =>
                m.timeMs >= segment.startMs &&
                m.timeMs < (segments[index + 1]?.startMs ?? Infinity),
            );
            const selected = active?.id === segment.id && !live;
            return (
              <VStack key={segment.id} alignment="leading" modifiers={[id(segment.id)]}>
                <TranscriptPassage
                  segment={segment}
                  selected={selected}
                  marked={Boolean(moment)}
                  onSeek={onSeek}
                  onToggleMoment={
                    onToggleMoment
                      ? () => onToggleMoment(moment?.timeMs ?? segment.startMs)
                      : undefined
                  }
                />
              </VStack>
            );
          })
        ) : (
          <ContentUnavailableView
            title={live ? 'Waiting for words…' : 'No transcript'}
            systemImage="text.bubble"
            description={live ? 'Your words will appear here.' : 'Your audio is still available.'}
          />
        )}
      </VStack>
    </ScrollView>
  );
}
