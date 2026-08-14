import Mapbox from "@rnmapbox/maps";

import { env, hasMapboxToken } from "@/lib/env";

/**
 * @rnmapbox/maps needs a token before the native module renders anything.
 * The token arrives later via EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN; until then
 * screens fall back to a styled placeholder instead of a blank native view.
 */
export function configureMapbox() {
  if (hasMapboxToken) {
    Mapbox.setAccessToken(env.mapboxAccessToken);
  }
}

export { hasMapboxToken };
