import type { CmsTheme } from "@spree/sdk";
import { ThemeSectionGroupRenderer } from "@/components/theme/ThemeSectionGroupRenderer";
import { chromeThemeContext } from "@/lib/theme/context";
import { themeGroupHasContent } from "@/lib/theme/resolver";
import type { ThemeRenderContext } from "@/lib/theme/types";

export function themeChromeActive(theme: CmsTheme | null): {
  header: boolean;
  footer: boolean;
  hasAnnouncementBar: boolean;
} {
  if (!theme?.section_groups) {
    return { header: false, footer: false, hasAnnouncementBar: false };
  }
  const headerGroup = theme.section_groups.header;
  const hasAnnouncementBar = Boolean(
    headerGroup?.sections &&
      Object.values(headerGroup.sections).some(
        (section) =>
          section &&
          !section.disabled &&
          section.type === "announcement_bar" &&
          (Boolean(String(section.settings?.text ?? "").trim()) ||
            (Array.isArray(section.block_order) &&
              section.block_order.length > 0)),
      ),
  );
  return {
    header: themeGroupHasContent(headerGroup),
    footer: themeGroupHasContent(theme.section_groups.footer),
    hasAnnouncementBar,
  };
}

export async function StorefrontThemeHeader({
  theme,
  context,
}: {
  theme: CmsTheme;
  context: ThemeRenderContext;
}) {
  const header = theme.section_groups?.header;
  if (!header || !themeGroupHasContent(header)) return null;
  return (
    <ThemeSectionGroupRenderer
      data={header}
      context={context}
      theme={theme}
      groupKey="header"
    />
  );
}

export async function StorefrontThemeFooter({
  theme,
  context,
}: {
  theme: CmsTheme;
  context: ThemeRenderContext;
}) {
  const footer = theme.section_groups?.footer;
  if (!footer || !themeGroupHasContent(footer)) return null;
  return (
    <ThemeSectionGroupRenderer
      data={footer}
      context={context}
      theme={theme}
      groupKey="footer"
    />
  );
}

export function buildChromeContext(params: {
  basePath: string;
  locale: string;
  country: string;
}): ThemeRenderContext {
  return chromeThemeContext(params);
}
