import type Mapbox from "@rnmapbox/maps";

import { env, hasMapboxToken } from "@/lib/env";

/**
 * @rnmapbox/maps needs a token before the native module renders anything.
 * The token arrives later via EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN; until then
 * screens fall back to a styled placeholder instead of a blank native view.
 *
 * The require is guarded because @rnmapbox/maps registers a native module as
 * soon as it's imported. That native code only exists in a custom dev
 * client / release build produced via `expo prebuild` + `expo run:ios` /
 * `expo run:android` with the config plugin applied. In Expo Go, or a dev
 * client built before the plugin was added, requiring it throws immediately
 * — which would otherwise crash startup, since this runs from the root
 * layout on mount before any auth/login screen is usable.
 */
export function configureMapbox() {
  if (!hasMapboxToken) return;

  try {
    const mapboxModule: typeof Mapbox = require("@rnmapbox/maps").default;
    mapboxModule.setAccessToken(env.mapboxAccessToken);
  } catch (error) {
    console.warn("[mapbox] native module unavailable, skipping setAccessToken", error);
  }
}

export { hasMapboxToken };
