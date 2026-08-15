import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import ReviewSummaryRow from '../../components/issue/ReviewSummaryRow';
import {
  formatIssueReference,
  formatRelativeTime,
  getIssueById,
  removeSupportForIssue,
  supportExistingIssue,
  type IssueDetail,
} from '../../src/lib/issueSubmission';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';

export default function ExistingIssueScreen() {
  const router = useRouter();
  const { existingIssueId } = useLocalSearchParams<{ existingIssueId?: string }>();
  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!existingIssueId) {
      setLoading(false);
      setError('Missing report reference — please go back and try again.');
      return;
    }

    getIssueById(existingIssueId)
      .then((detail) => {
        if (isMounted) setIssue(detail);
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load this report right now.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [existingIssueId]);

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

  const handleRemoveSupport = async () => {
    if (!existingIssueId) {
      setError('Missing report reference — please go back and try again.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await removeSupportForIssue(existingIssueId);
      setIssue((current) =>
        current
          ? { ...current, hasSupported: false, upvotesCount: Math.max(current.upvotesCount - 1, 0) }
          : current
      );
    } catch (removeError) {
      setError(
        removeError instanceof Error ? removeError.message : 'Unable to remove your support right now.'
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

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
        </View>
      ) : (
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
            <Text style={styles.valueText}>{issue?.address || 'Location not available'}</Text>
          </ReviewSummaryRow>

          <ReviewSummaryRow icon="📝" label="Description">
            <Text style={styles.valueText}>{issue?.description || issue?.title || 'No description provided.'}</Text>
          </ReviewSummaryRow>

          <ReviewSummaryRow icon="🕒" label="Reported">
            <Text style={styles.valueText}>{issue ? formatRelativeTime(issue.createdAt) : 'Unknown'}</Text>
          </ReviewSummaryRow>

          <ReviewSummaryRow icon="👍" label="Supported by">
            <Text style={styles.valueText}>
              {issue ? `${issue.upvotesCount} resident${issue.upvotesCount === 1 ? '' : 's'}` : 'Unknown'}
            </Text>
          </ReviewSummaryRow>
        </ScrollView>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.footer}>
        {issue?.hasSupported ? (
          <Button
            label={submitting ? 'Removing…' : 'Remove Support'}
            variant="outline"
            onPress={handleRemoveSupport}
            disabled={submitting || loading}
            style={styles.removeSupportButton}
            textStyle={styles.removeSupportButtonLabel}
          />
        ) : (
          <Button
            label={submitting ? 'Supporting…' : 'Confirm & Support This Report'}
            onPress={handleConfirmExisting}
            disabled={submitting || loading || !issue}
          />
        )}
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
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  removeSupportButton: {
    borderColor: colors.red,
  },
  removeSupportButtonLabel: {
    color: colors.red,
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
