import { forwardRef, useImperativeHandle } from "react";

import { HomeMapFallback } from "@/features/map/HomeMapFallback";
import type { Coordinate } from "@/services/location/useUserLocation";

type HomeMapViewProps = {
  center: Coordinate;
  is3D: boolean;
  onIssuePress?: (issueId: string) => void;
};

export type HomeMapHandle = {
  recenter: () => void;
  resetBearing: () => void;
};

/** Web fallback: @rnmapbox/maps requires Android or iOS native code. */
export const HomeMapView = forwardRef<HomeMapHandle, HomeMapViewProps>(
  ({ onIssuePress }, ref) => {
    useImperativeHandle(ref, () => ({
      recenter: () => {},
      resetBearing: () => {},
    }));

    return <HomeMapFallback onIssuePress={onIssuePress} />;
  }
);

HomeMapView.displayName = "HomeMapView";
