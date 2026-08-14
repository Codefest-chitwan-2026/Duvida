import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import IssueProgress from '../../components/issue/IssueProgress';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';

export default function ReviewScreen() {
  const router = useRouter();

  const handleSubmit = () => {
    Alert.alert('Issue Submitted', 'This is a mock submission. No data was sent to a server.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header title="Review Report" onBackPress={() => router.back()} />
      <IssueProgress currentStep={4} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.photoWrapper}>
          <View style={styles.photo}>
            <Text style={styles.photoEmoji}>🕳️</Text>
          </View>
          <TouchableOpacity style={styles.editButton} activeOpacity={0.8}>
            <Text style={styles.editIcon}>✎</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Submit" onPress={handleSubmit} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  photoWrapper: {
    marginTop: spacing.lg,
    position: 'relative',
  },
  photo: {
    height: 240,
    borderRadius: radius.xl,
    backgroundColor: '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  photoEmoji: {
    fontSize: 64,
  },
  editButton: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  editIcon: {
    fontSize: fontSize.lg,
    color: colors.primaryGreen,
    fontWeight: fontWeight.bold,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
