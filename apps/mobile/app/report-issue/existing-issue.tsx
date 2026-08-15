import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import ReviewSummaryRow from '../../components/issue/ReviewSummaryRow';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import { useIssueForm } from '../../hooks/useIssueForm';
import { supabase } from '@/lib/supabase';

export default function ExistingIssueScreen() {
  const router = useRouter();
  const { existingIssueId } = useLocalSearchParams<{ existingIssueId?: string }>();
  const { formData } = useIssueForm();

  const handleConfirmExisting = () => {
    router.replace({ pathname: '/report-issue/success', params: { mode: 'support' } });
  };

  const handleSubmitAsNew = async () => {
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
    router.replace({ pathname: '/report-issue/success', params: { mode: 'new' } });
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
          <Text style={styles.valueText}>{existingIssueId ?? 'ISS-2026-08-01-40213'}</Text>
        </ReviewSummaryRow>

        <ReviewSummaryRow icon="📍" label="Location">
          <Text style={styles.valueText}>Mid Baneshwor, Kathmandu, Nepal</Text>
        </ReviewSummaryRow>

        <ReviewSummaryRow icon="📝" label="Description">
          <Text style={styles.valueText}>
            Deep pothole reported near Mid Baneshwor causing traffic issues.
          </Text>
        </ReviewSummaryRow>

        <ReviewSummaryRow icon="🕒" label="Reported">
          <Text style={styles.valueText}>3 days ago</Text>
        </ReviewSummaryRow>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Confirm & Support This Report" onPress={handleConfirmExisting} />
        <Button
          label="Submit as a New Issue Anyway"
          variant="outline"
          onPress={handleSubmitAsNew}
          style={styles.outlineButton}
          textStyle={styles.outlineButtonLabel}
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
});
