/**
 * Google Places API (New) — Text Search, called server-side only.
 * When GOOGLE_PLACES_API_KEY is missing we return believable mock results so
 * the "add a joint" flow is fully demoable before the key is wired up.
 */

export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  area: string;
  lat: number | null;
  lng: number | null;
  /** Google photo resource name, or null. Fetched via /api/places/photo. */
  photoName: string | null;
  mock?: boolean;
}

export const PLACES_CONFIGURED = Boolean(process.env.GOOGLE_PLACES_API_KEY);

interface GooglePlace {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  photos?: { name: string }[];
  addressComponents?: {
    longText: string;
    shortText: string;
    types: string[];
  }[];
}

function deriveArea(p: GooglePlace): string {
  const comps = p.addressComponents ?? [];
  const pick = (type: string) =>
    comps.find((c) => c.types.includes(type))?.longText;
  return (
    pick("sublocality_level_1") ||
    pick("sublocality") ||
    pick("neighborhood") ||
    pick("locality") ||
    ""
  );
}

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const q = query.trim();
  if (!q) return [];

  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return mockSearch(q);

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.photos,places.addressComponents",
    },
    body: JSON.stringify({
      textQuery: q,
      includedType: "restaurant",
      maxResultCount: 8,
    }),
    // Places responses shouldn't be cached across curators.
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Places search failed (${res.status}): ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as { places?: GooglePlace[] };
  return (data.places ?? []).map((p) => ({
    placeId: p.id,
    name: p.displayName?.text ?? "Unknown",
    address: p.formattedAddress ?? "",
    area: deriveArea(p),
    lat: p.location?.latitude ?? null,
    lng: p.location?.longitude ?? null,
    photoName: p.photos?.[0]?.name ?? null,
  }));
}

/** Fetch a Places photo as raw bytes (proxied so the API key stays server-side). */
export async function fetchPlacePhoto(
  photoName: string,
  maxWidthPx = 800
): Promise<Response | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidthPx}&key=${key}`;
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) return null;
  return res;
}

// ---- Mock fallback ----
const MOCK_AREAS = ["De Pijp", "Oost", "Centrum", "West", "Noord", "Zuid"];
const MOCK_SUFFIX = ["Burgers", "& Grill", "Smash Bar", "Diner", "Joint"];

function mockSearch(q: string): PlaceResult[] {
  const base = q.charAt(0).toUpperCase() + q.slice(1);
  return MOCK_SUFFIX.map((suffix, i) => ({
    placeId: `mock-${q.toLowerCase().replace(/\s+/g, "-")}-${i}`,
    name: `${base} ${suffix}`,
    address: `${10 + i * 7} Example Street, ${MOCK_AREAS[i % MOCK_AREAS.length]}`,
    area: MOCK_AREAS[i % MOCK_AREAS.length],
    lat: 52.36 + i * 0.01,
    lng: 4.89 + i * 0.01,
    photoName: null,
    mock: true,
  }));
}
