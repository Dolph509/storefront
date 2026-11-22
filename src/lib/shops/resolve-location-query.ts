import {
  buildCityStateLabel,
  formatCityStateLabel,
} from "@/lib/shops/location-label";

type ZippopotamPlace = {
  "place name"?: string;
  state?: string;
  "state abbreviation"?: string;
};

type ZippopotamResponse = {
  places?: ZippopotamPlace[];
};

const US_ZIP = /^\d{5}(?:-\d{4})?$/;
const CA_POSTAL = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/;

/**
 * Detect a US or Canadian postal code the buyer can type into local shop search.
 */
export function looksLikePostalCode(value: string): boolean {
  const trimmed = value.trim();
  return US_ZIP.test(trimmed) || CA_POSTAL.test(trimmed.replace(/\s+/g, ""));
}

function postalLookupPath(value: string): string | null {
  const trimmed = value.trim();
  if (US_ZIP.test(trimmed)) {
    return `us/${trimmed.slice(0, 5)}`;
  }
  const compact = trimmed.replace(/\s+/g, "").toUpperCase();
  if (CA_POSTAL.test(compact) || CA_POSTAL.test(trimmed)) {
    return `ca/${compact}`;
  }
  return null;
}

/**
 * Turn a zip / postal code into a "City, ST" label for the buyer.
 * Returns null when the code is unknown or the request fails.
 */
export async function resolvePostalCodeToCityState(
  value: string,
): Promise<string | null> {
  const path = postalLookupPath(value);
  if (!path) return null;

  try {
    const response = await fetch(`https://api.zippopotam.us/${path}`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as ZippopotamResponse;
    const place = payload.places?.[0];
    if (!place) return null;
    const city = place["place name"]?.trim() || null;
    const region =
      place["state abbreviation"]?.trim() || place.state?.trim() || null;
    return buildCityStateLabel(city, region);
  } catch {
    return null;
  }
}

/**
 * Normalize a free-text location query. Zip codes become city + state.
 */
export async function resolveLocationQuery(
  value: string,
): Promise<{ label: string; resolvedFromPostal: boolean } | null> {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (looksLikePostalCode(trimmed)) {
    const cityState = await resolvePostalCodeToCityState(trimmed);
    if (!cityState) return null;
    return { label: cityState, resolvedFromPostal: true };
  }

  return {
    label: formatCityStateLabel(trimmed) || trimmed,
    resolvedFromPostal: false,
  };
}
