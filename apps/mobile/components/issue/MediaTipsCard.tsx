import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';

const TIPS = [
  'Use clear, well-lit photos',
  'Include the full issue in frame',
  'At least 1 photo required',
];

export default function MediaTipsCard() {
  return (
    <View style={styles.card} accessibilityRole="text">
      <Text style={styles.heading}>💡 Tips for a good report</Text>
      {TIPS.map((tip) => (
        <Text key={tip} style={styles.tip}>
          {tip}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.blueSurface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  heading: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.blue,
    marginBottom: spacing.sm,
  },
  tip: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
