import { forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet } from "react-native";
import Mapbox from "@rnmapbox/maps";

import { IssueMarker } from "@/components/IssueMarker";
import { PlayerMarker } from "@/components/PlayerMarker";
import { mockIssues } from "@/features/map/mockIssues";
import { env } from "@/lib/env";
import type { Coordinate } from "@/services/location/useUserLocation";

const CITY_ZOOM_LEVEL = 16.5;
const TILT_PITCH = 60;

type HomeMapViewProps = {
  center: Coordinate;
  is3D: boolean;
  onIssuePress?: (issueId: string) => void;
};

export type HomeMapHandle = {
  recenter: () => void;
  resetBearing: () => void;
};

/**
 * The live Mapbox surface: renders once a token is configured. Markers use
 * MarkerView (not PointAnnotation) because they need to stay interactive
 * (issue press) and keep animating (the player's pulsing ring) instead of
 * being flattened to a static bitmap.
 */
export const HomeMapView = forwardRef<HomeMapHandle, HomeMapViewProps>(
  ({ center, is3D, onIssuePress }, ref) => {
    const cameraRef = useRef<Mapbox.Camera>(null);

    useImperativeHandle(ref, () => ({
      recenter: () => {
        cameraRef.current?.setCamera({
          centerCoordinate: [center.longitude, center.latitude],
          zoomLevel: CITY_ZOOM_LEVEL,
          animationDuration: 500,
        });
      },
      resetBearing: () => {
        cameraRef.current?.setCamera({ heading: 0, animationDuration: 300 });
      },
    }));

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

        {mockIssues.map((issue) => (
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
