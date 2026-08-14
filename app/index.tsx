import React from 'react';
import { Redirect } from 'expo-router';

// The app opens straight into the issue reporting flow.
export default function Index() {
  return <Redirect href="/report-issue/category" />;
}
