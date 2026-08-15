import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";
import type { MapIssue } from "@/features/map/mockIssues";

type IssueMarkerProps = {
  issue: MapIssue;
  onPress?: () => void;
};

/**
 * High-Detail 3D Extruded Issue Pin with 5-layer isometric depth extrusion,
 * 3D tilted medallion coin, ground standoff pillar, and perspective landing ring.
 */
export function IssueMarker({ issue, onPress }: IssueMarkerProps) {
  return (
    <TouchableOpacity
      style={styles.wrap}
      onPress={onPress}
      activeOpacity={0.85}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      {/* 3D Floating Label Pill with 3D Bevel Block */}
      <View style={styles.labelBlock}>
        <View style={styles.labelExtrusionBack} />
        <View style={styles.labelFace}>
          <Text style={styles.title} numberOfLines={1}>{issue.title}</Text>
          <View style={[styles.tagBadge, { backgroundColor: `${issue.tagColor}25` }]}>
            <Text style={[styles.tag, { color: issue.tagColor }]}>{issue.tag}</Text>
          </View>
        </View>
      </View>

      {/* 3D Extruded Floating Medallion */}
      <View style={styles.medallion3DContainer}>
        {/* Layer 5: Dark Ground Drop Shadow */}
        <View style={styles.layerShadow} />

        {/* Layer 4: Deepest Extrusion Slice */}
        <View style={[styles.extrusionSlice, styles.slice4, { backgroundColor: "#0F172A" }]} />

        {/* Layer 3: Dark Extrusion Base (Printed copy behind) */}
        <View
          style={[
            styles.extrusionSlice,
            styles.slice3,
            { backgroundColor: `${issue.pinColor}66` },
          ]}
        >
          <MaterialCommunityIcons name={issue.icon} size={18} color="rgba(0, 0, 0, 0.4)" />
        </View>

        {/* Layer 2: Mid Extrusion Bevel (Printed copy behind) */}
        <View
          style={[
            styles.extrusionSlice,
            styles.slice2,
            { backgroundColor: `${issue.pinColor}AA` },
          ]}
        >
          <MaterialCommunityIcons name={issue.icon} size={18} color="rgba(0, 0, 0, 0.25)" />
        </View>

        {/* Layer 1: Front Extrusion Rim */}
        <View
          style={[
            styles.extrusionSlice,
            styles.slice1,
            { backgroundColor: issue.pinColor },
          ]}
        />

        {/* Layer 0: Front 3D Coin Face with Bevel Lighting */}
        <View style={[styles.coinFrontFace, { backgroundColor: issue.pinColor }]}>
          {/* Specular Highlight Arc */}
          <View style={styles.specularShine} />

          <MaterialCommunityIcons
            name={issue.icon}
            size={20}
            color={colors.textOnDark}
            style={styles.iconEmboss}
          />
        </View>

        {/* 3D Connecting Standoff Pillar */}
        <View style={styles.standoffPillar} />
      </View>

      {/* 3D Ground Perspective Landing Target */}
      <View style={styles.groundPlaneAnchor}>
        <View style={[styles.groundRingOuter, { borderColor: `${issue.pinColor}88` }]} />
        <View style={[styles.groundDotCore, { backgroundColor: issue.pinColor }]} />
      </View>
    </TouchableOpacity>
  );
}

const PIN_SIZE = 42;

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  // 3D Label Block
  labelBlock: {
    marginBottom: 4,
    alignItems: "center",
    position: "relative",
  },
  labelExtrusionBack: {
    position: "absolute",
    top: 3,
    left: 2,
    right: -2,
    bottom: -3,
    backgroundColor: "#020617",
    borderRadius: 8,
  },
  labelFace: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0F172A",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.3)",
    borderLeftColor: "rgba(255, 255, 255, 0.15)",
    borderRightColor: "rgba(0, 0, 0, 0.5)",
    borderBottomColor: "rgba(0, 0, 0, 0.8)",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
  title: {
    color: colors.textOnDark,
    fontWeight: "800",
    fontSize: 12,
    maxWidth: 130,
  },
  tagBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  tag: {
    fontWeight: "800",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // 3D Medallion Extrusion Stack
  medallion3DContainer: {
    width: PIN_SIZE + 12,
    height: PIN_SIZE + 16,
    alignItems: "center",
    position: "relative",
    // Isometric 3D Medallion Tilt
    transform: [
      { perspective: 450 },
      { rotateY: "-10deg" },
      { rotateX: "14deg" },
    ],
  },
  layerShadow: {
    position: "absolute",
    top: 10,
    left: 6,
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    transform: [{ scaleX: 1.15 }, { scaleY: 0.85 }],
  },
  extrusionSlice: {
    position: "absolute",
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.45)",
  },
  slice4: {
    top: 8,
    left: 4,
  },
  slice3: {
    top: 6,
    left: 3,
  },
  slice2: {
    top: 4,
    left: 2,
  },
  slice1: {
    top: 2,
    left: 1,
  },
  coinFrontFace: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderTopColor: "rgba(255, 255, 255, 0.95)",
    borderLeftColor: "rgba(255, 255, 255, 0.65)",
    borderRightColor: "rgba(0, 0, 0, 0.35)",
    borderBottomColor: "rgba(0, 0, 0, 0.65)",
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    overflow: "hidden",
  },
  specularShine: {
    position: "absolute",
    top: 2,
    left: 4,
    right: 4,
    height: PIN_SIZE / 2.3,
    borderRadius: PIN_SIZE / 2,
    backgroundColor: "rgba(255, 255, 255, 0.28)",
  },
  iconEmboss: {
    textShadowColor: "rgba(0, 0, 0, 0.45)",
    textShadowOffset: { width: 1, height: 1.5 },
    textShadowRadius: 2,
  },
  standoffPillar: {
    position: "absolute",
    top: PIN_SIZE - 2,
    width: 4,
    height: 14,
    backgroundColor: "#94A3B8",
    borderRadius: 2,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255, 255, 255, 0.6)",
    borderRightWidth: 1,
    borderRightColor: "rgba(0, 0, 0, 0.5)",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 3,
    shadowOffset: { width: 1, height: 2 },
  },
  // 3D Perspective Ground Landing Target
  groundPlaneAnchor: {
    width: 36,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -2,
    transform: [{ scaleY: 0.5 }],
  },
  groundRingOuter: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  groundDotCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
});
