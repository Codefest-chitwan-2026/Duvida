import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
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

function AnimatedOption({
  option,
  isSelected,
  onPress,
}: {
  option: SeverityOption;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.05,
          friction: 4,
          tension: 100,
          useNativeDriver: false,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: false,
      }).start();
    }
  }, [isSelected]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      friction: 6,
      tension: 140,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.03 : 1,
      friction: 4,
      tension: 80,
      useNativeDriver: false,
    }).start();
  };

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.button,
          {
            backgroundColor: isSelected ? option.color : option.surface,
            borderColor: option.color,
            shadowColor: option.color,
          },
          isSelected && styles.buttonSelected,
        ]}
        accessibilityRole="radio"
        accessibilityLabel={`${option.label} severity`}
        accessibilityState={{ selected: isSelected, checked: isSelected }}
      >
        <Text style={[styles.label, { color: isSelected ? colors.white : option.color }]}>
          {option.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function SeveritySelector({ value, onChange }: SeveritySelectorProps) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {OPTIONS.map((option) => (
        <AnimatedOption
          key={option.level}
          option={option}
          isSelected={option.level === value}
          onPress={() => onChange(option.level)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSelected: {
    borderWidth: 2,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
});
