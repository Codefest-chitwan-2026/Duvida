import React from 'react';
import { Stack } from 'expo-router';

import { IssueFormProvider } from '../../context/IssueFormContext';

export default function ReportIssueLayout() {
  return (
    <IssueFormProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </IssueFormProvider>
  );
}
