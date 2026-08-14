import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import IssueProgress from '../../components/issue/IssueProgress';
import ReviewSummaryRow from '../../components/issue/ReviewSummaryRow';
import { useIssueForm } from '../../hooks/useIssueForm';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';

const CATEGORY_LABELS: Record<string, string> = {
  pothole: 'Pothole',
  streetlight: 'Streetlight',
  garbage: 'Garbage',
  traffic: 'Traffic',
  water: 'Water',
  other: 'Other',
};

const SEVERITY_STYLES: Record<string, { label: string; color: string; surface: string }> = {
  low: { label: 'Low', color: colors.primaryGreen, surface: colors.greenSurface },
  medium: { label: 'Medium', color: colors.amber, surface: colors.amberSurface },
  high: { label: 'High', color: colors.red, surface: colors.redSurface },
};

export default function ReviewScreen() {
  const router = useRouter();
  const { formData } = useIssueForm();
  const severity = SEVERITY_STYLES[formData.severity];

  const handleSubmit = () => {
    Alert.alert('Issue Submitted', 'This is a mock submission. No data was sent to a server.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header title="Review Report" onBackPress={() => router.back()} />
      <IssueProgress currentStep={4} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.photoWrapper}>
          <View style={styles.photo}>
            <Text style={styles.photoEmoji}>🕳️</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.8}
            onPress={() => router.push('/report-issue/category')}
          >
            <Text style={styles.editIcon}>✎</Text>
          </TouchableOpacity>
        </View>

        <ReviewSummaryRow icon="🏷️" label="Type">
          <Text style={styles.valueText}>{CATEGORY_LABELS[formData.category]}</Text>
        </ReviewSummaryRow>

        <ReviewSummaryRow icon="📍" label="Location">
          <Text style={styles.valueText}>{formData.location.address}</Text>
          <Text style={styles.subValueText}>
            Lat {formData.location.latitude.toFixed(4)}, Long {formData.location.longitude.toFixed(4)}
          </Text>
        </ReviewSummaryRow>

        <ReviewSummaryRow icon="📝" label="Description">
          <Text style={styles.valueText}>{formData.description}</Text>
        </ReviewSummaryRow>

        <ReviewSummaryRow icon="⚠️" label="Severity Level">
          <View style={[styles.badge, { backgroundColor: severity.surface }]}>
            <Text style={[styles.badgeText, { color: severity.color }]}>{severity.label}</Text>
          </View>
        </ReviewSummaryRow>

        <View style={styles.confirmationBox}>
          <View style={styles.confirmationIconBadge}>
            <Text style={styles.confirmationIcon}>✓</Text>
          </View>
          <Text style={styles.confirmationTitle}>Looks good!</Text>
          <Text style={styles.confirmationText}>
            Please review all details before submitting your report.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Submit Report  📤" onPress={handleSubmit} />
        <Button
          label="Back"
          variant="outline"
          onPress={() => router.back()}
          style={styles.backButton}
          textStyle={styles.backButtonLabel}
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
  photoWrapper: {
    marginTop: spacing.lg,
    position: 'relative',
  },
  photo: {
    height: 240,
    borderRadius: radius.xl,
    backgroundColor: '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  photoEmoji: {
    fontSize: 64,
  },
  editButton: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  editIcon: {
    fontSize: fontSize.lg,
    color: colors.primaryGreen,
    fontWeight: fontWeight.bold,
  },
  valueText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  subValueText: {
    marginTop: 2,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  confirmationBox: {
    marginTop: spacing.md,
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  confirmationIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.greenSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  confirmationIcon: {
    fontSize: fontSize.lg,
    color: colors.primaryGreen,
    fontWeight: fontWeight.bold,
  },
  confirmationTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  confirmationText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    borderColor: colors.primaryGreen,
  },
  backButtonLabel: {
    color: colors.primaryGreen,
  },
});
