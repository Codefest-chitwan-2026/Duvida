import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import { SUPPORTED_FORMATS_LABEL } from '../../hooks/useMediaPicker';

interface MediaUploadAreaProps {
  onPress: () => void;
}

export default function MediaUploadArea({ onPress }: MediaUploadAreaProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Take photo or upload media"
      accessibilityHint="Opens options to take a photo or choose a file from your device"
    >
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>📷</Text>
      </View>
      <Text style={styles.title}>Take Photo or Upload</Text>
      <Text style={styles.subtitle}>{SUPPORTED_FORMATS_LABEL}, up to 25MB</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.xl,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.greenSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
