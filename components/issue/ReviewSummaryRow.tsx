import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card from '../common/Card';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';

interface ReviewSummaryRowProps {
  icon: string;
  label: string;
  children: ReactNode;
}

export default function ReviewSummaryRow({ icon, label, children }: ReviewSummaryRowProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconBadge}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        <View style={styles.textGroup}>
          <Text style={styles.label}>{label}</Text>
          {children}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.greenSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    fontSize: fontSize.lg,
    color: colors.primaryGreen,
  },
  textGroup: {
    flex: 1,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});
