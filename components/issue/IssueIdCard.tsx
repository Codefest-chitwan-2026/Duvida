import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Card from '../common/Card';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';

interface IssueIdCardProps {
  issueId: string;
}

export default function IssueIdCard({ issueId }: IssueIdCardProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (): void => {
    if (copyTimeout.current) {
      clearTimeout(copyTimeout.current);
    }
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(1500),
      Animated.timing(toastOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
    copyTimeout.current = setTimeout(() => setCopied(false), 2000);
  };

  const handleCopy = async (): Promise<void> => {
    await Clipboard.setStringAsync(issueId);
    setCopied(true);
    showToast();
  };

  return (
    <View style={styles.wrapper}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconBadge}>
            <Text style={styles.icon}>🎫</Text>
          </View>
          <View style={styles.body}>
            <Text style={styles.label}>Issue ID</Text>
            <Text style={styles.idText} numberOfLines={1}>{issueId}</Text>
          </View>
          <TouchableOpacity
            style={[styles.copyButton, copied && styles.copyButtonCopied]}
            onPress={handleCopy}
            activeOpacity={0.75}
          >
            <Text style={[styles.copyButtonText, copied && styles.copyButtonTextCopied]}>
              {copied ? '✓' : '📋'}
            </Text>
            <Text style={[styles.copyButtonLabel, copied && styles.copyButtonTextCopied]}>
              {copied ? 'Copied' : 'Copy'}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Animated.View style={[styles.toast, { opacity: toastOpacity }]} pointerEvents="none">
        <Text style={styles.toastText}>✓  Copied to clipboard!</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing.lg,
  },
  card: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primaryGreen,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  icon: {
    fontSize: fontSize.lg,
  },
  body: {
    flex: 1,
    marginRight: spacing.sm,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  idText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.4,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.greenSurface,
    borderWidth: 1,
    borderColor: colors.primaryGreen,
  },
  copyButtonCopied: {
    backgroundColor: colors.primaryGreen,
  },
  copyButtonText: {
    fontSize: fontSize.sm,
  },
  copyButtonLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primaryGreen,
  },
  copyButtonTextCopied: {
    color: colors.white,
  },
  toast: {
    marginTop: spacing.sm,
    alignSelf: 'center',
    backgroundColor: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  toastText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
});
