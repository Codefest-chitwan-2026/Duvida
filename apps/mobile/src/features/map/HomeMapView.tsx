import { forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet } from "react-native";
import type Mapbox from "@rnmapbox/maps";

import { IssueMarker } from "@/components/IssueMarker";
import { PlayerMarker } from "@/components/PlayerMarker";
import { mockIssues } from "@/features/map/mockIssues";
import { HomeMapFallback, type HomeMapHandle } from "@/features/map/HomeMapFallback";
import { env, hasMapboxToken } from "@/lib/env";
import type { Coordinate } from "@/services/location/useUserLocation";

const CITY_ZOOM_LEVEL = 16.5;
const TILT_PITCH = 60;

// Guarded the same way as src/lib/mapbox.ts: @rnmapbox/maps registers a
// native module as soon as it's required, which throws when the native code
// isn't linked (Expo Go, or a dev client built before the config plugin was
// added). Expo Router eagerly requires every route file — including this
// screen, via app/(tabs)/index.tsx — while validating routes in
// development, so an unguarded top-level import here can crash app startup
// before the user ever opens this tab.
let MapboxModule: typeof Mapbox | null = null;
try {
  MapboxModule = require("@rnmapbox/maps").default;
} catch (error) {
  console.warn("[HomeMapView] @rnmapbox/maps native module unavailable", error);
}

type HomeMapViewProps = {
  center: Coordinate;
  is3D: boolean;
  selectedCategory?: string;
  selectedIssueId?: string | null;
  onIssuePress?: (issueId: string) => void;
};

export type { HomeMapHandle };

/**
 * The live Mapbox surface: renders once a token is configured.
 * When no token is configured, seamlessly falls back to the interactive Simple Map.
 */
export const HomeMapView = forwardRef<HomeMapHandle, HomeMapViewProps>(
  ({ center, is3D, selectedCategory = "all", selectedIssueId, onIssuePress }, ref) => {
    const mapbox = MapboxModule;
    const mapboxReady = hasMapboxToken && mapbox !== null;
    const cameraRef = useRef<Mapbox.Camera>(null);
    const fallbackRef = useRef<HomeMapHandle>(null);

    useImperativeHandle(ref, () => ({
      recenter: () => {
        if (mapboxReady) {
          cameraRef.current?.setCamera({
            centerCoordinate: [center.longitude, center.latitude],
            zoomLevel: CITY_ZOOM_LEVEL,
            animationDuration: 500,
          });
        } else {
          fallbackRef.current?.recenter();
        }
      },
      resetBearing: () => {
        if (mapboxReady) {
          cameraRef.current?.setCamera({ heading: 0, animationDuration: 300 });
        } else {
          fallbackRef.current?.resetBearing();
        }
      },
      zoomIn: () => {
        if (!mapboxReady) {
          fallbackRef.current?.zoomIn?.();
        }
      },
      zoomOut: () => {
        if (!mapboxReady) {
          fallbackRef.current?.zoomOut?.();
        }
      },
    }));

    if (!mapboxReady || !mapbox) {
      return (
        <HomeMapFallback
          ref={fallbackRef}
          center={center}
          is3D={is3D}
          selectedCategory={selectedCategory}
          selectedIssueId={selectedIssueId}
          onIssuePress={onIssuePress}
        />
      );
    }

    const filteredIssues = mockIssues.filter((issue) => {
      if (selectedCategory === "all") return true;
      if (selectedCategory === "quests") return issue.kind === "quest";
      if (selectedCategory === "hazards")
        return ["pothole", "traffic", "water-leak"].includes(issue.id);
      if (selectedCategory === "waste") return issue.id === "garbage" || issue.id === "clean-park";
      return true;
    });

    return (
      <mapbox.MapView
        style={StyleSheet.absoluteFill}
        styleURL={env.mapboxStyleUrl}
        scaleBarEnabled={false}
        compassEnabled={false}
        attributionEnabled={false}
        logoEnabled={false}
        rotateEnabled
        pitchEnabled
        scrollEnabled
        zoomEnabled
      >
        <mapbox.Camera
          ref={cameraRef}
          centerCoordinate={[center.longitude, center.latitude]}
          zoomLevel={CITY_ZOOM_LEVEL}
          pitch={is3D ? TILT_PITCH : 0}
          animationMode="flyTo"
          animationDuration={700}
        />

        {filteredIssues.map((issue) => (
          <mapbox.MarkerView
            key={issue.id}
            id={issue.id}
            coordinate={[center.longitude + issue.offset.lng, center.latitude + issue.offset.lat]}
            anchor={{ x: 0.5, y: 1 }}
          >
            <IssueMarker issue={issue} onPress={() => onIssuePress?.(issue.id)} />
          </mapbox.MarkerView>
        ))}

        <mapbox.MarkerView
          id="player"
          coordinate={[center.longitude, center.latitude]}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <PlayerMarker />
        </mapbox.MarkerView>
      </mapbox.MapView>
    );
  }
);

HomeMapView.displayName = "HomeMapView";
