/** Normalize free-text places into a "City, ST" style label when possible. */
export function formatCityStateLabel(
  value: string | null | undefined,
): string | null {
  if (!value?.trim()) return null;
  const cleaned = value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ");
  const parts = cleaned
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    const city = parts[0];
    const region = parts[1]
      .replace(/\bUnited States\b/i, "")
      .replace(/\bUSA\b/i, "")
      .trim();
    if (city && region) return `${city}, ${region}`;
    return city || cleaned;
  }
  return cleaned;
}

export function buildCityStateLabel(
  city: string | null | undefined,
  region: string | null | undefined,
): string | null {
  const cleanCity = city?.trim() || null;
  const cleanRegion = region?.trim() || null;
  if (cleanCity && cleanRegion) return `${cleanCity}, ${cleanRegion}`;
  return cleanCity || cleanRegion;
}
