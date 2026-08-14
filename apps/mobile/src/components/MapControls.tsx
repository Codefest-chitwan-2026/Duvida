import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
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
      <ControlButton onPress={onCompassPress}>
        <Ionicons name="navigate" size={20} color={colors.textPrimary} />
      </ControlButton>
      <ControlButton onPress={onLocatePress}>
        <MaterialCommunityIcons name="crosshairs-gps" size={22} color={colors.textPrimary} />
      </ControlButton>
      <ControlButton onPress={onToggle3D} active={is3D}>
        <Text style={[styles.label3D, is3D && styles.label3DActive]}>3D</Text>
      </ControlButton>
      {onZoomIn && (
        <ControlButton onPress={onZoomIn}>
          <Ionicons name="add" size={22} color={colors.textPrimary} />
        </ControlButton>
      )}
      {onZoomOut && (
        <ControlButton onPress={onZoomOut}>
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
}: {
  children: ReactNode;
  onPress?: () => void;
  active?: boolean;
}) {
  return (
    <View
      style={[styles.button, active && styles.buttonActive]}
      onTouchEnd={onPress}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 16,
    gap: 12,
    alignItems: "center",
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  buttonActive: {
    backgroundColor: colors.brandGreen,
  },
  label3D: {
    fontWeight: "800",
    fontSize: 13,
    color: colors.textPrimary,
  },
  label3DActive: {
    color: colors.textOnDark,
  },
});
