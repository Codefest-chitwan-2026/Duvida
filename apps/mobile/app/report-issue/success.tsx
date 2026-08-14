import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import Button from '../../components/common/Button';
import { useIssueForm } from '../../hooks/useIssueForm';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';

export default function ReportSuccessScreen() {
  const router = useRouter();
  const { formData } = useIssueForm();
  const { mode } = useLocalSearchParams<{ mode?: 'new' | 'support' }>();
  const isSupport = mode === 'support';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.iconBadge}>
          <Text style={styles.icon}>✓</Text>
        </View>

        <Text style={styles.title}>{isSupport ? 'Report Supported!' : 'Report Submitted!'}</Text>
        <Text style={styles.subtitle}>
          {isSupport
            ? 'Thanks — your confirmation helps prioritize this issue for the authorities.'
            : 'Thanks for helping keep the community informed. Your report has been logged.'}
        </Text>

        <View style={styles.idCard}>
          <Text style={styles.idLabel}>Report ID</Text>
          <Text style={styles.idValue}>{formData.issueId}</Text>
        </View>

        <Button
          label="Back to Map"
          onPress={() => router.push('/')}
          style={styles.primaryButton}
        />
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
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.greenSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  icon: { fontSize: 34, color: colors.primaryGreen, fontWeight: fontWeight.bold },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  idCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  idLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.xs },
  idValue: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  primaryButton: { width: '100%' },
});
