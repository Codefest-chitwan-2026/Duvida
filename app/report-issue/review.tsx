import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import IssueProgress from '../../components/issue/IssueProgress';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';

export default function ReviewScreen() {
  const router = useRouter();

  const handleSubmit = () => {
    Alert.alert('Issue Submitted', 'This is a mock submission. No data was sent to a server.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header title="Report an Issue" onBackPress={() => router.back()} />
      <IssueProgress currentStep={4} />

      <View style={styles.content}>
        <Text style={styles.placeholder}>Review step coming soon.</Text>
      </View>

      <View style={styles.footer}>
        <Button label="Submit" onPress={handleSubmit} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  placeholder: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
