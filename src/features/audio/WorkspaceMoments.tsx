import { Button, HStack, Image, Menu, Spacer, Text } from '@expo/ui/swift-ui';
import {
  accessibilityLabel,
  buttonStyle,
  disabled,
  font,
  lineLimit,
} from '@expo/ui/swift-ui/modifiers';
import type { Moment, TranscriptSegment } from '../notes/types';
import { formatTime } from './model';
import { momentExcerpt } from './momentPresentation';

/** Native menu labels keep the title, count and symbol on their native baselines. */
export function WorkspaceMoments({
  moments,
  segments,
  onSelect,
}: {
  moments: Moment[];
  segments: TranscriptSegment[];
  onSelect: (timeMs: number) => void;
}) {
  return (
    <HStack spacing={12}>
      <Text modifiers={[font({ textStyle: 'title3', weight: 'semibold' })]}>Transcript</Text>
      <Spacer />
      <Menu
        label={
          <HStack spacing={6}>
            <Text>
              {moments.length} {moments.length === 1 ? 'moment' : 'moments'}
            </Text>
            <Image systemName="chevron.right" modifiers={[font({ textStyle: 'caption' })]} />
          </HStack>
        }
        modifiers={[
          buttonStyle('borderless'),
          disabled(!moments.length),
          accessibilityLabel(
            `${moments.length} marked ${moments.length === 1 ? 'moment' : 'moments'}`,
          ),
        ]}
      >
        {moments.map((moment) => (
          <Button key={moment.id} onPress={() => onSelect(moment.timeMs)}>
            <Text modifiers={[lineLimit(2)]}>
              {`${formatTime(moment.timeMs)} · ${momentExcerpt(segments, moment.timeMs, 40)}`}
            </Text>
          </Button>
        ))}
      </Menu>
    </HStack>
  );
}
