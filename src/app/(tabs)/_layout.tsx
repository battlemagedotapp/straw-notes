import { useAccessibility } from '@/ui/useAccessibility';
import { TabAccessory } from '@/features/audio/TabAccessory';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabsLayout() {
  const { largeText } = useAccessibility();
  return (
    <NativeTabs minimizeBehavior={largeText ? 'never' : 'onScrollDown'}>
      <NativeTabs.Trigger name="notes">
        <NativeTabs.Trigger.Label>Notes</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="doc.text" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="recordings">
        <NativeTabs.Trigger.Label>Audio</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="waveform" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="folders">
        <NativeTabs.Trigger.Label>Folders</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="folder" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search" role="search">
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="magnifyingglass" />
      </NativeTabs.Trigger>
      <NativeTabs.BottomAccessory>
        <TabAccessory />
      </NativeTabs.BottomAccessory>
    </NativeTabs>
  );
}
