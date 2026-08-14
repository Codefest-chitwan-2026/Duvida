import { forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet } from "react-native";
import Mapbox from "@rnmapbox/maps";

import { IssueMarker } from "@/components/IssueMarker";
import { PlayerMarker } from "@/components/PlayerMarker";
import { mockIssues } from "@/features/map/mockIssues";
import { HomeMapFallback, type HomeMapHandle } from "@/features/map/HomeMapFallback";
import { env, hasMapboxToken } from "@/lib/env";
import type { Coordinate } from "@/services/location/useUserLocation";

const CITY_ZOOM_LEVEL = 16.5;
const TILT_PITCH = 60;

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
    const cameraRef = useRef<Mapbox.Camera>(null);
    const fallbackRef = useRef<HomeMapHandle>(null);

    useImperativeHandle(ref, () => ({
      recenter: () => {
        if (hasMapboxToken) {
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
        if (hasMapboxToken) {
          cameraRef.current?.setCamera({ heading: 0, animationDuration: 300 });
        } else {
          fallbackRef.current?.resetBearing();
        }
      },
      zoomIn: () => {
        if (!hasMapboxToken) {
          fallbackRef.current?.zoomIn?.();
        }
      },
      zoomOut: () => {
        if (!hasMapboxToken) {
          fallbackRef.current?.zoomOut?.();
        }
      },
    }));

    if (!hasMapboxToken) {
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
      <Mapbox.MapView
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
        <Mapbox.Camera
          ref={cameraRef}
          centerCoordinate={[center.longitude, center.latitude]}
          zoomLevel={CITY_ZOOM_LEVEL}
          pitch={is3D ? TILT_PITCH : 0}
          animationMode="flyTo"
          animationDuration={700}
        />

        {filteredIssues.map((issue) => (
          <Mapbox.MarkerView
            key={issue.id}
            id={issue.id}
            coordinate={[center.longitude + issue.offset.lng, center.latitude + issue.offset.lat]}
            anchor={{ x: 0.5, y: 1 }}
          >
            <IssueMarker issue={issue} onPress={() => onIssuePress?.(issue.id)} />
          </Mapbox.MarkerView>
        ))}

        <Mapbox.MarkerView
          id="player"
          coordinate={[center.longitude, center.latitude]}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <PlayerMarker />
        </Mapbox.MarkerView>
      </Mapbox.MapView>
    );
  }
);

HomeMapView.displayName = "HomeMapView";
