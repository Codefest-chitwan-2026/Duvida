import { Platform } from "react-native";
import Constants, { AppOwnership } from "expo-constants";

import { env, hasMapboxToken } from "@/lib/env";

type MapboxModule = typeof import("@rnmapbox/maps").default;

let cachedMapbox: MapboxModule | null | undefined;

/**
 * Expo Go does not bundle @rnmapbox/maps native code. Requiring the package in
 * that environment throws before Expo Router can evaluate any route exports.
 */
export function getMapbox(): MapboxModule | null {
  if (Platform.OS === "web" || Constants.appOwnership === AppOwnership.Expo) {
    return null;
  }

  if (cachedMapbox !== undefined) {
    return cachedMapbox;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedMapbox = require("@rnmapbox/maps").default as MapboxModule;
  } catch {
    cachedMapbox = null;
  }

  return cachedMapbox;
}

/**
 * @rnmapbox/maps needs a token before the native module renders anything.
 * The token arrives later via EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN; until then
 * screens fall back to a styled placeholder instead of a blank native view.
 */
export function configureMapbox() {
  const mapbox = getMapbox();
  if (hasMapboxToken && mapbox) {
    mapbox.setAccessToken(env.mapboxAccessToken);
  }
}

export { hasMapboxToken };
