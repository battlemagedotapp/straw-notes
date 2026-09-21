import { notePreview } from '../notes/presentation';
import { useAudioNavigation } from '@/features/audio/useAudioNavigation';
import {
  Button,
  ContentUnavailableView,
  Host,
  List,
  Picker,
  Section,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import { listStyle, pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { useNotes, useRecordings } from '../notes/NotesProvider';
import { NoteRow } from '../notes/NoteRow';
import { RecordingRow } from '../recordings/RecordingRow';
import { formatTime } from '../audio/model';
import { searchResources } from './model';
export function SearchScreen() {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('all');
  const { notes, folders } = useNotes();
  const recordings = useRecordings();
  const router = useRouter();
  const audioNavigation = useAudioNavigation();
  const results = searchResources(notes, recordings, query);
  return (
    <>
      <Stack.Screen options={{ title: 'Search', headerLargeTitleEnabled: true }} />
      <Stack.SearchBar
        placeholder="Notes and audio"
        onChangeText={(e) => setQuery(e.nativeEvent.text)}
      />
      <Host style={{ flex: 1 }}>
        <List modifiers={[listStyle('insetGrouped')]}>
          <Picker
            selection={scope}
            onSelectionChange={(v) => setScope(String(v))}
            modifiers={[pickerStyle('segmented')]}
          >
            <Text modifiers={[tag('all')]}>All</Text>
            <Text modifiers={[tag('notes')]}>Notes</Text>
            <Text modifiers={[tag('recordings')]}>Audio</Text>
          </Picker>
          {!query.trim() ? (
            <ContentUnavailableView
              title="Search notes and audio"
              description="Find writing, an audio title, or a phrase in a transcript."
              systemImage="magnifyingglass"
            />
          ) : (
            <>
              {scope !== 'recordings' && results.notes.length ? (
                <Section title="Notes">
                  {results.notes.map((n) => (
                    <Button
                      key={n.id}
                      onPress={() => router.push({ pathname: '/note/[id]', params: { id: n.id } })}
                    >
                      <NoteRow
                        note={n}
                        preview={notePreview(n, recordings)}
                        folderName={folders.find((f) => f.id === n.folderId)?.name ?? 'Notes'}
                      />
                    </Button>
                  ))}
                </Section>
              ) : null}
              {scope !== 'notes' && results.recordings.length ? (
                <Section title="Audio">
                  {results.recordings.map(({ recording, match }) => (
                    <VStack key={recording.id} alignment="leading" spacing={8}>
                      <Button onPress={() => audioNavigation.openRecording(recording.id)}>
                        <RecordingRow item={recording} />
                      </Button>
                      {match ? (
                        <Button
                          label={`${formatTime(match.startMs)} · ${match.text}`}
                          onPress={() => audioNavigation.openRecording(recording.id, match.startMs)}
                        />
                      ) : null}
                    </VStack>
                  ))}
                </Section>
              ) : null}
              {!(scope === 'notes'
                ? results.notes.length
                : scope === 'recordings'
                  ? results.recordings.length
                  : results.notes.length + results.recordings.length) ? (
                <ContentUnavailableView
                  title="No results"
                  description="Try another word or phrase."
                  systemImage="magnifyingglass"
                />
              ) : null}
            </>
          )}
        </List>
      </Host>
    </>
  );
}
