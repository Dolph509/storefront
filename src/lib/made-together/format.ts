/** Mock-aligned maker list: `Artist A & Artist B`. */
export function formatMakerNames(names: string[]): string {
  return names.filter(Boolean).join(" & ");
}

export function makerAvatarMonogram(name: string): string {
  const trailingNumber = name.match(/(\d+)\s*$/)?.[1];
  if (trailingNumber) return trailingNumber;

  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
  const trimmed = name.trim();
  return trimmed.slice(0, 2).toUpperCase() || "?";
}

export const MAKER_AVATAR_FALLBACK_STYLES = [
  { background: "#e3ede7", foreground: "#1b4332" },
  { background: "#f2eae0", foreground: "#5c4328" },
  { background: "#efe2dc", foreground: "#6b3b2c" },
  { background: "#e6e9ec", foreground: "#2c3a47" },
] as const;
