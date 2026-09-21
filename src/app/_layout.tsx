import { FeedbackEvents } from '@/features/notes/FeedbackEvents';
import { RecordingFlowDraftsProvider } from '@/features/recordings/RecordingFlowDrafts';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { NotesProvider } from '@/features/notes/NotesProvider';
import {
  createSeedNotes,
  createSeedRecordings,
  importSamples,
  folders,
  transcript,
} from '@/fixtures/notes';

export const unstable_settings = { initialRouteName: '(tabs)' };
const initialNotes = createSeedNotes();
export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NotesProvider
        initialNotes={initialNotes}
        initialRecordings={createSeedRecordings()}
        importSamples={importSamples}
        folders={folders}
        simulatedTranscript={transcript}
      >
        <RecordingFlowDraftsProvider>
          <FeedbackEvents />
          <Stack
            screenOptions={{ headerBackButtonDisplayMode: 'minimal', headerTransparent: true }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Notes' }} />
            <Stack.Screen
              name="transcript/[id]"
              options={{
                presentation: 'formSheet',
                sheetAllowedDetents: [0.6, 1],
                sheetGrabberVisible: true,
              }}
            />
            <Stack.Screen
              name="rename-note"
              options={{
                presentation: 'formSheet',
                sheetAllowedDetents: [0.5, 1],
                sheetGrabberVisible: true,
              }}
            />
            {[
              'link-recordings',
              'choose-recordings',
              'import-audio',
              'rename-recording',
              'recording-notes',
            ].map((name) => (
              <Stack.Screen
                key={name}
                name={name}
                options={{
                  presentation: 'formSheet',
                  sheetAllowedDetents: [1],
                  sheetGrabberVisible: true,
                }}
              />
            ))}
            <Stack.Screen
              name="capture"
              options={{
                presentation: 'formSheet',
                sheetAllowedDetents: [0.5, 1],
                sheetGrabberVisible: true,
              }}
            />
            <Stack.Screen
              name="folder-editor"
              options={{
                presentation: 'formSheet',
                sheetAllowedDetents: [0.5, 1],
                sheetGrabberVisible: true,
              }}
            />
            <Stack.Screen
              name="move-notes"
              options={{
                presentation: 'formSheet',
                sheetAllowedDetents: [0.5, 1],
                sheetGrabberVisible: true,
              }}
            />
            <Stack.Screen name="scenarios" options={{ title: 'Developer scenarios' }} />
          </Stack>
        </RecordingFlowDraftsProvider>
      </NotesProvider>
    </ThemeProvider>
  );
}
