import type { CmsTheme } from "@spree/sdk";

export function themeInlineStyle(theme?: CmsTheme | null): React.CSSProperties {
  const colorVariables: Record<string, string> = {
    brand: "--marketplace-brand",
    background: "--marketplace-background",
    surface: "--marketplace-surface",
    surface_warm: "--marketplace-surface-warm",
    foreground: "--marketplace-foreground",
    muted: "--marketplace-muted-foreground",
    border: "--marketplace-border",
    accent: "--marketplace-accent",
    sale: "--marketplace-sale",
    success: "--marketplace-success",
    danger: "--marketplace-danger",
  };
  const style: Record<string, string> = Object.fromEntries(
    Object.entries(theme?.settings.colors || {})
      .filter(
        ([key, value]) =>
          colorVariables[key] && /^#[0-9a-fA-F]{6}$/.test(String(value)),
      )
      .map(([key, value]) => [colorVariables[key], String(value)]),
  );
  const radii: Record<string, string> = {
    none: "0",
    small: "0.25rem",
    medium: "0.5rem",
    large: "0.75rem",
  };
  for (const key of ["radius_sm", "radius_md", "radius_lg"]) {
    const value = theme?.settings.shape?.[key];
    if (value && radii[value])
      style[`--marketplace-${key.replace("_", "-")}`] = radii[value];
  }
  const spacing: Record<string, string> = {
    compact: "2rem",
    comfortable: "3rem",
    spacious: "5rem",
  };
  style["--cms-section-spacing"] =
    spacing[theme?.settings.layout?.section_spacing || "comfortable"] ||
    spacing.comfortable;
  if (theme?.settings.layout?.page_width === "standard") {
    style.maxWidth = "1200px";
  } else if (theme) {
    style.maxWidth = "1440px";
  }
  return style;
}
