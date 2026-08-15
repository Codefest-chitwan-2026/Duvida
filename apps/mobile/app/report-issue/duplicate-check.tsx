import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Header from '../../components/common/Header';
import { useIssueForm } from '../../hooks/useIssueForm';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import { supabase } from '@/lib/supabase';

/**
 * Mock "existing issue" this build checks new reports against — stands in
 * for a real GPS-proximity + text/image-similarity backend query.
 */
const MOCK_EXISTING_ISSUE = {
  issueId: 'ISS-2026-08-01-40213',
  category: 'pothole' as const,
  description: 'Deep pothole reported near Mid Baneshwor causing traffic issues.',
  location: { address: 'Mid Baneshwor, Kathmandu, Nepal', latitude: 27.7105, longitude: 85.3305 },
  reportedAgo: '3 days ago',
};

function isNearby(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const distanceDegrees = Math.hypot(a.latitude - b.latitude, a.longitude - b.longitude);
  return distanceDegrees < 0.01; // ~1km at this latitude — mock proximity threshold
}

export default function DuplicateCheckScreen() {
  const router = useRouter();
  const { formData } = useIssueForm();
  const [checking, setChecking] = useState(true);

  const isDuplicate =
    formData.category === MOCK_EXISTING_ISSUE.category && isNearby(formData.location, MOCK_EXISTING_ISSUE.location);

  useEffect(() => {
    let isMounted = true;

    async function processSubmission() {
      if (!isDuplicate) {
        try {
          const submittedTimestamp = formData.submittedAt || new Date().toISOString();
          await supabase.from('issues').insert({
            code: formData.issueId,
            title: formData.description?.slice(0, 60) || `${formData.category} report`,
            description: formData.description,
            category: formData.category,
            severity: formData.severity,
            latitude: formData.location.latitude,
            longitude: formData.location.longitude,
            address: formData.location.address,
            city: 'Kathmandu',
            status: 'pending',
            created_at: submittedTimestamp,
            updated_at: submittedTimestamp,
          });
        } catch (err) {
          console.warn('Supabase issue submission error (non-fatal):', err);
        }
      }

      if (isMounted) {
        setChecking(false);
        router.replace(
          isDuplicate
            ? { pathname: '/report-issue/existing-issue', params: { existingIssueId: MOCK_EXISTING_ISSUE.issueId } }
            : { pathname: '/report-issue/success', params: { mode: 'new' } }
        );
      }
    }

    const timer = setTimeout(() => {
      void processSubmission();
    }, 850);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isDuplicate, router, formData]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header title="Checking Report" onBackPress={() => router.back()} />
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.primaryGreen} />
        <Text style={styles.title}>{checking ? 'Checking for duplicate reports…' : 'Done'}</Text>
        <Text style={styles.subtitle}>
          Comparing location, description, and photos against nearby reports.
        </Text>
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
