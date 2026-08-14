/**
 * RNMapbox is a native module and cannot be initialized in a web bundle.
 * Android and iOS resolve mapbox.ts; web resolves this no-op module.
 */
export function configureMapbox() {}

export { hasMapboxToken } from "@/lib/env";
