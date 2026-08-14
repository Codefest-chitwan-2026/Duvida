import React from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { fontSize } from '../../constants/typography';

interface DescriptionFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function DescriptionField({
  value,
  onChangeText,
  placeholder = 'Describe the issue...',
}: DescriptionFieldProps) {
  return (
    <TextInput
      style={styles.field}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      multiline
      textAlignVertical="top"
    />
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 110,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
});
