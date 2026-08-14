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
          // Trigger pan only when deliberate movement occurs (> 3 pixels)
          return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
        },
        onPanResponderGrant: () => {
          // Lock current offset as origin for the drag session
          dragStartPanRef.current = { ...currentPanRef.current };
        },
        onPanResponderMove: (_, gestureState) => {
          // Smooth 1:1 natural drag tracking
          const nextX = dragStartPanRef.current.x + gestureState.dx;
          const nextY = dragStartPanRef.current.y + gestureState.dy;
          setPanOffset({ x: nextX, y: nextY });
        },
        onPanResponderRelease: (_, gestureState) => {
          // Calculate subtle momentum glide for fluid Google Maps feel
          const momentumX = Math.max(Math.min(gestureState.vx * 60, 180), -180);
          const momentumY = Math.max(Math.min(gestureState.vy * 60, 180), -180);

          const finalX = dragStartPanRef.current.x + gestureState.dx + momentumX;
          const finalY = dragStartPanRef.current.y + gestureState.dy + momentumY;

          setPanOffset({ x: finalX, y: finalY });
        },
        onPanResponderTerminate: () => {
          // Keep current position if gesture is interrupted
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

    // Wide 7x9 buffer grid to ensure zero black edge flashes during smooth panning
    const tiles: { key: string; x: number; y: number; left: number; top: number; url: string }[] = [];
    const maxTiles = Math.pow(2, zoom);

    // Calculate how many tiles needed based on screen size + pan displacement
    const panTileShiftX = Math.floor(-panOffset.x / TILE_SIZE);
    const panTileShiftY = Math.floor(-panOffset.y / TILE_SIZE);

    const minDx = -3 + panTileShiftX;
    const maxDx = 3 + panTileShiftX;
    const minDy = -4 + panTileShiftY;
    const maxDy = 4 + panTileShiftY;

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
        <View
          style={[
            styles.mapSurface,
            is3D && styles.mapSurface3D,
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

          {/* Issue & Quest Markers */}
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
                  {
                    left: markerLeft,
                    top: markerTop,
                    zIndex: isSelected ? 40 : 20,
                  },
                ]}
              >
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

          {/* Player Avatar at Screen Center (moves with pan) */}
          <View
            style={[
              styles.playerMarker,
              {
                left: screenCenterX + panOffset.x,
                top: screenCenterY + panOffset.y,
              },
            ]}
          >
            <PlayerMarker />
          </View>
        </View>

        {/* Map Attribution Watermark */}
        <View style={styles.attribution} pointerEvents="none">
          <Text style={styles.attributionText}>
            © OpenStreetMap contributors, © CARTO
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
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  mapSurface: {
    ...StyleSheet.absoluteFill,
  },
  mapSurface3D: {
    transform: [
      { perspective: 900 },
      { rotateX: "36deg" },
      { scale: 1.1 },
    ],
  },
  tile: {
    position: "absolute",
    backgroundColor: "#0B1220",
  },
  markerSlot: {
    position: "absolute",
    transform: [{ translateX: -50 }, { translateY: -50 }],
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
  attribution: {
    position: "absolute",
    bottom: 74,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  attributionText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 9,
    fontFamily: "monospace",
  },
});
