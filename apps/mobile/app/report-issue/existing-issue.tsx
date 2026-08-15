import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import ReviewSummaryRow from '../../components/issue/ReviewSummaryRow';
import { formatIssueReference, formatRelativeTime, supportExistingIssue } from '../../src/lib/issueSubmission';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';

export default function ExistingIssueScreen() {
  const router = useRouter();
  const { existingIssueId, title, description, address, createdAt } = useLocalSearchParams<{
    existingIssueId?: string;
    title?: string;
    description?: string;
    address?: string;
    createdAt?: string;
  }>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmExisting = async () => {
    if (!existingIssueId) {
      setError('Missing report reference — please go back and try again.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await supportExistingIssue(existingIssueId);
      router.replace({
        pathname: '/report-issue/success',
        params: { mode: 'support', issueId: existingIssueId },
      });
    } catch (supportError) {
      setError(
        supportError instanceof Error ? supportError.message : 'Unable to support this report right now.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAsNew = () => {
    router.replace('/report-issue/review');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header title="Possible Duplicate" onBackPress={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Text style={styles.bannerIcon}>⚠️</Text>
          <Text style={styles.bannerTitle}>We found a similar report nearby</Text>
          <Text style={styles.bannerText}>
            Someone already reported an issue like this close to your location. You can support the
            existing report instead of creating a duplicate, or continue if this is a separate issue.
          </Text>
        </View>

        <ReviewSummaryRow icon="🆔" label="Existing Report ID">
          <Text style={styles.valueText}>
            {existingIssueId ? formatIssueReference(existingIssueId) : 'Unknown'}
          </Text>
        </ReviewSummaryRow>

        <ReviewSummaryRow icon="📍" label="Location">
          <Text style={styles.valueText}>{address || 'Location not available'}</Text>
        </ReviewSummaryRow>

        <ReviewSummaryRow icon="📝" label="Description">
          <Text style={styles.valueText}>{description || title || 'No description provided.'}</Text>
        </ReviewSummaryRow>

        <ReviewSummaryRow icon="🕒" label="Reported">
          <Text style={styles.valueText}>{createdAt ? formatRelativeTime(createdAt) : 'Unknown'}</Text>
        </ReviewSummaryRow>
      </ScrollView>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Button
          label={submitting ? 'Supporting…' : 'Confirm & Support This Report'}
          onPress={handleConfirmExisting}
          disabled={submitting}
        />
        <Button
          label="Submit as a New Issue Anyway"
          variant="outline"
          onPress={handleSubmitAsNew}
          style={styles.outlineButton}
          textStyle={styles.outlineButtonLabel}
          disabled={submitting}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  banner: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.amberSurface,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  bannerIcon: { fontSize: 32, marginBottom: spacing.sm },
  bannerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  bannerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  valueText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  outlineButton: {
    borderColor: colors.primaryGreen,
  },
  outlineButtonLabel: {
    color: colors.primaryGreen,
  },
  errorBox: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#FDECEA',
    borderWidth: 1,
    borderColor: '#F5B7B1',
  },
  errorText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: '#B42318',
  },
});
