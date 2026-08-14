import React, { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";

/**
 * 3D Extruded Player Position Marker with Ground Radar and Stacked Depth Layers.
 */
export function PlayerMarker() {
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.9] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  return (
    <View style={styles.wrap}>
      {/* 3D Ground Perspective Radar Rings */}
      <View style={styles.groundPlane}>
        <Animated.View
          style={[
            styles.radarRing,
            {
              transform: [{ scale: ringScale }],
              opacity: ringOpacity,
            },
          ]}
        />
        <View style={styles.radarStaticCenter} />
      </View>

      {/* 3D Extruded Player Avatar Stack */}
      <View style={styles.avatarStack}>
        {/* Back 3D Extrusion Shadow Layer */}
        <View style={styles.avatarShadowLayer} />

        {/* Back 3D Extrusion Depth Layer (Exact copy behind) */}
        <View style={styles.avatarBackLayer}>
          <Ionicons name="walk" size={18} color="rgba(0, 0, 0, 0.4)" />
        </View>

        {/* Mid 3D Bevel Layer */}
        <View style={styles.avatarMidLayer} />

        {/* Front 3D Face with Specular Rim */}
        <View style={styles.avatarFront}>
          <View style={styles.avatarSheen} />
          <Ionicons name="walk" size={19} color={colors.textOnDark} />
        </View>
      </View>
    </View>
  );
}

const AVATAR_SIZE = 36;
const RADAR_SIZE = 68;

const styles = StyleSheet.create({
  wrap: {
    width: RADAR_SIZE,
    height: RADAR_SIZE + 10,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  // 3D Perspective Ground Plane
  groundPlane: {
    position: "absolute",
    bottom: 2,
    width: RADAR_SIZE,
    height: RADAR_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ scaleY: 0.5 }],
  },
  radarRing: {
    position: "absolute",
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    borderRadius: RADAR_SIZE / 2,
    borderWidth: 2.5,
    borderColor: colors.teal,
    backgroundColor: "rgba(34, 211, 238, 0.12)",
  },
  radarStaticCenter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(34, 211, 238, 0.4)",
    borderWidth: 1.5,
    borderColor: colors.teal,
  },
  // 3D Avatar Stack
  avatarStack: {
    width: AVATAR_SIZE + 6,
    height: AVATAR_SIZE + 6,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 6,
  },
  avatarShadowLayer: {
    position: "absolute",
    top: 6,
    left: 3,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  avatarBackLayer: {
    position: "absolute",
    top: 4,
    left: 2,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#0E7490",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(0, 0, 0, 0.4)",
  },
  avatarMidLayer: {
    position: "absolute",
    top: 2,
    left: 1,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#06B6D4",
  },
  avatarFront: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderTopColor: "rgba(255, 255, 255, 0.9)",
    borderLeftColor: "rgba(255, 255, 255, 0.6)",
    borderRightColor: "rgba(0, 0, 0, 0.25)",
    borderBottomColor: "rgba(0, 0, 0, 0.5)",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    position: "relative",
    overflow: "hidden",
  },
  avatarSheen: {
    position: "absolute",
    top: 1,
    left: 4,
    right: 4,
    height: AVATAR_SIZE / 2.6,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
});
