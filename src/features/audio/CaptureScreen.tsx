import { useEffect, useState, useRef } from 'react';
import { colors } from '@/ui/tokens';
import { ContentUnavailableView, Host, Divider, VStack } from '@expo/ui/swift-ui';
import { frame, padding } from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useAccessibility } from '@/ui/useAccessibility';
import { createId, useAppDispatch, useAudio } from '../notes/NotesProvider';
import { TranscriptPassages } from './TranscriptPassages';
import { CaptureControls } from './CaptureControls';
import { useAudioActions } from './useAudioActions';
import { WorkspaceMoments } from './WorkspaceMoments';
import { useWorkspaceSheet } from './useWorkspaceSheet';

export function CaptureScreen() {
  const { capture: activeCapture } = useAudio();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [boundId] = useState(id ?? activeCapture?.id);
  const capture = activeCapture?.id === boundId ? activeCapture : null;
  const sheet = useWorkspaceSheet('capture');
  const dispatch = useAppDispatch();
  const { writeForCapture, discardCapture, finish: saveCapture } = useAudioActions();
  const { reduceMotion } = useAccessibility();
  const [jump, setJump] = useState<{ timeMs: number; key: number } | undefined>();
  const [following, setFollowing] = useState(true);
  const submitted = useRef<string | null>(null);
  useEffect(() => {
    if (submitted.current && !capture) {
      submitted.current = null;
      sheet.close();
    }
    if (capture?.saveError) submitted.current = null;
  }, [capture, sheet]);
  if (!capture)
    return (
      <>
        <Stack.Screen options={{ ...sheet.options, title: 'Record' }} />
        <Stack.Toolbar placement="left">
          <Stack.Toolbar.Button
            icon="xmark"
            accessibilityLabel="Close recorder"
            onPress={sheet.close}
          >
            Close
          </Stack.Toolbar.Button>
        </Stack.Toolbar>
        <Host style={{ flex: 1 }}>
          <ContentUnavailableView title="Nothing to record yet" systemImage="mic" />
        </Host>
      </>
    );
  const mark = () => {
    const momentId = createId();
    dispatch({ type: 'audio', action: { type: 'mark', captureId: capture.id, id: momentId } });
  };
  const finish = () => {
    submitted.current = capture.id;
    saveCapture(capture.id);
  };
  const content = (
    <VStack
      alignment="leading"
      spacing={16}
      modifiers={[frame({ maxWidth: Infinity, alignment: 'leading' }), padding({ top: 8 })]}
    >
      <CaptureControls
        capture={capture}
        onMark={mark}
        onToggle={() =>
          dispatch({ type: 'audio', action: { type: 'toggleCapture', captureId: capture.id } })
        }
        onFinish={finish}
        reduceMotion={reduceMotion}
      />
      <Divider />
      <WorkspaceMoments
        moments={capture.moments}
        segments={capture.segments}
        onSelect={(timeMs) => {
          setFollowing(false);
          setJump({ timeMs, key: Date.now() });
        }}
      />
    </VStack>
  );
  return (
    <>
      <Stack.Screen options={{ ...sheet.options, title: 'Record' }} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon="xmark"
          accessibilityLabel="Close recorder"
          onPress={sheet.close}
        >
          Close
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="square.and.pencil"
          accessibilityLabel="Write a note"
          onPress={writeForCapture}
        >
          Write
        </Stack.Toolbar.Button>
        <Stack.Toolbar.Menu icon="ellipsis" accessibilityLabel="Recorder actions">
          <Stack.Toolbar.MenuAction
            icon="text.alignleft"
            isOn={following}
            onPress={() => setFollowing((value) => !value)}
          >
            Follow Transcript
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            icon="trash"
            destructive
            onPress={() => discardCapture(capture.id, sheet.close)}
          >
            Discard…
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
      <Host style={{ flex: 1, backgroundColor: colors.background }}>
        <TranscriptPassages
          segments={capture.segments}
          moments={capture.moments}
          onToggleMoment={(timeMs) =>
            dispatch({
              type: 'audio',
              action: { type: 'toggleMoment', captureId: capture.id, id: createId(), timeMs },
            })
          }
          live
          header={content}
          followEnabled={sheet.isExpanded}
          following={following}
          onManualScroll={() => setFollowing(false)}
          jump={jump}
        />
      </Host>
    </>
  );
}
