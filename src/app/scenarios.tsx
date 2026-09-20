import { Redirect } from 'expo-router';
import { ScenariosScreen } from '@/dev/ScenariosScreen';
export default function Scenarios() {
  return __DEV__ ? <ScenariosScreen /> : <Redirect href="/" />;
}
