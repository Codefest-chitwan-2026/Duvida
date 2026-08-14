import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';

interface CategoryBadgeProps {
  icon: string;
  label: string;
  style?: StyleProp<ViewStyle>;
}

export default function CategoryBadge({ icon, label, style }: CategoryBadgeProps) {
  return (
    <View
      style={[styles.badge, style]}
      accessible
      accessibilityLabel={`Selected category: ${label}`}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.greenSurface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  icon: {
    fontSize: fontSize.base,
    marginRight: spacing.xs,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.primaryGreenDark,
  },
  chevron: {
    fontSize: fontSize.lg,
    color: colors.primaryGreenDark,
    marginLeft: spacing.xs,
  },
});
