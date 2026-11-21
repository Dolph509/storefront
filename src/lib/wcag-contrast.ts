function parseHexColor(
  value: string,
): { red: number; green: number; blue: number } | null {
  const match = /^#([0-9a-fA-F]{6})$/.exec(value.trim());
  if (!match) return null;
  const hex = match[1];
  return {
    red: Number.parseInt(hex.slice(0, 2), 16),
    green: Number.parseInt(hex.slice(2, 4), 16),
    blue: Number.parseInt(hex.slice(4, 6), 16),
  };
}

function channelLuminance(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(color: {
  red: number;
  green: number;
  blue: number;
}): number {
  return (
    0.2126 * channelLuminance(color.red) +
    0.7152 * channelLuminance(color.green) +
    0.0722 * channelLuminance(color.blue)
  );
}

export function contrastRatio(
  foreground: string,
  background: string,
): number | null {
  const text = parseHexColor(foreground);
  const surface = parseHexColor(background);
  if (!text || !surface) return null;
  const lighter = Math.max(relativeLuminance(text), relativeLuminance(surface));
  const darker = Math.min(relativeLuminance(text), relativeLuminance(surface));
  return (lighter + 0.05) / (darker + 0.05);
}

export function ensureMinimumContrast(
  foreground: string,
  background: string,
  minimumRatio = 4.5,
): string {
  const current = contrastRatio(foreground, background);
  if (current == null || current >= minimumRatio) return foreground;

  const candidates = ["#ffffff", "#f8fafc", "#111827", "#1f2937"];
  for (const candidate of candidates) {
    const ratio = contrastRatio(candidate, background);
    if (ratio != null && ratio >= minimumRatio) return candidate;
  }

  return "#ffffff";
}
