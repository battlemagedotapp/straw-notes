import { useUnsavedRecordingsAction } from '@/features/audio/toolbar';
import { useEffect, useState } from 'react';
import { colors } from '@/ui/tokens';
import {
  Button,
  ContentUnavailableView,
  Host,
  HStack,
  Menu,
  Spacer,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import { font, frame, padding, labelStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useAccessibility } from '@/ui/useAccessibility';
import { Feedback } from '@/ui/Feedback';
import { createId, useAppDispatch, useAudio } from '../notes/NotesProvider';
import { TranscriptPassages } from './TranscriptPassages';
import { RecordingPanel } from './RecordingPanel';
import { useAudioActions } from './useAudioActions';

export function CaptureScreen() {
  const { capture } = useAudio();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const unsavedAction = useUnsavedRecordingsAction();
  const { write, discardRecording } = useAudioActions();
  const { largeText, reduceMotion } = useAccessibility();
  const [marked, setMarked] = useState<string | null>(null);
  useEffect(() => {
    if (!marked) return;
    const timeout = setTimeout(() => setMarked(null), 4000);
    return () => clearTimeout(timeout);
  }, [marked]);
  if (!capture)
    return (
      <Host style={{ flex: 1, backgroundColor: colors.grouped }}>
        <ContentUnavailableView title="No active recording" systemImage="mic" />
      </Host>
    );
  const mark = () => {
    const momentId = createId();
    dispatch({ type: 'audio', action: { type: 'mark', id: momentId } });
    setMarked(momentId);
  };
  const finish = () => {
    dispatch({ type: 'audio', action: { type: 'finish', captureId: capture.id } });
    router.replace({ pathname: '/destination', params: { captureId: capture.id } });
  };
  const content = (
    <VStack
      alignment="leading"
      spacing={16}
      modifiers={[
        frame({ maxWidth: Infinity, alignment: 'leading' }),
        padding({ top: 8, bottom: 8, horizontal: largeText ? 0 : 16 }),
      ]}
    >
      <RecordingPanel
        capture={capture}
        onMark={mark}
        onToggle={() => dispatch({ type: 'audio', action: { type: 'toggleCapture' } })}
        onFinish={finish}
        reduceMotion={reduceMotion}
      />
      {marked ? (
        <HStack>
          <Feedback title="Moment added" />
          <Spacer />
          <Button
            label="Name"
            onPress={() =>
              router.push({
                pathname: '/moment',
                params: { captureId: capture.id, momentId: marked },
              })
            }
          />
        </HStack>
      ) : null}
      {capture.status === 'interrupted' ? (
        <Feedback
          title="Your recording is kept"
          message="Resume when you’re ready, or finish to choose a note."
        />
      ) : null}
      <HStack modifiers={[padding({ horizontal: 8, top: 8 })]}>
        <Text modifiers={[font({ textStyle: 'title3', weight: 'semibold' })]}>Live transcript</Text>
        <Spacer />
        <Menu
          label="Transcript actions"
          systemImage="ellipsis"
          modifiers={[labelStyle('iconOnly')]}
        >
          <Button
            label="Marked moments"
            systemImage="bookmark"
            onPress={() => router.push({ pathname: '/moments', params: { captureId: capture.id } })}
          />
        </Menu>
      </HStack>
    </VStack>
  );
  return (
    <>
      <Stack.Screen options={{ title: capture.title }} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon="chevron.down"
          accessibilityLabel="Minimize recording"
          onPress={() => router.back()}
        >
          Minimize
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        {unsavedAction}
        <Stack.Toolbar.Button
          icon="trash"
          accessibilityLabel="Discard recording"
          onPress={() => discardRecording(capture.id, () => router.back())}
        >
          Discard
        </Stack.Toolbar.Button>
        <Stack.Toolbar.Button
          icon="square.and.pencil"
          accessibilityLabel="Write while recording"
          onPress={() => {
            router.back();
            write();
          }}
        >
          Write
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Host style={{ flex: 1, backgroundColor: colors.grouped }}>
        {largeText ? (
          <TranscriptPassages segments={capture.segments} live header={content} />
        ) : (
          <VStack spacing={0} modifiers={[frame({ maxWidth: Infinity, maxHeight: Infinity })]}>
            {content}
            <TranscriptPassages segments={capture.segments} live />
          </VStack>
        )}
      </Host>
    </>
  );
}
