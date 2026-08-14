const DEFAULT_MAPBOX_STYLE_URL = "mapbox://styles/team-everest-8848/cmsrupkhw018i01sf9u394dcl";

export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
  mapboxAccessToken: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "",
  mapboxStyleUrl: process.env.EXPO_PUBLIC_MAPBOX_STYLE_URL ?? DEFAULT_MAPBOX_STYLE_URL,
} as const;

export const hasMapboxToken = env.mapboxAccessToken.length > 0;
