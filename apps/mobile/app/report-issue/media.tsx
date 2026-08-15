import React, { useCallback, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import IssueProgress from '../../components/issue/IssueProgress';
import MediaUploadArea from '../../components/issue/MediaUploadArea';
import MediaPreviewRow from '../../components/issue/MediaPreviewRow';
import MediaTipsCard from '../../components/issue/MediaTipsCard';

import { useIssueForm } from '../../hooks/useIssueForm';
import { useMediaPicker } from '../../hooks/useMediaPicker';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import { MediaItem } from '../../types/issue';

const WEB_MAX_WIDTH = 480;
const isWeb = Platform.OS === 'web';

export default function MediaScreen() {
  const router = useRouter();
  const { formData, addMedia, removeMedia } = useIssueForm();
  const [showValidationError, setShowValidationError] = useState(false);

  const handlePicked = useCallback(
    (items: MediaItem[]) => {
      addMedia(items);
      setShowValidationError(false);
    },
    [addMedia]
  );

  const { openPicker } = useMediaPicker(handlePicked);

  const handleNext = () => {
    if (formData.media.length === 0) {
      setShowValidationError(true);
      return;
    }
    router.push('/report-issue/duplicate-check');
  };

  return (
    <View style={styles.pageWrapper}>
      <SafeAreaView
        style={[styles.safeArea, isWeb && styles.safeAreaWeb]}
        edges={['top', 'bottom']}
      >
        <Header title="Report an Issue" onBackPress={() => router.back()} />
        <IssueProgress currentStep={3} />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Add Photos or Video</Text>

          <MediaUploadArea onPress={openPicker} />

          {formData.media.length > 0 && (
            <View style={styles.previewList}>
              {formData.media.map((item) => (
                <MediaPreviewRow key={item.id} item={item} onRemove={removeMedia} />
              ))}

              <TouchableOpacity
                style={styles.addMoreButton}
                onPress={openPicker}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Add another photo or video"
              >
                <Text style={styles.addMoreIcon}>+</Text>
              </TouchableOpacity>
            </View>
          )}

          <MediaTipsCard />

          {showValidationError && (
            <Text
              style={styles.validationError}
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
            >
              Please add at least one photo or video before continuing.
            </Text>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="Back"
            variant="outline"
            onPress={() => router.back()}
            style={styles.footerButton}
          />
          <Button label="Next" onPress={handleNext} style={styles.footerButton} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrapper: {
    flex: 1,
    backgroundColor: isWeb ? colors.background : colors.surface,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: isWeb ? WEB_MAX_WIDTH : undefined,
    backgroundColor: colors.surface,
  },
  safeAreaWeb: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginVertical: spacing.xl,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  previewList: {
    marginTop: spacing.lg,
  },
  addMoreButton: {
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoreIcon: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primaryGreen,
  },
  validationError: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.red,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerButton: {
    flex: 1,
  },
});
