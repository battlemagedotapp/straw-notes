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
import { useAppDispatch, useAudio, useNotes } from '../notes/NotesProvider';
import type { AudioAttachment } from '../notes/types';
import { useAudioActions } from './useAudioActions';
import { useAccessibility } from '@/ui/useAccessibility';
import { colors } from '@/ui/tokens';
import { AudioAccessory } from './AudioAccessory';
import { RecordingAccessory } from './RecordingAccessory';
import { usePlayback } from './usePlayback';
import { audioPresentation } from './model';

function PlaybackAccessory({
  item,
  compact,
  largeText,
}: {
  item: AudioAttachment;
  compact: boolean;
  largeText: boolean;
}) {
  const playback = usePlayback(item);
  const router = useRouter();
  const { closePlayer } = useAudioActions();
  return (
    <AudioAccessory
      {...playback}
      compact={compact}
      largeText={largeText}
      onOpen={() => router.push({ pathname: '/transcript/[id]', params: { id: item.id } })}
      onClose={() => closePlayer(item.id)}
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
  const { notes } = useNotes();
  const actions = useAudioActions();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { largeText, reduceMotion } = useAccessibility();
  const playbackId = audio.playback.status === 'idle' ? null : audio.playback.audioId;
  const item = notes.flatMap((n) => n.audio).find((a) => a.id === playbackId);
  const presentation = audioPresentation(audio);
  return (
    <Host ignoreSafeArea="container" style={{ flex: 1 }}>
      <HStack
        spacing={16}
        modifiers={[
          padding({ horizontal: compact ? 4 : 16 }),
          frame({ maxWidth: Infinity, maxHeight: Infinity }),
        ]}
      >
        {presentation === 'capture' && audio.capture ? (
          <RecordingAccessory
            capture={audio.capture}
            compact={compact}
            largeText={largeText}
            reduceMotion={reduceMotion}
            onOpen={() => router.push('/capture')}
            onDiscard={() => actions.discardRecording(audio.capture!.id)}
            onToggle={() => dispatch({ type: 'audio', action: { type: 'toggleCapture' } })}
          />
        ) : presentation === 'playback' && item ? (
          <PlaybackAccessory item={item} compact={compact} largeText={largeText} />
        ) : presentation === 'pending' ? (
          <Button
            label={`Save recording${audio.pending.length > 1 ? ` (${audio.pending.length})` : ''}`}
            systemImage="tray.and.arrow.down"
            onPress={actions.openPending}
          />
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
              onPress={actions.startRecording}
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
          </HStack>
        )}
      </HStack>
    </Host>
  );
}
