import React, { useState } from 'react';
import WelcomeScreen from './WelcomeScreen';
import LoginScreen from './LoginScreen';

type AuthStep = 'welcome' | 'login';

export default function AuthFlow({ onAuthenticated }: { onAuthenticated?: () => void }) {
  const [step, setStep] = useState<AuthStep>('welcome');

  if (step === 'login') {
    return (
      <LoginScreen
        onBack={() => setStep('welcome')}
        onLogIn={() => onAuthenticated?.()}
        onSignUp={() => onAuthenticated?.()}
      />
    );
  }

  return (
    <WelcomeScreen onGetStarted={() => onAuthenticated?.()} onLogIn={() => setStep('login')} />
  );
}
