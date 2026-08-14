import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import { MediaItem } from '../../types/issue';

interface MediaPreviewRowProps {
  item: MediaItem;
  onRemove: (id: string) => void;
}

export default function MediaPreviewRow({ item, onRemove }: MediaPreviewRowProps) {
  const isVideo = item.mediaType === 'video';

  return (
    <View style={styles.row}>
      <View style={styles.thumbnail}>
        {!isVideo && item.uri ? (
          <Image source={{ uri: item.uri }} style={styles.thumbnailImage} />
        ) : (
          <Text style={styles.thumbnailIcon}>{isVideo ? '🎬' : '📷'}</Text>
        )}
      </View>

      <Text style={styles.fileName} numberOfLines={1}>
        {item.name}
      </Text>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemove(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${item.name}`}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.removeIcon}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  thumbnail: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.greenSurface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailIcon: {
    fontSize: fontSize.lg,
  },
  fileName: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  removeIcon: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    lineHeight: fontSize.md,
  },
});
