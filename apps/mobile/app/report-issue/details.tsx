import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import IssueProgress from '../../components/issue/IssueProgress';
import LocationPickerModal from '../../components/issue/LocationPickerModal';
import { useIssueForm } from '../../hooks/useIssueForm';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import { IssueLocation, SeverityLevel } from '../../types/issue';

type SeverityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface SeverityOption {
  level: SeverityLevel;
  label: string;
  icon: SeverityIconName;
  color: string;
  surface: string;
}

const SEVERITY_OPTIONS: SeverityOption[] = [
  {
    level: 'low',
    label: 'Low',
    icon: 'emoticon-happy-outline',
    color: colors.primaryGreen,
    surface: '#F0FBF5',
  },
  {
    level: 'medium',
    label: 'Medium',
    icon: 'emoticon-neutral-outline',
    color: colors.amber,
    surface: '#FFF8F0',
  },
  {
    level: 'high',
    label: 'High',
    icon: 'alert',
    color: colors.red,
    surface: '#FFF3F3',
  },
];

const DESCRIPTION_MAX_LENGTH = 300;
const WEB_MAX_WIDTH = 480;
const isWeb = Platform.OS === 'web';

function formatCompactAddress(address: string): string {
  const parts = address.split(',').map((part) => part.trim());
  if (parts.length > 1 && parts[parts.length - 1].toLowerCase() === 'nepal') {
    return parts.slice(0, -1).join(', ');
  }
  return address;
}

export default function DetailsScreen() {
  const router = useRouter();
  const { formData, updateDescription, selectSeverity, updateLocation } = useIssueForm();
  const [pickerVisible, setPickerVisible] = useState(false);

  const compactAddress = formatCompactAddress(formData.location.address);
  const coordinates = `Lat ${formData.location.latitude.toFixed(4)}, Long ${formData.location.longitude.toFixed(4)}`;

  const handleLocationPress = () => {
    setPickerVisible(true);
  };

  const handleSelectLocation = (newLoc: IssueLocation) => {
    updateLocation(newLoc);
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
            <View style={styles.locationHeaderRow}>
              <Text style={styles.sectionTitle}>Location</Text>
              <View style={styles.geofenceTag}>
                <MaterialCommunityIcons name="map-marker-radius" size={13} color="#047857" />
                <Text style={styles.geofenceTagText}>Max 100m Range</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.locationCard}
              onPress={handleLocationPress}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Location: ${compactAddress}. Tap to change location.`}
            >
              <View style={styles.locationIconBadge}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={25}
                  color={colors.primaryGreen}
                />
              </View>
              <View style={styles.locationTextGroup}>
                <Text style={styles.locationAddress} numberOfLines={1}>
                  {compactAddress}
                </Text>
                <Text style={styles.locationCoordinates}>{coordinates}</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.changeLocationButton}
              onPress={handleLocationPress}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Change location"
            >
              <MaterialCommunityIcons name="crosshairs-gps" size={16} color={colors.primaryGreen} />
              <Text style={styles.changeLocationText}>Change Location (GPS or Map)</Text>
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, styles.descriptionTitle]}>Description</Text>
            <View style={styles.descriptionField}>
              <TextInput
                style={styles.descriptionInput}
                value={formData.description}
                onChangeText={updateDescription}
                placeholder="Describe the issue..."
                placeholderTextColor={colors.textMuted}
                multiline
                textAlignVertical="top"
                maxLength={DESCRIPTION_MAX_LENGTH}
                selectionColor={colors.primaryGreen}
                accessibilityLabel="Issue description"
              />
              <Text style={styles.characterCounter}>
                {formData.description.length} / {DESCRIPTION_MAX_LENGTH}
              </Text>
            </View>

            <Text style={[styles.sectionTitle, styles.severityTitle]}>Severity Level</Text>
            <View style={styles.severityRow} accessibilityRole="radiogroup">
              {SEVERITY_OPTIONS.map((option) => {
                const selected = formData.severity === option.level;

                return (
                  <TouchableOpacity
                    key={option.level}
                    style={[
                      styles.severityButton,
                      {
                        backgroundColor: option.surface,
                        borderColor: option.color,
                      },
                      selected && styles.severityButtonSelected,
                    ]}
                    onPress={() => selectSeverity(option.level)}
                    activeOpacity={0.8}
                    accessibilityRole="radio"
                    accessibilityLabel={`${option.label} severity`}
                    accessibilityState={{ checked: selected }}
                  >
                    <MaterialCommunityIcons
                      name={option.icon}
                      size={18}
                      color={option.color}
                    />
                    <Text style={[styles.severityLabel, { color: option.color }]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
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
            label="Next  →"
            onPress={() => router.push('/report-issue/media')}
            style={styles.footerButton}
          />
        </View>

        <LocationPickerModal
          visible={pickerVisible}
          currentLocation={formData.location}
          onClose={() => setPickerVisible(false)}
          onSelectLocation={handleSelectLocation}
        />
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
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  geofenceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  geofenceTagText: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: '#047857',
  },
  locationCard: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  locationIconBadge: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    backgroundColor: colors.greenSurface,
    borderRadius: radius.md,
  },
  locationTextGroup: {
    flex: 1,
    minWidth: 0,
  },
  locationAddress: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  locationCoordinates: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  changeLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  changeLocationText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primaryGreen,
  },
  descriptionTitle: {
    marginTop: spacing.xl,
  },
  descriptionField: {
    minHeight: 154,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  descriptionInput: {
    flex: 1,
    minHeight: 154,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    fontSize: fontSize.base,
    lineHeight: 21,
    color: colors.textPrimary,
  },
  characterCounter: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.sm,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  severityTitle: {
    marginTop: spacing.xxl,
  },
  severityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  severityButton: {
    flex: 1,
    minWidth: 0,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderWidth: 1.25,
    borderRadius: radius.md,
  },
  severityButtonSelected: {
    borderWidth: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
  },
  severityLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  helperText: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  footerButton: {
    flex: 1,
  },
});
