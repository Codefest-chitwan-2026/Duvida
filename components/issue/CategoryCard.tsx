import React from 'react';
import { StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import Card from '../common/Card';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';

interface CategoryCardProps {
  icon: string;
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function CategoryCard({
  icon,
  label,
  selected,
  onPress,
  style,
}: CategoryCardProps) {
  return (
    <Card onPress={onPress} style={[styles.card, selected && styles.cardSelected, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  cardSelected: {
    backgroundColor: colors.primaryGreen,
    borderColor: colors.primaryGreen,
  },
  icon: {
    fontSize: 26,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  labelSelected: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
});
