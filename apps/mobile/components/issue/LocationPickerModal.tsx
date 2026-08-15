import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import {
  calculateDistanceMeters,
  MAX_REPORT_RADIUS_METERS,
  reverseGeocodeLocation,
} from '../../src/services/location/geoUtils';
import { useUserLocation } from '../../src/services/location/useUserLocation';
import { IssueLocation } from '../../types/issue';

interface LocationPickerModalProps {
  visible: boolean;
  currentLocation: IssueLocation;
  onClose: () => void;
  onSelectLocation: (location: IssueLocation) => void;
}

const MAP_WIDTH = Math.min(Dimensions.get('window').width - 48, 420);
const MAP_HEIGHT = 280;
// 100 meters represents roughly 70 pixels at standard close-up zoom
const GEOFENCE_PIXEL_RADIUS = 85;
// Degrees per pixel at this local zoom scale (~100m / 85px)
const METERS_PER_DEGREE = 111320;
const DEG_PER_PIXEL = (100 / GEOFENCE_PIXEL_RADIUS) / METERS_PER_DEGREE;

export default function LocationPickerModal({
  visible,
  currentLocation,
  onClose,
  onSelectLocation,
}: LocationPickerModalProps) {
  const { coordinate: userGps, loading: gpsLoading } = useUserLocation();
  const [mode, setMode] = useState<'gps' | 'map'>('gps');

  // Relative pixel offset of the chosen pin from the center (user's live location)
  const [pinOffset, setPinOffset] = useState({ x: 0, y: 0 });
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState(currentLocation.address);

  // Compute targeted coordinate from user GPS + pixel offset
  const selectedCoordinate = useMemo(() => {
    const lat = userGps.latitude - pinOffset.y * DEG_PER_PIXEL;
    const lng = userGps.longitude + pinOffset.x * DEG_PER_PIXEL;
    return { latitude: lat, longitude: lng };
  }, [userGps, pinOffset]);

  // Real-time distance in meters from live GPS
  const distanceMeters = useMemo(() => {
    return Math.round(
      calculateDistanceMeters(
        userGps.latitude,
        userGps.longitude,
        selectedCoordinate.latitude,
        selectedCoordinate.longitude
      )
    );
  }, [userGps, selectedCoordinate]);

  const isWithinGeofence = distanceMeters <= MAX_REPORT_RADIUS_METERS;

  // Resolve address when pin coordinates change
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsResolvingAddress(true);
      const addr = await reverseGeocodeLocation(
        selectedCoordinate.latitude,
        selectedCoordinate.longitude
      );
      if (!cancelled) {
        setResolvedAddress(addr);
        setIsResolvingAddress(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selectedCoordinate]);

  // Touch / Pan handler on the mini-map to position the pin
  const handleMapPress = (evt: any) => {
    const { locationX, locationY } = evt.nativeEvent;
    const centerX = MAP_WIDTH / 2;
    const centerY = MAP_HEIGHT / 2;
    const offsetX = locationX - centerX;
    const offsetY = locationY - centerY;

    setPinOffset({ x: offsetX, y: offsetY });
  };

  const handleUseGpsDirectly = async () => {
    setIsResolvingAddress(true);
    const addr = await reverseGeocodeLocation(userGps.latitude, userGps.longitude);
    setIsResolvingAddress(false);
    onSelectLocation({
      address: addr,
      latitude: userGps.latitude,
      longitude: userGps.longitude,
    });
    onClose();
  };

  const handleConfirmMapLocation = () => {
    if (!isWithinGeofence) return;
    onSelectLocation({
      address: resolvedAddress,
      latitude: selectedCoordinate.latitude,
      longitude: selectedCoordinate.longitude,
    });
    onClose();
  };

  const handleSnapToGps = () => {
    setPinOffset({ x: 0, y: 0 });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Select Report Location</Text>
              <Text style={styles.subtitle}>Reports must be within 100m of your position</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityLabel="Close location picker"
            >
              <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Mode Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, mode === 'gps' && styles.tabActive]}
              onPress={() => {
                setMode('gps');
                handleSnapToGps();
              }}
            >
              <MaterialCommunityIcons
                name="crosshairs-gps"
                size={18}
                color={mode === 'gps' ? colors.white : colors.textSecondary}
              />
              <Text style={[styles.tabText, mode === 'gps' && styles.tabTextActive]}>
                Live GPS
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, mode === 'map' && styles.tabActive]}
              onPress={() => setMode('map')}
            >
              <MaterialCommunityIcons
                name="map-marker-radius"
                size={18}
                color={mode === 'map' ? colors.white : colors.textSecondary}
              />
              <Text style={[styles.tabText, mode === 'map' && styles.tabTextActive]}>
                Pick on Map (100m)
              </Text>
            </TouchableOpacity>
          </View>

          {/* GPS Mode */}
          {mode === 'gps' ? (
            <View style={styles.gpsContainer}>
              <View style={styles.gpsIconCircle}>
                <MaterialCommunityIcons name="map-marker-check" size={38} color={colors.primaryGreen} />
              </View>

              <Text style={styles.gpsTitle}>Use Your Live Location</Text>
              <Text style={styles.gpsSubtitle}>
                Automatically verified at your exact device coordinates.
              </Text>

              <View style={styles.locationPreviewBox}>
                <View style={styles.previewRow}>
                  <MaterialCommunityIcons name="compass-outline" size={18} color={colors.primaryGreen} />
                  <Text style={styles.previewCoords}>
                    Lat {userGps.latitude.toFixed(5)}, Long {userGps.longitude.toFixed(5)}
                  </Text>
                </View>
                <Text style={styles.previewAddress}>
                  {isResolvingAddress ? 'Resolving address…' : resolvedAddress}
                </Text>
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons name="shield-check" size={14} color="#047857" />
                  <Text style={styles.verifiedText}>0m from you · 100% Authentic</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={handleUseGpsDirectly}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="check-bold" size={18} color={colors.white} />
                <Text style={styles.primaryActionText}>Confirm GPS Location</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Map Picker Mode */
            <View style={styles.mapPickerContainer}>
              <View style={styles.mapInstructionRow}>
                <Text style={styles.mapInstructionText}>
                  Tap anywhere inside the <Text style={styles.boldGreen}>100m green circle</Text> to position the issue pin.
                </Text>
                <TouchableOpacity style={styles.snapGpsBtn} onPress={handleSnapToGps}>
                  <MaterialCommunityIcons name="target" size={16} color={colors.primaryGreen} />
                  <Text style={styles.snapGpsText}>Reset to GPS</Text>
                </TouchableOpacity>
              </View>

              {/* Mini Map Surface */}
              <TouchableOpacity
                activeOpacity={1}
                onPress={handleMapPress}
                style={styles.mapSurface}
              >
                {/* Background grid representation */}
                <View style={styles.mapGridLineH1} />
                <View style={styles.mapGridLineH2} />
                <View style={styles.mapGridLineV1} />
                <View style={styles.mapGridLineV2} />

                {/* 100m Geofence Radius Circle */}
                <View
                  style={[
                    styles.geofenceCircle,
                    {
                      width: GEOFENCE_PIXEL_RADIUS * 2,
                      height: GEOFENCE_PIXEL_RADIUS * 2,
                      borderRadius: GEOFENCE_PIXEL_RADIUS,
                    },
                  ]}
                  pointerEvents="none"
                >
                  <Text style={styles.geofenceLabel}>100m Reporting Zone</Text>
                </View>

                {/* User Live Location Marker (Center) */}
                <View style={styles.userMarker} pointerEvents="none">
                  <View style={styles.userMarkerPulse} />
                  <View style={styles.userMarkerDot} />
                  <Text style={styles.userMarkerTag}>You</Text>
                </View>

                {/* Selected Issue Pin */}
                <View
                  style={[
                    styles.pinMarker,
                    {
                      transform: [
                        { translateX: pinOffset.x },
                        { translateY: pinOffset.y - 16 },
                      ],
                    },
                  ]}
                  pointerEvents="none"
                >
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={34}
                    color={isWithinGeofence ? colors.red : '#DC2626'}
                  />
                </View>
              </TouchableOpacity>

              {/* Status Meter Card */}
              <View
                style={[
                  styles.distanceStatusCard,
                  isWithinGeofence ? styles.statusValid : styles.statusInvalid,
                ]}
              >
                <MaterialCommunityIcons
                  name={isWithinGeofence ? 'check-circle' : 'alert-circle'}
                  size={20}
                  color={isWithinGeofence ? '#047857' : '#B91C1C'}
                />
                <View style={styles.distanceCopy}>
                  <Text
                    style={[
                      styles.distanceTitle,
                      { color: isWithinGeofence ? '#047857' : '#B91C1C' },
                    ]}
                  >
                    {isWithinGeofence
                      ? `Within 100m Range (${distanceMeters}m away)`
                      : `Out of Range (${distanceMeters}m away — Limit: 100m)`}
                  </Text>
                  <Text style={styles.distanceSubtitle} numberOfLines={1}>
                    {isWithinGeofence
                      ? resolvedAddress
                      : 'Please move the pin inside the 100m perimeter to report.'}
                  </Text>
                </View>
              </View>

              {/* Confirm Button */}
              <TouchableOpacity
                style={[
                  styles.primaryActionButton,
                  !isWithinGeofence && styles.actionButtonDisabled,
                ]}
                onPress={handleConfirmMapLocation}
                disabled={!isWithinGeofence}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons
                  name="check-bold"
                  size={18}
                  color={isWithinGeofence ? colors.white : '#94A3B8'}
                />
                <Text
                  style={[
                    styles.primaryActionText,
                    !isWithinGeofence && styles.actionTextDisabled,
                  ]}
                >
                  {isWithinGeofence ? 'Confirm Location' : 'Exceeds 100m Range'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 36 : spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: radius.md,
    padding: 3,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: radius.sm,
  },
  tabActive: {
    backgroundColor: colors.primaryGreen,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  gpsContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  gpsIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  gpsTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  gpsSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  locationPreviewBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing.md,
    gap: 6,
    marginVertical: spacing.xs,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewCoords: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  previewAddress: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: '#047857',
  },
  mapPickerContainer: {
    gap: spacing.sm,
  },
  mapInstructionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapInstructionText: {
    flex: 1,
    fontSize: 11,
    color: colors.textSecondary,
  },
  boldGreen: {
    fontWeight: fontWeight.bold,
    color: colors.primaryGreen,
  },
  snapGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: '#DCFCE7',
  },
  snapGpsText: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: colors.primaryGreen,
  },
  mapSurface: {
    width: '100%',
    height: MAP_HEIGHT,
    backgroundColor: '#E2E8F0',
    borderRadius: radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  mapGridLineH1: {
    position: 'absolute',
    top: '33%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  mapGridLineH2: {
    position: 'absolute',
    top: '66%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  mapGridLineV1: {
    position: 'absolute',
    left: '33%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  mapGridLineV2: {
    position: 'absolute',
    left: '66%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  geofenceCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderWidth: 2,
    borderColor: '#10B981',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  geofenceLabel: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: '#047857',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  userMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  userMarkerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: colors.white,
  },
  userMarkerTag: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: '#1E3A8A',
    marginTop: 2,
  },
  pinMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  statusValid: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF0D0',
  },
  statusInvalid: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  distanceCopy: {
    flex: 1,
  },
  distanceTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  distanceSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    backgroundColor: colors.primaryGreen,
    borderRadius: radius.md,
    paddingVertical: 13,
    marginTop: 4,
  },
  primaryActionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  actionButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  actionTextDisabled: {
    color: '#94A3B8',
  },
});
