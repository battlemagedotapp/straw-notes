import { DestinationDraftsProvider } from '@/features/audio/DestinationDrafts';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { NotesProvider } from '@/features/notes/NotesProvider';
import { createSeedNotes, folders, transcript } from '@/fixtures/notes';

export const unstable_settings = { initialRouteName: '(tabs)' };
const initialNotes = createSeedNotes();
export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NotesProvider initialNotes={initialNotes} folders={folders} simulatedTranscript={transcript}>
        <DestinationDraftsProvider>
          <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Notes' }} />
            <Stack.Screen
              name="playback/[id]"
              options={{
                presentation: 'formSheet',
                sheetAllowedDetents: [0.5, 1],
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
            <Stack.Screen
              name="pending-recordings"
              options={{
                presentation: 'formSheet',
                sheetAllowedDetents: [0.5, 1],
                sheetGrabberVisible: true,
              }}
            />
            <Stack.Screen name="capture" options={{ presentation: 'modal' }} />
            <Stack.Screen
              name="destination"
              options={{
                presentation: 'formSheet',
                sheetAllowedDetents: [1],
                sheetGrabberVisible: true,
              }}
            />
            <Stack.Screen
              name="moment"
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
        </DestinationDraftsProvider>
      </NotesProvider>
    </ThemeProvider>
  );
}
