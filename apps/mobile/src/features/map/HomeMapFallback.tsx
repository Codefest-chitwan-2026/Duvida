import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { IssueMarker } from "@/components/IssueMarker";
import { PlayerMarker } from "@/components/PlayerMarker";
import { mockIssues, DEMO_CENTER } from "@/features/map/mockIssues";
import { colors } from "@/theme/colors";
import type { Coordinate } from "@/services/location/useUserLocation";

export type HomeMapHandle = {
  recenter: () => void;
  resetBearing: () => void;
  zoomIn?: () => void;
  zoomOut?: () => void;
};

type HomeMapFallbackProps = {
  center?: Coordinate;
  is3D?: boolean;
  selectedCategory?: string;
  selectedIssueId?: string | null;
  onIssuePress?: (issueId: string) => void;
};

const TILE_SIZE = 256;
const SUBDOMAINS = ["a", "b", "c", "d"];

function latLngToTile(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const y =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { x, y };
}

export const HomeMapFallback = forwardRef<HomeMapHandle, HomeMapFallbackProps>(
  (
    {
      center = DEMO_CENTER,
      is3D = false,
      selectedCategory = "all",
      selectedIssueId,
      onIssuePress,
    },
    ref
  ) => {
    const [dimensions, setDimensions] = useState(() => Dimensions.get("window"));
    const [zoom, setZoom] = useState(15);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

    // Store drag starting position to guarantee exact 1:1 pixel movement without jumps
    const dragStartPanRef = useRef({ x: 0, y: 0 });
    const currentPanRef = useRef({ x: 0, y: 0 });
    currentPanRef.current = panOffset;

    useEffect(() => {
      const sub = Dimensions.addEventListener("change", ({ window }) => {
        setDimensions(window);
      });
      return () => sub.remove();
    }, []);

    useImperativeHandle(ref, () => ({
      recenter: () => {
        setPanOffset({ x: 0, y: 0 });
        setZoom(15);
      },
      resetBearing: () => {
        setPanOffset({ x: 0, y: 0 });
      },
      zoomIn: () => {
        setZoom((z) => Math.min(z + 1, 18));
      },
      zoomOut: () => {
        setZoom((z) => Math.max(z - 1, 12));
      },
    }));

    // Natural touch & mouse pan gesture with 1:1 displacement & momentum
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
        },
        onPanResponderGrant: () => {
          dragStartPanRef.current = { ...currentPanRef.current };
        },
        onPanResponderMove: (_, gestureState) => {
          // In 3D perspective, scale Y motion slightly so vertical panning feels perfectly 1:1 on the tilted ground plane
          const yMultiplier = is3D ? 1.3 : 1.0;
          const nextX = dragStartPanRef.current.x + gestureState.dx;
          const nextY = dragStartPanRef.current.y + gestureState.dy * yMultiplier;
          setPanOffset({ x: nextX, y: nextY });
        },
        onPanResponderRelease: (_, gestureState) => {
          const yMultiplier = is3D ? 1.3 : 1.0;
          const momentumX = Math.max(Math.min(gestureState.vx * 60, 180), -180);
          const momentumY = Math.max(Math.min(gestureState.vy * 60 * yMultiplier, 180), -180);

          const finalX = dragStartPanRef.current.x + gestureState.dx + momentumX;
          const finalY = dragStartPanRef.current.y + gestureState.dy * yMultiplier + momentumY;

          setPanOffset({ x: finalX, y: finalY });
        },
        onPanResponderTerminate: () => {
          setPanOffset({ ...currentPanRef.current });
        },
      })
    ).current;

    // Filter issues by category
    const filteredIssues = mockIssues.filter((issue) => {
      if (selectedCategory === "all") return true;
      if (selectedCategory === "quests") return issue.kind === "quest";
      if (selectedCategory === "hazards")
        return ["pothole", "traffic", "water-leak"].includes(issue.id);
      if (selectedCategory === "waste")
        return issue.id === "garbage" || issue.id === "clean-park";
      return true;
    });

    const centerTile = latLngToTile(center.latitude, center.longitude, zoom);
    const centerTileXInt = Math.floor(centerTile.x);
    const centerTileYInt = Math.floor(centerTile.y);
    const fractionalX = centerTile.x - centerTileXInt;
    const fractionalY = centerTile.y - centerTileYInt;

    const screenCenterX = dimensions.width / 2;
    const screenCenterY = dimensions.height / 2;

    // Wide 7x11 buffer grid to ensure zero black edge flashes during 3D camera tilt
    const tiles: { key: string; x: number; y: number; left: number; top: number; url: string }[] = [];
    const maxTiles = Math.pow(2, zoom);

    const panTileShiftX = Math.floor(-panOffset.x / TILE_SIZE);
    const panTileShiftY = Math.floor(-panOffset.y / TILE_SIZE);

    const minDx = -3 + panTileShiftX;
    const maxDx = 3 + panTileShiftX;
    const minDy = -5 + panTileShiftY;
    const maxDy = 5 + panTileShiftY;

    for (let dx = minDx; dx <= maxDx; dx++) {
      for (let dy = minDy; dy <= maxDy; dy++) {
        const tileX = (centerTileXInt + dx + maxTiles * 10) % maxTiles;
        const tileY = centerTileYInt + dy;

        if (tileY >= 0 && tileY < maxTiles) {
          const sub = SUBDOMAINS[Math.abs(tileX + tileY) % SUBDOMAINS.length];
          const url = `https://${sub}.basemaps.cartocdn.com/dark_all/${zoom}/${tileX}/${tileY}.png`;

          const left = screenCenterX + (dx - fractionalX) * TILE_SIZE + panOffset.x;
          const top = screenCenterY + (dy - fractionalY) * TILE_SIZE + panOffset.y;

          tiles.push({
            key: `${zoom}-${tileX}-${tileY}`,
            x: tileX,
            y: tileY,
            left,
            top,
            url,
          });
        }
      }
    }

    return (
      <View style={styles.container} {...panResponder.panHandlers}>
        {/* 3D Perspective Ground Plane Surface */}
        <View
          style={[
            styles.mapSurface,
            is3D ? styles.mapSurface3D : styles.mapSurface2D,
          ]}
        >
          {/* Active Map Tile Layer */}
          {tiles.map((t) => (
            <Image
              key={t.key}
              source={{ uri: t.url }}
              style={[
                styles.tile,
                {
                  left: t.left,
                  top: t.top,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                },
              ]}
              resizeMode="cover"
            />
          ))}

          {/* 3D Ground Grid Lines Overlay for Cyberpunk/Digital-Twin aesthetic */}
          {is3D && <View style={styles.gridOverlay} pointerEvents="none" />}

          {/* Issue & Quest Markers (Billboarded upright in 3D space) */}
          {filteredIssues.map((issue) => {
            const issueLat = center.latitude + issue.offset.lat;
            const issueLng = center.longitude + issue.offset.lng;
            const markerTile = latLngToTile(issueLat, issueLng, zoom);

            const markerLeft =
              screenCenterX +
              (markerTile.x - centerTile.x) * TILE_SIZE +
              panOffset.x;
            const markerTop =
              screenCenterY +
              (markerTile.y - centerTile.y) * TILE_SIZE +
              panOffset.y;

            const isSelected = selectedIssueId === issue.id;

            return (
              <View
                key={issue.id}
                style={[
                  styles.markerSlot,
                  is3D && styles.markerBillboard3D,
                  {
                    left: markerLeft,
                    top: markerTop,
                    zIndex: isSelected ? 40 : 20,
                  },
                ]}
              >
                {/* 3D Ground Shadow under pin */}
                <View style={styles.groundShadow} />

                {isSelected && (
                  <View
                    style={[
                      styles.selectedRing,
                      { borderColor: issue.pinColor },
                    ]}
                  />
                )}
                <IssueMarker
                  issue={issue}
                  onPress={() => onIssuePress?.(issue.id)}
                />
              </View>
            );
          })}

          {/* Player Avatar at Screen Center (Billboarded upright in 3D) */}
          <View
            style={[
              styles.playerMarker,
              is3D && styles.markerBillboard3D,
              {
                left: screenCenterX + panOffset.x,
                top: screenCenterY + panOffset.y,
              },
            ]}
          >
            <View style={styles.playerShadow} />
            <PlayerMarker />
          </View>
        </View>

        {/* 3D Horizon Atmospheric Fog (Top Edge Vignette) */}
        {is3D && <View style={styles.horizonFog} pointerEvents="none" />}

        {/* Map Attribution Watermark */}
        <View style={styles.attribution} pointerEvents="none">
          <Text style={styles.attributionText}>
            © OpenStreetMap contributors, © CARTO • 3D Camera Active
          </Text>
        </View>
      </View>
    );
  }
);

HomeMapFallback.displayName = "HomeMapFallback";

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#060A12",
    overflow: "hidden",
  },
  mapSurface: {
    ...StyleSheet.absoluteFill,
  },
  mapSurface2D: {
    transform: [{ scale: 1.0 }],
  },
  // True 3D Isometric / Low-Angle Perspective Camera
  mapSurface3D: {
    transform: [
      { perspective: 750 },
      { rotateX: "48deg" },
      { translateY: -20 },
      { scale: 1.3 },
    ],
  },
  tile: {
    position: "absolute",
    backgroundColor: "#080E1A",
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "transparent",
    opacity: 0.15,
  },
  markerSlot: {
    position: "absolute",
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  // Billboarding: Counter-rotates markers so they stand straight UP perpendicular to 3D ground plane
  markerBillboard3D: {
    transform: [
      { translateX: -50 },
      { translateY: -50 },
      { rotateX: "-48deg" },
    ],
  },
  groundShadow: {
    position: "absolute",
    bottom: 24,
    left: 36,
    width: 28,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    transform: [{ scaleX: 1.3 }],
  },
  playerShadow: {
    position: "absolute",
    bottom: 12,
    left: 20,
    width: 24,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  selectedRing: {
    position: "absolute",
    top: 20,
    left: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    backgroundColor: "rgba(59, 130, 246, 0.25)",
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  playerMarker: {
    position: "absolute",
    transform: [{ translateX: -32 }, { translateY: -32 }],
    zIndex: 35,
  },
  horizonFog: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: "rgba(6, 10, 18, 0.82)",
    zIndex: 5,
  },
  attribution: {
    position: "absolute",
    bottom: 74,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 4,
    zIndex: 10,
  },
  attributionText: {
    color: "rgba(255, 255, 255, 0.65)",
    fontSize: 9,
    fontFamily: "monospace",
  },
});
