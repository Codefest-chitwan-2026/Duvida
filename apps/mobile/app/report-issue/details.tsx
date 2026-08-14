import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import IssueProgress from '../../components/issue/IssueProgress';
import CategoryBadge from '../../components/issue/CategoryBadge';
import LocationRow from '../../components/issue/LocationRow';
import DescriptionField from '../../components/issue/DescriptionField';
import SeveritySelector from '../../components/issue/SeveritySelector';

import { useIssueForm } from '../../hooks/useIssueForm';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import { IssueCategoryId } from '../../types/issue';

const CATEGORY_LABELS: Record<IssueCategoryId, string> = {
  pothole: 'Pothole',
  streetlight: 'Streetlight',
  garbage: 'Garbage',
  traffic: 'Traffic',
  water: 'Water',
  other: 'Other',
};

const DESCRIPTION_MAX_LENGTH = 300;
const WEB_MAX_WIDTH = 480;
const isWeb = Platform.OS === 'web';

// Trims the trailing country segment for the compact card while
// leaving the full stored address untouched elsewhere in the form.
function formatCompactAddress(address: string): string {
  const parts = address.split(',').map((part) => part.trim());
  if (parts.length > 1 && parts[parts.length - 1].toLowerCase() === 'nepal') {
    return parts.slice(0, -1).join(', ');
  }
  return address;
}

export default function DetailsScreen() {
  const router = useRouter();
  const { formData, updateDescription, selectSeverity } = useIssueForm();

  const compactAddress = formatCompactAddress(formData.location.address);

  const handleLocationPress = () => {
    Alert.alert('Coming Soon', 'Location selection coming soon.');
  };

  return (
    <View style={styles.pageWrapper}>
      <SafeAreaView
        style={[styles.safeArea, isWeb && styles.safeAreaWeb]}
        edges={['top', 'bottom']}
      >
        <Header title="Report an Issue" onBackPress={() => router.back()} />
        <IssueProgress currentStep={2} />

        <KeyboardAvoidingView
          style={styles.flexFill}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <CategoryBadge icon="📌" label={CATEGORY_LABELS[formData.category]} />

            <Text style={styles.sectionTitle}>Location</Text>
            <LocationRow
              address={compactAddress}
              coordinates={`Lat ${formData.location.latitude.toFixed(4)}, Long ${formData.location.longitude.toFixed(4)}`}
              onPress={handleLocationPress}
              accessibilityLabel={`Location: ${compactAddress}. Tap to change location.`}
            />

            <Text style={styles.sectionTitle}>Description</Text>
            <DescriptionField
              value={formData.description}
              onChangeText={updateDescription}
              maxLength={DESCRIPTION_MAX_LENGTH}
              showCharCount
              accessibilityLabel="Issue description"
            />

            <Text style={styles.sectionTitle}>Severity Level</Text>
            <SeveritySelector value={formData.severity} onChange={selectSeverity} />
            <Text style={styles.helperText}>How urgent is this issue?</Text>
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.footer}>
          <Button
            label="Back"
            variant="outline"
            onPress={() => router.back()}
            style={styles.footerButton}
          />
          <Button
            label="Next"
            onPress={() => router.push('/report-issue/media')}
            style={styles.footerButton}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrapper: {
    flex: 1,
    backgroundColor: isWeb ? colors.background : colors.surface,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: isWeb ? WEB_MAX_WIDTH : undefined,
    backgroundColor: colors.surface,
  },
  safeAreaWeb: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginVertical: spacing.xl,
  },
  flexFill: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  helperText: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerButton: {
    flex: 1,
  },
});
