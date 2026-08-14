import { StatusBar } from 'expo-status-bar';
import SustainabilityAdvisorScreen from './src/features/sustainability-advisor/SustainabilityAdvisorScreen';

export default function App() {
  return (
    <>
      <SustainabilityAdvisorScreen />
      <StatusBar style="auto" />
    </>
  );
}
