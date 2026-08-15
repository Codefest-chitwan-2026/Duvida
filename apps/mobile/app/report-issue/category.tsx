import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import IssueProgress from '../../components/issue/IssueProgress';
import { useIssueForm } from '../../hooks/useIssueForm';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import { IssueCategoryId } from '../../types/issue';

type CategoryIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];
type SustainabilityCategoryId =
  | 'waste'
  | 'water'
  | 'pollution'
  | 'greenery'
  | 'energy'
  | 'mobility'
  | 'drainage'
  | 'recycling'
  | 'others'
  | 'flood-landslide';

interface CategoryOption {
  id: SustainabilityCategoryId;
  label: string;
  icon: CategoryIconName;
  iconColor: string;
  reportCategory: IssueCategoryId;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: 'waste',
    label: 'Waste',
    icon: 'trash-can-outline',
    iconColor: '#22A447',
    reportCategory: 'garbage',
  },
  {
    id: 'water',
    label: 'Water',
    icon: 'water',
    iconColor: '#18A8F2',
    reportCategory: 'water',
  },
  {
    id: 'pollution',
    label: 'Pollution',
    icon: 'factory',
    iconColor: '#68758A',
    reportCategory: 'other',
  },
  {
    id: 'greenery',
    label: 'Greenery',
    icon: 'tree',
    iconColor: '#27A844',
    reportCategory: 'other',
  },
  {
    id: 'energy',
    label: 'Energy',
    icon: 'lightning-bolt',
    iconColor: '#FFBE20',
    reportCategory: 'streetlight',
  },
  {
    id: 'mobility',
    label: 'Mobility',
    icon: 'bike',
    iconColor: '#18A34A',
    reportCategory: 'traffic',
  },
  {
    id: 'drainage',
    label: 'Drainage',
    icon: 'pipe-leak',
    iconColor: '#58AEEF',
    reportCategory: 'water',
  },
  {
    id: 'recycling',
    label: 'Recycling',
    icon: 'recycle',
    iconColor: '#16A344',
    reportCategory: 'garbage',
  },
  {
    id: 'others',
    label: 'Others',
    icon: 'help-circle-outline',
    iconColor: '#667085',
    reportCategory: 'other',
  },
  {
    id: 'flood-landslide',
    label: 'Flood & Landslide',
    icon: 'landslide',
    iconColor: '#2E9A60',
    reportCategory: 'other',
  },
];

const WEB_MAX_WIDTH = 480;
const isWeb = Platform.OS === 'web';

function getInitialCategory(category: IssueCategoryId): SustainabilityCategoryId {
  switch (category) {
    case 'water':
      return 'water';
    case 'streetlight':
      return 'energy';
    case 'traffic':
      return 'mobility';
    case 'other':
      return 'others';
    case 'garbage':
    case 'pothole':
    default:
      return 'waste';
  }
}

export default function CategoryScreen() {
  const router = useRouter();
  const { formData, selectCategory } = useIssueForm();
  const [selectedCategory, setSelectedCategory] = useState<SustainabilityCategoryId>(() =>
    getInitialCategory(formData.category)
  );

  const handleCategoryPress = (category: CategoryOption) => {
    setSelectedCategory(category.id);
    selectCategory(category.reportCategory);
  };

  const handleNext = () => {
    const category = CATEGORIES.find((option) => option.id === selectedCategory);
    if (category) {
      selectCategory(category.reportCategory);
    }
    router.push('/report-issue/details');
  };

  return (
    <View style={styles.pageWrapper}>
      <SafeAreaView
        style={[styles.safeArea, isWeb && styles.safeAreaWeb]}
        edges={['top', 'bottom']}
      >
        <Header title="Report an Issue" onBackPress={() => router.back()} />
        <IssueProgress currentStep={1} />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intro}>
            <View style={styles.introIcon}>
              <MaterialCommunityIcons name="sprout" size={38} color={colors.primaryGreen} />
            </View>
            <Text style={styles.title}>Select issue category</Text>
            <Text style={styles.subtitle}>
              Choose the sustainability issue you want to report.
            </Text>
          </View>

          <View style={styles.categoryGrid} accessibilityRole="radiogroup">
            {CATEGORIES.map((category) => {
              const selected = selectedCategory === category.id;

              return (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryCard, selected && styles.categoryCardSelected]}
                  onPress={() => handleCategoryPress(category)}
                  activeOpacity={0.8}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={`${category.label} category`}
                >
                  {selected && (
                    <View style={styles.selectedBadge}>
                      <MaterialCommunityIcons name="check" size={15} color={colors.white} />
                    </View>
                  )}

                  <MaterialCommunityIcons
                    name={category.icon}
                    size={48}
                    color={category.iconColor}
                  />
                  <Text style={styles.categoryLabel}>{category.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button label="Next  →" onPress={handleNext} />
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
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  intro: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  introIcon: {
    width: 76,
    height: 76,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.greenSurface,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: fontSize.md,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
  },
  categoryCard: {
    width: '48.5%',
    minHeight: 112,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1.25,
    borderColor: '#EEF0F3',
    borderRadius: radius.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  categoryCardSelected: {
    borderWidth: 2,
    borderColor: colors.primaryGreen,
    shadowColor: colors.primaryGreen,
    shadowOpacity: 0.1,
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 25,
    height: 25,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryGreen,
  },
  categoryLabel: {
    marginTop: spacing.xs,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
});
