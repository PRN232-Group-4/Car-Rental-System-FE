export interface MapLocation {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  name?: string | null;
  placeId?: string | null;
}

export type MapTarget = MapLocation | string | null;

interface MapOptions {
  location?: MapTarget;
  origin?: MapTarget;
  destination?: MapTarget;
}

/** Prefer API coordinates; never substitute a made-up point for missing data. */
export function mapLocationQuery(location?: MapTarget): string | null {
  if (typeof location === "string") return location.trim() || null;
  if (!location) return null;
  if (location.placeId?.trim()) return `place_id:${location.placeId.trim()}`;
  const { latitude, longitude } = location;
  if (
    typeof latitude === "number" && Number.isFinite(latitude) && Math.abs(latitude) <= 90 &&
    typeof longitude === "number" && Number.isFinite(longitude) && Math.abs(longitude) <= 180
  ) return `${latitude},${longitude}`;
  return location.address?.trim() || null;
}

export function buildGoogleMapsEmbedUrl({ apiKey, location, origin, destination }: MapOptions & { apiKey?: string }): string | null {
  if (!apiKey?.trim()) return null;
  const start = mapLocationQuery(origin);
  const end = mapLocationQuery(destination) ?? mapLocationQuery(location);
  if (!end) return null;
  const url = new URL(`https://www.google.com/maps/embed/v1/${start ? "directions" : "place"}`);
  url.searchParams.set("key", apiKey.trim());
  url.searchParams.set("language", "vi");
  url.searchParams.set("region", "VN");
  if (start) {
    url.searchParams.set("origin", start);
    url.searchParams.set("destination", end);
    url.searchParams.set("mode", "driving");
    url.searchParams.set("units", "metric");
  } else {
    url.searchParams.set("q", end);
  }
  return url.toString();
}

export function buildGoogleMapsDirectionsUrl({ location, origin, destination }: MapOptions): string | null {
  const end = mapLocationQuery(destination) ?? mapLocationQuery(location);
  if (!end) return null;
  const start = mapLocationQuery(origin);
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("destination", end);
  url.searchParams.set("travelmode", "driving");
  if (start) url.searchParams.set("origin", start);
  // Maps URLs uses separate Place ID parameters, unlike Embed's place_id prefix.
  for (const parameter of ["origin", "destination"]) {
    const query = url.searchParams.get(parameter);
    if (query?.startsWith("place_id:")) {
      const target = parameter === "origin" ? origin : destination ?? location;
      const label = typeof target === "object" && target ? target.address?.trim() || target.name?.trim() : null;
      url.searchParams.set(parameter, label || query.slice("place_id:".length));
      url.searchParams.set(`${parameter}_place_id`, query.slice("place_id:".length));
    }
  }
  return url.toString();
}
