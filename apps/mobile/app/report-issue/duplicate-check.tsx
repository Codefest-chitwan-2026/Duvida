import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Header from '../../components/common/Header';
import { useIssueForm } from '../../hooks/useIssueForm';
import { findNearbyDuplicateIssue } from '../../src/lib/issueSubmission';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';

export default function DuplicateCheckScreen() {
  const router = useRouter();
  const { formData } = useIssueForm();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const runDuplicateCheck = async () => {
      try {
        const duplicate = await findNearbyDuplicateIssue(formData);

        if (!isMounted) return;

        setChecking(false);

        if (duplicate) {
          router.replace({
            pathname: '/report-issue/existing-issue',
            params: {
              existingIssueId: duplicate.id,
              title: duplicate.title,
              description: duplicate.description ?? '',
              address: duplicate.address ?? '',
              createdAt: duplicate.createdAt,
            },
          });
          return;
        }

        router.replace('/report-issue/review');
      } catch (duplicateError) {
        if (!isMounted) return;
        setChecking(false);
        setError(
          duplicateError instanceof Error
            ? duplicateError.message
            : 'Unable to check for similar reports right now.'
        );
      }
    };

    runDuplicateCheck();

    return () => {
      isMounted = false;
    };
  }, [formData, router]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header title="Checking Report" onBackPress={() => router.back()} />
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.primaryGreen} />
        <Text style={styles.title}>{checking ? 'Checking for duplicate reports…' : error ? 'Check failed' : 'Done'}</Text>
        <Text style={styles.subtitle}>
          {error
            ? error
            : 'Comparing location, description, and photos against nearby reports.'}
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
