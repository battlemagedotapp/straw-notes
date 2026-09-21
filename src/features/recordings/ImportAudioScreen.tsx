import { colors } from '@/ui/tokens';
import { Button, Host, List, Section, Text, VStack } from '@expo/ui/swift-ui';
import {
  listStyle,
  font,
  foregroundColor,
  buttonStyle,
  tag,
  environment,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { createId, useAppDispatch, useImportSamples, useOperations } from '../notes/NotesProvider';
import { useRecordingFlowDraft } from './RecordingFlowDrafts';
import { formatTime } from '../audio/model';

export function ImportAudioScreen() {
  const { draft, update, clear } = useRecordingFlowDraft('import');
  const [batch] = useState(() => draft.operationId || createId());
  const samples = useImportSamples();
  const dispatch = useAppDispatch();
  const operations = useOperations();
  const router = useRouter();
  const selected = samples.filter((s) => draft.selected.includes(s.id));
  const successful = selected.filter((s) => operations[batch + ':' + s.id]?.status === 'success');
  const importedIds = successful.map((s) => 'import:' + batch + ':' + s.id);
  const run = () => {
    update({ operationId: batch, review: true });
    for (const sample of selected) {
      const operationId = batch + ':' + sample.id;
      const prior = operations[operationId];
      if (prior?.status === 'success') continue;
      const now = new Date().toISOString();
      dispatch({
        type: 'importRecording',
        operationId,
        error:
          sample.outcome === 'unsupported'
            ? 'This sample is not a supported audio file.'
            : sample.outcome === 'retry' && !prior
              ? 'Demo import failed. Try again.'
              : undefined,
        recording: {
          id: 'import:' + operationId,
          title: sample.title.replace(/\.[^.]+$/, ''),
          durationMs: sample.durationMs,
          origin: 'import',
          createdAt: now,
          updatedAt: now,
          transcriptStatus: sample.segments.length ? 'available' : 'unavailable',
          segments: sample.segments,
          moments: [],
        },
      });
    }
  };
  return (
    <>
      <Stack.Screen options={{ title: 'Import Audio' }} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon="xmark"
          accessibilityLabel="Close import"
          onPress={() => router.back()}
        >
          Close
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          variant="done"
          disabled={!selected.length || successful.length === selected.length}
          onPress={() => (draft.review ? run() : update({ review: true, operationId: batch }))}
        >
          {draft.review
            ? selected.some((s) => operations[batch + ':' + s.id]?.status === 'error')
              ? 'Retry'
              : 'Import'
            : 'Review'}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Host style={{ flex: 1 }}>
        <List
          selection={!draft.review ? draft.selected : undefined}
          onSelectionChange={(values) =>
            update({
              operationId: batch,
              selected: values.map(String).filter((id) => samples.some((s) => s.id === id)),
            })
          }
          modifiers={[
            listStyle('insetGrouped'),
            ...(!draft.review ? [environment('editMode', 'active')] : []),
          ]}
        >
          <Section title="Demo audio">
            <Text>
              Sample audio only. Playback and transcripts are simulated. Changes reset on reload.
            </Text>
          </Section>
          <Section title={draft.review ? 'Review import' : 'Choose samples'}>
            {(draft.review ? selected : samples).map((sample) => {
              const result = operations[batch + ':' + sample.id];
              return (
                <VStack
                  key={sample.id}
                  alignment="leading"
                  spacing={8}
                  modifiers={[tag(sample.id), buttonStyle('borderless')]}
                >
                  <Text modifiers={[font({ textStyle: 'headline' })]}>{sample.title}</Text>
                  <Text
                    modifiers={[font({ textStyle: 'caption' }), foregroundColor(colors.secondary)]}
                  >
                    {sample.durationMs ? formatTime(sample.durationMs) : 'Unsupported file type'}
                    {result?.status === 'success' ? ' · Imported' : ''}
                  </Text>
                  {result?.status === 'error' ? (
                    <>
                      <Text>{result.message}</Text>
                      {sample.outcome !== 'unsupported' ? (
                        <Button label="Try again" systemImage="arrow.clockwise" onPress={run} />
                      ) : null}
                      <Button
                        label="Remove from import"
                        onPress={() =>
                          update({ selected: draft.selected.filter((id) => id !== sample.id) })
                        }
                      />
                    </>
                  ) : null}
                </VStack>
              );
            })}
          </Section>
          {draft.review && !selected.some((s) => operations[batch + ':' + s.id]) ? (
            <Button label="Change selection" onPress={() => update({ review: false })} />
          ) : null}
          {!selected.length && draft.review ? (
            <Button
              label="Choose samples"
              systemImage="square.and.arrow.down"
              onPress={() => update({ review: false })}
            />
          ) : null}
          {importedIds.length ? (
            <Section title={`${importedIds.length} imported`}>
              <Text>Saved in Audio. Add to a note anytime.</Text>
              <Button
                label="Add to Note"
                systemImage="note.text"
                onPress={() =>
                  router.push({
                    pathname: '/link-recordings',
                    params: { ids: importedIds.join(',') },
                  })
                }
              />
              <Button
                label="Done"
                onPress={() => {
                  if (successful.length === selected.length) clear();
                  router.back();
                }}
              />
            </Section>
          ) : null}
        </List>
      </Host>
    </>
  );
}
