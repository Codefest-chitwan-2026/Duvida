import { forwardRef, useImperativeHandle, useRef } from "react";

import { HomeMapFallback, type HomeMapHandle } from "@/features/map/HomeMapFallback";
import type { Coordinate } from "@/services/location/useUserLocation";

type HomeMapViewProps = {
  center: Coordinate;
  is3D: boolean;
  selectedCategory?: string;
  selectedIssueId?: string | null;
  onIssuePress?: (issueId: string) => void;
};

export type { HomeMapHandle };

/** Web fallback: @rnmapbox/maps requires Android or iOS native code. Renders the interactive Simple Map */
export const HomeMapView = forwardRef<HomeMapHandle, HomeMapViewProps>(
  ({ center, is3D, selectedCategory, selectedIssueId, onIssuePress }, ref) => {
    const fallbackRef = useRef<HomeMapHandle>(null);

    useImperativeHandle(ref, () => ({
      recenter: () => fallbackRef.current?.recenter(),
      resetBearing: () => fallbackRef.current?.resetBearing(),
      zoomIn: () => fallbackRef.current?.zoomIn?.(),
      zoomOut: () => fallbackRef.current?.zoomOut?.(),
    }));

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
);

HomeMapView.displayName = "HomeMapView";
