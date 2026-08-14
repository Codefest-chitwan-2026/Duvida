import React, { type ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";

type MapControlsProps = {
  bottomOffset: number;
  is3D: boolean;
  onCompassPress?: () => void;
  onLocatePress?: () => void;
  onToggle3D?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
};

export function MapControls({
  bottomOffset,
  is3D,
  onCompassPress,
  onLocatePress,
  onToggle3D,
  onZoomIn,
  onZoomOut,
}: MapControlsProps) {
  return (
    <View style={[styles.container, { bottom: bottomOffset }]} pointerEvents="box-none">
      {/* Compass / Orientation */}
      <ControlButton onPress={onCompassPress} label="Reset Orientation">
        <Ionicons name="navigate" size={20} color={colors.textPrimary} />
      </ControlButton>

      {/* GPS Locate / Recenter */}
      <ControlButton onPress={onLocatePress} label="Locate Me">
        <MaterialCommunityIcons name="crosshairs-gps" size={22} color={colors.textPrimary} />
      </ControlButton>

      {/* 3D / 2D Perspective Toggle Button */}
      <ControlButton
        onPress={onToggle3D}
        active={is3D}
        label={is3D ? "Switch to 2D Map" : "Switch to 3D Map"}
      >
        <Text style={[styles.label3D, is3D && styles.label3DActive]}>
          {is3D ? "3D" : "2D"}
        </Text>
      </ControlButton>

      {/* Zoom In */}
      {onZoomIn && (
        <ControlButton onPress={onZoomIn} label="Zoom In">
          <Ionicons name="add" size={22} color={colors.textPrimary} />
        </ControlButton>
      )}

      {/* Zoom Out */}
      {onZoomOut && (
        <ControlButton onPress={onZoomOut} label="Zoom Out">
          <Ionicons name="remove" size={22} color={colors.textPrimary} />
        </ControlButton>
      )}
    </View>
  );
}

function ControlButton({
  children,
  onPress,
  active,
  label,
}: {
  children: ReactNode;
  onPress?: () => void;
  active?: boolean;
  label?: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.button, active && styles.buttonActive]}
      onPress={onPress}
      activeOpacity={0.75}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityLabel={label}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 16,
    gap: 12,
    alignItems: "center",
    zIndex: 50,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  buttonActive: {
    backgroundColor: colors.brandGreen,
    borderColor: colors.brandGreenDark,
  },
  label3D: {
    fontWeight: "900",
    fontSize: 13,
    color: colors.textPrimary,
  },
  label3DActive: {
    color: colors.textOnDark,
  },
});
