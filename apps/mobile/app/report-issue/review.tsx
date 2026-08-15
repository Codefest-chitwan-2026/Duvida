import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import IssueProgress from '../../components/issue/IssueProgress';
import { useIssueForm } from '../../hooks/useIssueForm';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import { IssueCategoryId, MediaItem } from '../../types/issue';

type ReviewIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface SummaryRowProps {
  icon: ReviewIconName;
  iconColor: string;
  label: string;
  children: ReactNode;
  onEdit: () => void;
  isLast?: boolean;
}

const CATEGORY_LABELS: Record<IssueCategoryId, string> = {
  pothole: 'Pothole',
  streetlight: 'Energy',
  garbage: 'Waste',
  traffic: 'Mobility',
  water: 'Water',
  other: 'Others',
};

const CATEGORY_ICONS: Record<IssueCategoryId, ReviewIconName> = {
  pothole: 'road-variant',
  streetlight: 'lightning-bolt',
  garbage: 'trash-can-outline',
  traffic: 'bike',
  water: 'water',
  other: 'help-circle-outline',
};

const SEVERITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const WEB_MAX_WIDTH = 480;
const MAX_VISIBLE_EVIDENCE = 4;
const isWeb = Platform.OS === 'web';

function SummaryRow({
  icon,
  iconColor,
  label,
  children,
  onEdit,
  isLast = false,
}: SummaryRowProps) {
  return (
    <View style={[styles.summaryRow, !isLast && styles.summaryRowBorder]}>
      <MaterialCommunityIcons name={icon} size={23} color={iconColor} />
      <View style={styles.summaryContent}>
        <Text style={styles.summaryLabel}>{label}</Text>
        {children}
      </View>
      <TouchableOpacity
        style={styles.editButton}
        onPress={onEdit}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${label.toLowerCase()}`}
      >
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );
}

function EvidenceThumbnail({ item }: { item: MediaItem }) {
  if (item.mediaType === 'image') {
    return (
      <Image
        source={{ uri: item.uri }}
        style={styles.evidenceImage}
        accessibilityLabel={item.name}
      />
    );
  }

  return (
    <View style={styles.videoThumbnail}>
      <MaterialCommunityIcons name="play-circle" size={30} color={colors.primaryGreen} />
    </View>
  );
}

export default function ReviewScreen() {
  const router = useRouter();
  const { formData } = useIssueForm();
  const [copied, setCopied] = useState(false);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visibleEvidenceCount =
    formData.media.length > MAX_VISIBLE_EVIDENCE ? 3 : MAX_VISIBLE_EVIDENCE;
  const visibleEvidence = useMemo(
    () => formData.media.slice(0, visibleEvidenceCount),
    [formData.media, visibleEvidenceCount]
  );
  const additionalEvidenceCount = formData.media.length - visibleEvidence.length;
  const photoCount = formData.media.filter((item) => item.mediaType === 'image').length;
  const videoCount = formData.media.filter((item) => item.mediaType === 'video').length;
  const evidenceSummary = [
    photoCount > 0 ? `${photoCount} ${photoCount === 1 ? 'Photo' : 'Photos'}` : null,
    videoCount > 0 ? `${videoCount} ${videoCount === 1 ? 'Video' : 'Videos'}` : null,
  ]
    .filter(Boolean)
    .join(', ');

  useEffect(() => {
    return () => {
      if (copyResetTimer.current) {
        clearTimeout(copyResetTimer.current);
      }
    };
  }, []);

  const handleCopyIssueId = async () => {
    await Clipboard.setStringAsync(formData.issueId);
    setCopied(true);

    if (copyResetTimer.current) {
      clearTimeout(copyResetTimer.current);
    }
    copyResetTimer.current = setTimeout(() => setCopied(false), 1800);
  };

  const handleSubmit = () => {
    router.push('/report-issue/duplicate-check');
  };

  return (
    <View style={styles.pageWrapper}>
      <SafeAreaView
        style={[styles.safeArea, isWeb && styles.safeAreaWeb]}
        edges={['top', 'bottom']}
      >
        <Header title="Review Report" onBackPress={() => router.back()} />
        <IssueProgress currentStep={4} />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.issueIdCard}>
            <View style={styles.issueIdContent}>
              <Text style={styles.issueIdLabel}>Issue ID</Text>
              <Text style={styles.issueIdValue} numberOfLines={1}>
                {formData.issueId}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyIssueId}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={copied ? 'Issue ID copied' : 'Copy issue ID'}
            >
              <MaterialCommunityIcons
                name={copied ? 'clipboard-check-outline' : 'content-copy'}
                size={22}
                color={colors.primaryGreen}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.evidenceCard}>
            <Text style={styles.evidenceHeading}>Evidence Preview</Text>
            {formData.media.length > 0 ? (
              <View style={styles.evidenceGrid}>
                {visibleEvidence.map((item) => (
                  <View key={item.id} style={styles.evidenceThumbnail}>
                    <EvidenceThumbnail item={item} />
                  </View>
                ))}
                {additionalEvidenceCount > 0 && (
                  <TouchableOpacity
                    style={[styles.evidenceThumbnail, styles.moreEvidence]}
                    onPress={() => router.push('/report-issue/media')}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`${additionalEvidenceCount} more evidence items`}
                  >
                    <Text style={styles.moreEvidenceText}>+{additionalEvidenceCount}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={styles.emptyEvidence}
                onPress={() => router.push('/report-issue/media')}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Add evidence"
              >
                <MaterialCommunityIcons
                  name="image-plus-outline"
                  size={25}
                  color={colors.primaryGreen}
                />
                <Text style={styles.emptyEvidenceText}>Add evidence</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.summaryCard}>
            <SummaryRow
              icon={CATEGORY_ICONS[formData.category]}
              iconColor={colors.textPrimary}
              label="Category"
              onEdit={() => router.push('/report-issue/category')}
            >
              <Text style={styles.summaryValue}>{CATEGORY_LABELS[formData.category]}</Text>
            </SummaryRow>

            <SummaryRow
              icon="map-marker"
              iconColor={colors.primaryGreen}
              label="Location"
              onEdit={() => router.push('/report-issue/details')}
            >
              <Text style={styles.summaryValue}>{formData.location.address}</Text>
              <Text style={styles.summarySubValue}>
                Lat {formData.location.latitude.toFixed(4)}, Long{' '}
                {formData.location.longitude.toFixed(4)}
              </Text>
            </SummaryRow>

            <SummaryRow
              icon="text-box-outline"
              iconColor={colors.primaryGreen}
              label="Description"
              onEdit={() => router.push('/report-issue/details')}
            >
              <Text style={styles.summaryValue}>{formData.description}</Text>
            </SummaryRow>

            <SummaryRow
              icon="alert"
              iconColor={colors.red}
              label="Severity"
              onEdit={() => router.push('/report-issue/details')}
            >
              <Text style={styles.summaryValue}>{SEVERITY_LABELS[formData.severity]}</Text>
            </SummaryRow>

            <SummaryRow
              icon="image-multiple"
              iconColor={colors.primaryGreen}
              label="Evidence"
              onEdit={() => router.push('/report-issue/media')}
              isLast
            >
              <Text style={styles.summaryValue}>{evidenceSummary || 'No evidence added'}</Text>
            </SummaryRow>
          </View>

          <View style={styles.confirmationBox}>
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={21}
              color={colors.primaryGreen}
            />
            <Text style={styles.confirmationText}>
              Please review details before submitting.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel="Submit report"
          >
            <MaterialCommunityIcons name="send-outline" size={20} color={colors.white} />
            <Text style={styles.submitButtonText}>Submit Report</Text>
          </TouchableOpacity>
          <Button label="Back" variant="outline" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrapper: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: isWeb ? colors.background : colors.surface,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: isWeb ? WEB_MAX_WIDTH : undefined,
    backgroundColor: colors.surface,
  },
  safeAreaWeb: {
    marginVertical: spacing.xl,
    overflow: 'hidden',
    borderRadius: radius.xl,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  issueIdCard: {
    minHeight: 67,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: '#BDE4CB',
    borderRadius: radius.md,
    backgroundColor: '#F0FAF4',
  },
  issueIdContent: {
    flex: 1,
    minWidth: 0,
  },
  issueIdLabel: {
    marginBottom: spacing.xs,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  issueIdValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  copyButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    borderRadius: radius.full,
  },
  evidenceCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  evidenceHeading: {
    marginBottom: spacing.sm,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  evidenceGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  evidenceThumbnail: {
    flex: 1,
    aspectRatio: 1,
    overflow: 'hidden',
    borderRadius: radius.sm,
    backgroundColor: '#E9ECEF',
  },
  evidenceImage: {
    width: '100%',
    height: '100%',
  },
  videoThumbnail: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.greenSurface,
  },
  moreEvidence: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6E8EB',
  },
  moreEvidenceText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  emptyEvidence: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.sm,
  },
  emptyEvidenceText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primaryGreen,
  },
  summaryCard: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  summaryRow: {
    minHeight: 73,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  summaryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryContent: {
    flex: 1,
    minWidth: 0,
  },
  summaryLabel: {
    marginBottom: 2,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: 18,
    color: colors.textPrimary,
  },
  summarySubValue: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSecondary,
  },
  editButton: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
  },
  editText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primaryGreen,
  },
  confirmationBox: {
    minHeight: 49,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: '#BDE4CB',
    borderRadius: radius.md,
    backgroundColor: '#F0FAF4',
  },
  confirmationText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  footer: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  submitButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryGreen,
  },
  submitButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});
