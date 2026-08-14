import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import { SeverityLevel } from '../../types/issue';

interface SeverityOption {
  level: SeverityLevel;
  label: string;
  color: string;
  surface: string;
}

const OPTIONS: SeverityOption[] = [
  { level: 'low', label: 'Low', color: colors.primaryGreen, surface: colors.greenSurface },
  { level: 'medium', label: 'Medium', color: colors.amber, surface: colors.amberSurface },
  { level: 'high', label: 'High', color: colors.red, surface: colors.redSurface },
];

interface SeveritySelectorProps {
  value: SeverityLevel;
  onChange: (level: SeverityLevel) => void;
}

export default function SeveritySelector({ value, onChange }: SeveritySelectorProps) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => {
        const isSelected = option.level === value;
        return (
          <TouchableOpacity
            key={option.level}
            activeOpacity={0.8}
            onPress={() => onChange(option.level)}
            style={[
              styles.button,
              {
                backgroundColor: isSelected ? option.color : option.surface,
                borderColor: option.color,
              },
            ]}
          >
            <Text style={[styles.label, { color: isSelected ? colors.white : option.color }]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});
