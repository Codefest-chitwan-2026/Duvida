import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
  title: string;
  description: string;
  tag: string;
  icon: SeverityIconName;
  color: string;
  darkColor: string;
  surface: string;
  border: string;
}

const SEVERITY_OPTIONS: SeverityOption[] = [
  {
    level: 'low',
    label: 'Low',
    title: 'Low Priority (Cosmetic & Routine)',
    description: 'Minor non-urgent issues or light cleaning (e.g. small litter, faint road markings, garden trimming).',
    tag: 'Low Priority Selected',
    icon: 'emoticon-happy-outline',
    color: colors.primaryGreen,
    darkColor: colors.primaryGreen, // Exact same green as the Next button (#27AE60)
    surface: colors.greenSurface,
    border: '#A9DFBF',
  },
  {
    level: 'medium',
    label: 'Medium',
    title: 'Medium Priority (Moderate Impact)',
    description: 'Moderate disruption or public inconvenience (e.g. overflowing waste bin, broken street light, minor traffic obstacle).',
    tag: 'Medium Priority Selected',
    icon: 'emoticon-neutral-outline',
    color: '#D97706',
    darkColor: '#78350F', // Rich dark roasted amber / ochre
    surface: '#FFFBEB',
    border: '#FDE68A',
  },
  {
    level: 'high',
    label: 'High',
    title: 'High Priority (Urgent & Hazard)',
    description: 'Critical safety hazard or blockage requiring immediate action (e.g. deep pothole, exposed live wire, burst water pipe).',
    tag: 'High Priority (Urgent)',
    icon: 'alert-circle',
    color: '#DC2626',
    darkColor: '#7F1D1D', // Rich dark crimson burgundy
    surface: '#FEF2F2',
    border: '#FECACA',
  },
];

interface AnimatedSeverityButtonProps {
  option: SeverityOption;
  selected: boolean;
  onPress: () => void;
}

function AnimatedSeverityButton({ option, selected, onPress }: AnimatedSeverityButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const iconScaleAnim = useRef(new Animated.Value(1)).current;
  const activeAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(activeAnim, {
      toValue: selected ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();

    if (selected) {
      // Tactile spring bounce when selected
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.07,
          friction: 4,
          tension: 110,
          useNativeDriver: false,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: false,
        }),
      ]).start();

      // Icon pop
      Animated.sequence([
        Animated.timing(iconScaleAnim, {
          toValue: 1.35,
          duration: 130,
          useNativeDriver: false,
        }),
        Animated.spring(iconScaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: false,
      }).start();
      Animated.spring(iconScaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: false,
      }).start();
    }
  }, [selected]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.90,
      friction: 5,
      tension: 140,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: selected ? 1.04 : 1,
      friction: 4,
      tension: 80,
      useNativeDriver: false,
    }).start();
  };

  const backgroundColor = activeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [option.surface, option.darkColor],
  });

  const borderColor = activeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [option.border, option.darkColor],
  });

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <Animated.View
          style={[
            styles.severityButton,
            {
              backgroundColor,
              borderColor,
              shadowColor: option.darkColor,
            },
            selected && styles.severityButtonSelected,
          ]}
          accessibilityRole="radio"
          accessibilityLabel={`${option.label} severity`}
          accessibilityState={{ checked: selected }}
        >
          <Animated.View style={{ transform: [{ scale: iconScaleAnim }] }}>
            <MaterialCommunityIcons
              name={option.icon}
              size={20}
              color={selected ? colors.white : option.color}
            />
          </Animated.View>
          <Text
            style={[
              styles.severityLabel,
              { color: selected ? colors.white : option.color },
              selected && styles.severityLabelSelected,
            ]}
          >
            {option.label}
          </Text>
          {selected && (
            <View style={styles.selectedBadge}>
              <MaterialCommunityIcons name="check" size={10} color={option.darkColor} />
            </View>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

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

  const currentSeverity =
    SEVERITY_OPTIONS.find((s) => s.level === formData.severity) ?? SEVERITY_OPTIONS[0];
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

            <View style={styles.severityHeaderRow}>
              <Text style={styles.sectionTitle}>Severity Level</Text>
              <View
                style={[
                  styles.severityTagBadge,
                  {
                    backgroundColor: currentSeverity.surface,
                    borderColor: currentSeverity.border,
                  },
                ]}
              >
                <View style={[styles.severityDot, { backgroundColor: currentSeverity.color }]} />
                <Text style={[styles.severityTagText, { color: currentSeverity.color }]}>
                  {currentSeverity.tag}
                </Text>
              </View>
            </View>

            <View style={styles.severityRow} accessibilityRole="radiogroup">
              {SEVERITY_OPTIONS.map((option) => (
                <AnimatedSeverityButton
                  key={option.level}
                  option={option}
                  selected={formData.severity === option.level}
                  onPress={() => selectSeverity(option.level)}
                />
              ))}
            </View>

            {/* Dynamic Dark Color Section Card */}
            <View
              style={[
                styles.severityColorCard,
                {
                  backgroundColor: currentSeverity.surface,
                  borderColor: currentSeverity.border,
                  borderLeftColor: currentSeverity.darkColor,
                  borderLeftWidth: 5,
                },
              ]}
            >
              <View
                style={[
                  styles.severityIconBox,
                  { backgroundColor: currentSeverity.darkColor },
                ]}
              >
                <MaterialCommunityIcons
                  name={currentSeverity.icon}
                  size={19}
                  color={colors.white}
                />
              </View>
              <View style={styles.severityCardCopy}>
                <View style={styles.severityCardTopLine}>
                  <Text
                    style={[
                      styles.severityCardTitle,
                      { color: currentSeverity.darkColor },
                    ]}
                  >
                    {currentSeverity.title}
                  </Text>
                  <View
                    style={[
                      styles.severityActivePill,
                      { backgroundColor: currentSeverity.darkColor },
                    ]}
                  >
                    <Text style={styles.severityActivePillText}>SELECTED</Text>
                  </View>
                </View>
                <Text style={styles.severityCardDesc}>
                  {currentSeverity.description}
                </Text>
              </View>
            </View>
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
  severityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xxl,
    marginBottom: spacing.xs,
  },
  severityTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  severityDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  severityTagText: {
    fontSize: 12,
    fontWeight: fontWeight.bold,
  },
  severityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  severityButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderWidth: 1.5,
    borderRadius: radius.md,
    position: 'relative',
  },
  severityButtonSelected: {
    borderWidth: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  severityLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  severityLabelSelected: {
    fontWeight: fontWeight.bold,
  },
  selectedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityColorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  severityIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  severityCardCopy: {
    flex: 1,
    gap: 3,
  },
  severityCardTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  severityCardTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    flex: 1,
  },
  severityActivePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityActivePillText: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  severityCardDesc: {
    fontSize: 12,
    lineHeight: 17,
    color: '#334155',
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
