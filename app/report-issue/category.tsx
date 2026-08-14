import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import IssueProgress from '../../components/issue/IssueProgress';
import CategoryCard from '../../components/issue/CategoryCard';
import PhotoUploadCard from '../../components/issue/PhotoUploadCard';
import LocationRow from '../../components/issue/LocationRow';
import DescriptionField from '../../components/issue/DescriptionField';
import SeveritySelector from '../../components/issue/SeveritySelector';

import { useIssueForm } from '../../hooks/useIssueForm';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import { IssueCategory } from '../../types/issue';

const CATEGORIES: IssueCategory[] = [
  { id: 'pothole', label: 'Pothole', icon: '🕳️' },
  { id: 'streetlight', label: 'Streetlight', icon: '💡' },
  { id: 'garbage', label: 'Garbage', icon: '🗑️' },
  { id: 'traffic', label: 'Traffic', icon: '🚦' },
  { id: 'water', label: 'Water', icon: '💧' },
  { id: 'other', label: 'Other', icon: '❓' },
];

export default function CategoryScreen() {
  const router = useRouter();
  const { formData, selectCategory, selectSeverity, updateDescription } = useIssueForm();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header title="Report an Issue" onBackPress={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <IssueProgress currentStep={1} />

        <Text style={styles.sectionTitle}>Select Issue Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              icon={category.icon}
              label={category.label}
              selected={formData.category === category.id}
              onPress={() => selectCategory(category.id)}
              style={styles.categoryCard}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Add Photos / Videos</Text>
        <View style={styles.mediaRow}>
          <PhotoUploadCard variant="photo" emoji="🕳️" style={styles.mediaSlot} />
          <PhotoUploadCard variant="photo" emoji="🚧" style={styles.mediaSlot} />
          <PhotoUploadCard variant="add" style={styles.mediaSlot} onPress={() => {}} />
        </View>

        <LocationRow
          address={formData.location.address}
          coordinates={`Lat ${formData.location.latitude.toFixed(4)}, Long ${formData.location.longitude.toFixed(4)}`}
          onPress={() => {}}
        />

        <Text style={styles.sectionTitle}>Description</Text>
        <DescriptionField value={formData.description} onChangeText={updateDescription} />

        <Text style={styles.sectionTitle}>Severity Level</Text>
        <SeveritySelector value={formData.severity} onChange={selectSeverity} />
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Next" onPress={() => router.push('/report-issue/details')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
  },
  categoryCard: {
    width: '31%',
  },
  mediaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  mediaSlot: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
