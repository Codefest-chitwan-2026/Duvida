import { useEffect, useState } from "react";
import * as Location from "expo-location";

import { DEMO_CENTER } from "@/features/map/mockIssues";

export type Coordinate = { latitude: number; longitude: number };

type UserLocationState = {
  coordinate: Coordinate;
  isDemo: boolean;
  loading: boolean;
};

/**
 * Resolves the citizen's live GPS position for the map camera and player
 * marker. Falls back to a demo coordinate when permission is denied or
 * unavailable so the map/UI can always render something.
 */
export function useUserLocation(): UserLocationState {
  const [state, setState] = useState<UserLocationState>({
    coordinate: DEMO_CENTER,
    isDemo: true,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (!cancelled) {
        setState({
          coordinate: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          isDemo: false,
          loading: false,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
