import React, { useCallback, useMemo, useState } from 'react';
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

import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import IssueProgress from '../../components/issue/IssueProgress';
import { useIssueForm } from '../../hooks/useIssueForm';
import { useMediaPicker } from '../../hooks/useMediaPicker';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import { MediaItem } from '../../types/issue';

const WEB_MAX_WIDTH = 480;
const isWeb = Platform.OS === 'web';
const MAX_VISIBLE_PHOTOS = 4;

const EVIDENCE_TIPS = [
  'Capture the full issue clearly',
  'Good lighting and focus',
  'Avoid far or blurry shots',
];

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

  const photoItems = useMemo(
    () => formData.media.filter((item) => item.mediaType === 'image'),
    [formData.media]
  );
  const videoItems = useMemo(
    () => formData.media.filter((item) => item.mediaType === 'video'),
    [formData.media]
  );
  const visiblePhotoCount = photoItems.length > MAX_VISIBLE_PHOTOS ? 3 : MAX_VISIBLE_PHOTOS;
  const visiblePhotos = photoItems.slice(0, visiblePhotoCount);
  const additionalPhotoCount = photoItems.length - visiblePhotos.length;

  const handleNext = () => {
    if (formData.media.length === 0) {
      setShowValidationError(true);
      return;
    }
    router.push('/report-issue/review');
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
          <Text style={styles.title}>Add Evidence</Text>
          <Text style={styles.subtitle}>Photos and videos help us assess the issue better.</Text>

          <View style={styles.evidenceCard}>
            <Text style={styles.cardTitle}>Photos</Text>
            <Text style={styles.cardSubtitle}>Add clear photos of the issue.</Text>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={openPicker}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Add photos"
              accessibilityHint="Opens options to take a photo or choose media from your device"
            >
              <MaterialCommunityIcons name="camera" size={21} color={colors.primaryGreen} />
              <Text style={styles.uploadButtonLabel}>Add Photos</Text>
            </TouchableOpacity>

            {photoItems.length > 0 && (
              <View style={styles.photoGrid}>
                {visiblePhotos.map((item) => (
                  <View key={item.id} style={styles.photoPreview}>
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.photoImage}
                      accessibilityLabel={item.name}
                    />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => removeMedia(item.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${item.name}`}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <MaterialCommunityIcons
                        name="close"
                        size={13}
                        color={colors.primaryGreenDark}
                      />
                    </TouchableOpacity>
                  </View>
                ))}

                {additionalPhotoCount > 0 && (
                  <TouchableOpacity
                    style={[styles.photoPreview, styles.morePhotos]}
                    onPress={openPicker}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`${additionalPhotoCount} more photos`}
                  >
                    <Text style={styles.morePhotosText}>+{additionalPhotoCount}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          <View style={styles.evidenceCard}>
            <Text style={styles.cardTitle}>
              Video <Text style={styles.optionalLabel}>(optional)</Text>
            </Text>
            <Text style={styles.cardSubtitle}>Record a short video (max 30 sec).</Text>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={openPicker}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Add video"
              accessibilityHint="Opens options to record or choose media from your device"
            >
              <MaterialCommunityIcons
                name="video"
                size={22}
                color={colors.primaryGreen}
              />
              <Text style={styles.uploadButtonLabel}>Add Video</Text>
            </TouchableOpacity>

            {videoItems.length > 0 && (
              <View style={styles.videoList}>
                {videoItems.map((item) => (
                  <View key={item.id} style={styles.videoPreview}>
                    <View style={styles.videoIconBadge}>
                      <MaterialCommunityIcons
                        name="play"
                        size={16}
                        color={colors.primaryGreen}
                      />
                    </View>
                    <Text style={styles.videoName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeMedia(item.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${item.name}`}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <MaterialCommunityIcons
                        name="close-circle-outline"
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.tipsCard}>
            <View style={styles.tipsHeadingRow}>
              <MaterialCommunityIcons
                name="lightbulb-outline"
                size={20}
                color={colors.primaryGreen}
              />
              <Text style={styles.tipsHeading}>Tips for good evidence</Text>
            </View>
            {EVIDENCE_TIPS.map((tip) => (
              <View key={tip} style={styles.tipRow}>
                <MaterialCommunityIcons name="check" size={16} color={colors.primaryGreen} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

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
          <Button label="Next  →" onPress={handleNext} style={styles.footerButton} />
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
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  title: {
    marginTop: spacing.lg,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  evidenceCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  optionalLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
  },
  cardSubtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  uploadButton: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: '#D7DDE3',
    borderStyle: 'dashed',
    borderRadius: radius.md,
    backgroundColor: '#FCFDFC',
  },
  uploadButtonLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primaryGreen,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  photoPreview: {
    width: '22.5%',
    aspectRatio: 1,
    overflow: 'hidden',
    borderRadius: radius.sm,
    backgroundColor: '#E9ECEF',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 21,
    height: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#B8E1C8',
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  morePhotos: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF0F3',
  },
  morePhotosText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  videoList: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  videoPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: '#F4F7F5',
  },
  videoIconBadge: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.greenSurface,
  },
  videoName: {
    flex: 1,
    marginRight: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  tipsCard: {
    marginTop: spacing.xs,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#BFE6CE',
    borderRadius: radius.lg,
    backgroundColor: '#F0FAF4',
  },
  tipsHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tipsHeading: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primaryGreenDark,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  tipText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  footerButton: {
    flex: 1,
  },
});
