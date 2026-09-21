import { useAudioNavigation } from '@/features/audio/useAudioNavigation';
import { Button, HStack, Host } from '@expo/ui/swift-ui';
import {
  frame,
  padding,
  font,
  lineLimit,
  fixedSize,
  labelStyle,
  buttonStyle,
  foregroundColor,
} from '@expo/ui/swift-ui/modifiers';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useRouter, useGlobalSearchParams, usePathname } from 'expo-router';
import { useAppDispatch, useAudio, useRecordings } from '../notes/NotesProvider';
import type { Recording } from '../notes/types';
import { useAudioActions } from './useAudioActions';
import { useAccessibility } from '@/ui/useAccessibility';
import { colors } from '@/ui/tokens';
import { PlaybackAccessory } from './PlaybackAccessory';
import { CaptureAccessory } from './CaptureAccessory';
import { usePlayback } from './usePlayback';
import { audioPresentation } from './model';

function ConnectedPlaybackAccessory({ item, compact }: { item: Recording; compact: boolean }) {
  const playback = usePlayback(item);
  const audioNavigation = useAudioNavigation();
  return (
    <PlaybackAccessory
      {...playback}
      compact={compact}
      onOpen={() => audioNavigation.openRecording(item.id)}
    />
  );
}
/** Native regular and inline instances project one provider-owned session. */
export function TabAccessory() {
  const params = useGlobalSearchParams<{ id?: string }>();
  const path = usePathname();
  const folderId = path.startsWith('/folders/') ? params.id : undefined;
  const compact = NativeTabs.BottomAccessory.usePlacement() === 'inline';
  const audio = useAudio();
  const recordings = useRecordings();
  const actions = useAudioActions();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const audioNavigation = useAudioNavigation();
  const { largeText, reduceMotion } = useAccessibility();
  const playbackId = audio.playback.status === 'idle' ? null : audio.playback.audioId;
  const item = recordings.filter((r) => !r.deletedAt).find((a) => a.id === playbackId);
  const presentation = audioPresentation(audio);
  return (
    <Host ignoreSafeArea="container" style={{ flex: 1 }}>
      <HStack
        spacing={16}
        modifiers={[
          padding({ leading: 16, trailing: compact ? 4 : 16 }),
          frame({ maxWidth: Infinity, maxHeight: Infinity }),
        ]}
      >
        {presentation === 'capture' && audio.capture ? (
          <CaptureAccessory
            capture={audio.capture}
            compact={compact}
            reduceMotion={reduceMotion}
            onOpen={() => audioNavigation.openCapture(audio.capture!.id)}
            onToggle={() =>
              dispatch({
                type: 'audio',
                action: { type: 'toggleCapture', captureId: audio.capture!.id },
              })
            }
          />
        ) : presentation === 'playback' && item ? (
          <ConnectedPlaybackAccessory item={item} compact={compact} />
        ) : (
          <HStack
            spacing={compact ? 12 : 24}
            modifiers={[
              font({ textStyle: 'subheadline', weight: 'semibold' }),
              lineLimit(1),
              fixedSize({ horizontal: true, vertical: false }),
            ]}
          >
            <Button
              label="Record"
              systemImage={'mic'}
              onPress={() => actions.startCapture()}
              modifiers={[
                buttonStyle('plain'),
                foregroundColor(colors.primary),
                frame({ minHeight: 44 }),
                ...(largeText && compact ? [labelStyle('iconOnly')] : []),
              ]}
            />
            <Button
              label="Write"
              systemImage={'square.and.pencil'}
              onPress={() => actions.write(folderId)}
              modifiers={[
                buttonStyle('plain'),
                foregroundColor(colors.primary),
                frame({ minHeight: 44 }),
                ...(largeText && compact ? [labelStyle('iconOnly')] : []),
              ]}
            />
            {!compact ? (
              <Button
                label="Import"
                systemImage="square.and.arrow.down"
                onPress={() => router.push('/import-audio')}
                modifiers={[
                  buttonStyle('plain'),
                  foregroundColor(colors.primary),
                  frame({ minHeight: 44 }),
                ]}
              />
            ) : null}
          </HStack>
        )}
      </HStack>
    </Host>
  );
}
