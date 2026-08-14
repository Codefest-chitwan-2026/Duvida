import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { colors } from '../../constants/colors';
import { radius } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';

interface PhotoUploadCardProps {
  variant: 'photo' | 'add';
  emoji?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function PhotoUploadCard({
  variant,
  emoji = '🖼️',
  onPress,
  style,
}: PhotoUploadCardProps) {
  const isAdd = variant === 'add';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.base, isAdd ? styles.addSlot : styles.photoSlot, style]}
    >
      {isAdd ? (
        <>
          <Text style={styles.plus}>+</Text>
          <Text style={styles.addLabel}>Add</Text>
        </>
      ) : (
        <Text style={styles.photoEmoji}>{emoji}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    aspectRatio: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoSlot: {
    backgroundColor: '#E9ECEF',
  },
  photoEmoji: {
    fontSize: 30,
  },
  addSlot: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  plus: {
    fontSize: 26,
    color: colors.primaryGreen,
    fontWeight: fontWeight.bold,
    lineHeight: 28,
  },
  addLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
