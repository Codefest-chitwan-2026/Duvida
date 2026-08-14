const DEFAULT_MAPBOX_STYLE_URL = "mapbox://styles/team-everest-8848/cmsrupkhw018i01sf9u394dcl";
const DEFAULT_ADVISOR_API_URL = "http://127.0.0.1:8000";

export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
  mapboxAccessToken: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "",
  mapboxStyleUrl: process.env.EXPO_PUBLIC_MAPBOX_STYLE_URL ?? DEFAULT_MAPBOX_STYLE_URL,
  advisorApiUrl: (process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_ADVISOR_API_URL).replace(
    /\/+$/,
    ""
  ),
} as const;

export const hasMapboxToken = env.mapboxAccessToken.length > 0;
