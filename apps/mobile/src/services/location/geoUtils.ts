import * as Location from "expo-location";

export const MAX_REPORT_RADIUS_METERS = 100;

/**
 * Calculates the great-circle distance between two GPS coordinates in meters
 * using the Haversine formula.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Resolves a human-readable address from latitude and longitude.
 */
export async function reverseGeocodeLocation(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results && results.length > 0) {
      const item = results[0];
      const street = item.street || item.name || "";
      const district = item.district || item.subregion || item.city || "";
      const city = item.city || item.region || "Kathmandu";
      const country = item.country || "Nepal";

      const parts = [street, district, city, country].filter(Boolean);
      if (parts.length > 0) {
        return parts.join(", ");
      }
    }
  } catch (err) {
    // Non-fatal, fallback to default coordinate label
  }

  return `Near Lat ${latitude.toFixed(4)}, Long ${longitude.toFixed(4)}, Kathmandu`;
}
