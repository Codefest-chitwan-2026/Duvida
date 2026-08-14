import React, { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';

interface StepperProps {
  steps: string[];
  currentStep: number; // 1-indexed
}

const CIRCLE_SIZE = 32;

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <View style={styles.row}>
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        const isFilled = isActive || isCompleted;
        const isLast = index === steps.length - 1;

        return (
          <Fragment key={label}>
            <View style={styles.step}>
              <View style={[styles.circle, isFilled && styles.circleFilled]}>
                <Text style={[styles.circleText, isFilled && styles.circleTextFilled]}>
                  {stepNumber}
                </Text>
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]} numberOfLines={1}>
                {label}
              </Text>
            </View>
            {!isLast && (
              <View style={[styles.connector, isCompleted && styles.connectorFilled]} />
            )}
          </Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  step: {
    alignItems: 'center',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleFilled: {
    backgroundColor: colors.primaryGreen,
    borderColor: colors.primaryGreen,
  },
  circleText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
  circleTextFilled: {
    color: colors.white,
  },
  label: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  labelActive: {
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginTop: CIRCLE_SIZE / 2 - 1,
    marginHorizontal: spacing.xs,
  },
  connectorFilled: {
    backgroundColor: colors.primaryGreen,
  },
});
