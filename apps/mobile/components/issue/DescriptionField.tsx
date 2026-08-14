import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { fontSize } from '../../constants/typography';

interface DescriptionFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  showCharCount?: boolean;
  accessibilityLabel?: string;
}

export default function DescriptionField({
  value,
  onChangeText,
  placeholder = 'Describe the issue...',
  maxLength,
  showCharCount = false,
  accessibilityLabel = 'Issue description',
}: DescriptionFieldProps) {
  return (
    <View>
      <TextInput
        style={styles.field}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline
        textAlignVertical="top"
        maxLength={maxLength}
        accessibilityLabel={accessibilityLabel}
      />
      {showCharCount && maxLength ? (
        <Text style={styles.counter}>
          {value.length} / {maxLength}
        </Text>
      ) : null}
    </View>
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
  counter: {
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
