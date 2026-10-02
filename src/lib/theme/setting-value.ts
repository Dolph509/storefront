export function themeSettingEnabled(
  value: unknown,
  defaultValue = false,
): boolean {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return defaultValue;
}

export function themeSettingColor(
  value: unknown,
  paletteVariable: string,
): string | undefined {
  if (typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value))
    return value;
  if (value === "palette") return `var(${paletteVariable})`;
  return undefined;
}
