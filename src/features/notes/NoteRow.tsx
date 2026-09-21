import { ResourceCount } from '@/ui/ResourceCount';
import { noteMetadata } from './presentation';
import { HStack, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundColor, frame, lineLimit } from '@expo/ui/swift-ui/modifiers';
import { colors } from '@/ui/tokens';
import { noteTitle } from './model';
import type { Note } from './types';

/** Shared note identity and preview; the surrounding native row owns navigation or selection. */
export function NoteRow({
  note,
  folderName,
  preview,
}: {
  note: Note;
  folderName?: string;
  preview?: string;
}) {
  return (
    <VStack
      alignment="leading"
      spacing={3}
      modifiers={[frame({ maxWidth: Infinity, alignment: 'leading' })]}
    >
      <Text modifiers={[font({ textStyle: 'headline' }), lineLimit(2)]}>{noteTitle(note)}</Text>
      {preview ? (
        <Text
          modifiers={[
            font({ textStyle: 'subheadline' }),
            foregroundColor(colors.secondary),
            lineLimit(2),
          ]}
        >
          {preview}
        </Text>
      ) : null}
      <HStack spacing={4}>
        <Text
          modifiers={[
            font({ textStyle: 'caption' }),
            foregroundColor(colors.secondary),
            lineLimit(1),
          ]}
        >
          {noteMetadata(note, folderName)}
        </Text>
        {!note.deletedAt ? (
          <ResourceCount resource="audio" count={note.recordingIds.length} />
        ) : null}
      </HStack>
    </VStack>
  );
}
