import { noteMetadata } from './presentation';
import { Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundColor, frame, lineLimit } from '@expo/ui/swift-ui/modifiers';
import { colors } from '@/ui/tokens';
import { noteTitle } from './model';
import type { Note } from './types';

/** Shared note identity and preview; the surrounding native row owns navigation or selection. */
export function NoteRow({ note, folderName }: { note: Note; folderName: string }) {
  return (
    <VStack
      alignment="leading"
      spacing={3}
      modifiers={[frame({ maxWidth: Infinity, alignment: 'leading' })]}
    >
      <Text modifiers={[font({ textStyle: 'headline' }), lineLimit(2)]}>{noteTitle(note)}</Text>
      <Text
        modifiers={[
          font({ textStyle: 'subheadline' }),
          foregroundColor(colors.secondary),
          lineLimit(2),
        ]}
      >
        {note.body.split('\n').find(Boolean) ||
          (note.audio.length ? 'Audio note' : 'No additional text')}
      </Text>
      <Text
        modifiers={[
          font({ textStyle: 'caption' }),
          foregroundColor(colors.secondary),
          lineLimit(2),
        ]}
      >
        {noteMetadata(note, folderName)}
      </Text>
    </VStack>
  );
}
