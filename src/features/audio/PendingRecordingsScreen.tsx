import {
  Button,
  ContentUnavailableView,
  Host,
  HStack,
  List,
  Section,
  Spacer,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import { buttonStyle, font, foregroundColor, listStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/ui/tokens';
import { useAudio } from '../notes/NotesProvider';
import { formatTime } from './model';
import { useAudioActions } from './useAudioActions';
import { AccessoryCloseButton } from './AccessoryCloseButton';

export function PendingRecordingsScreen() {
  const { pending, saveErrors } = useAudio();
  const { discardRecording } = useAudioActions();
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ title: 'Unsaved recordings' }} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button onPress={() => router.back()}>Close</Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Host style={{ flex: 1 }}>
        {pending.length ? (
          <List modifiers={[listStyle('insetGrouped')]}>
            <Section
              footer={
                <Text>
                  Choose a note for each recording. Closing this sheet keeps your recordings.
                </Text>
              }
            >
              {pending.map((capture) => (
                <HStack key={capture.id}>
                  <Button
                    onPress={() =>
                      router.push({ pathname: '/destination', params: { captureId: capture.id } })
                    }
                    modifiers={[buttonStyle('plain')]}
                  >
                    <VStack alignment="leading" spacing={4}>
                      <Text modifiers={[font({ textStyle: 'headline' })]}>{capture.title}</Text>
                      <Text
                        modifiers={[
                          font({ textStyle: 'caption' }),
                          foregroundColor(colors.secondary),
                        ]}
                      >
                        {formatTime(capture.elapsedMs)} ·{' '}
                        {saveErrors[capture.id] ? 'Save failed — try again' : 'Choose a note'}
                      </Text>
                    </VStack>
                  </Button>
                  <Spacer />
                  <AccessoryCloseButton
                    label={`Discard ${capture.title}`}
                    onPress={() => discardRecording(capture.id)}
                  />
                </HStack>
              ))}
            </Section>
          </List>
        ) : (
          <ContentUnavailableView
            title="No unsaved recordings"
            systemImage="checkmark.circle"
            description="Your recordings have been saved or discarded."
          />
        )}
      </Host>
    </>
  );
}
