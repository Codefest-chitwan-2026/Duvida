import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Header from '../../components/common/Header';
import { useIssueForm } from '../../hooks/useIssueForm';
import { submitReport } from '../../lib/reportSubmission';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';

type SubmissionState = 'submitting' | 'error';

export default function DuplicateCheckScreen() {
  const router = useRouter();
  const { formData } = useIssueForm();
  const [state, setState] = useState<SubmissionState>('submitting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    submitReport(formData)
      .then(() => {
        if (!cancelled) {
          router.replace({ pathname: '/report-issue/success', params: { mode: 'new' } });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setState('error');
          setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        }
      });

    return () => {
      cancelled = true;
    };
    // formData is only read once, at submit time — re-running this on every
    // form change would resubmit mid-request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header title="Submitting Report" onBackPress={() => router.back()} />
      <View style={styles.content}>
        {state === 'submitting' ? (
          <>
            <ActivityIndicator size="large" color={colors.primaryGreen} />
            <Text style={styles.title}>Submitting your report…</Text>
            <Text style={styles.subtitle}>Saving your report and uploading evidence.</Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>Submission failed</Text>
            <Text style={styles.subtitle}>{errorMessage}</Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
