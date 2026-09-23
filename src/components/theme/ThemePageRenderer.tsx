import type { CmsTheme, ThemeTemplatePayload } from "@spree/sdk";
import { ThemeSectionGroupRenderer } from "@/components/theme/ThemeSectionGroupRenderer";
import { ThemeTemplateRenderer } from "@/components/theme/ThemeTemplateRenderer";
import { themeInlineStyle } from "@/components/theme/theme-style";
import type { ThemeRenderContext } from "@/lib/theme/types";

export async function ThemePageRenderer({
  theme,
  template,
  context,
  chrome = "template-only",
}: {
  theme: CmsTheme;
  template: ThemeTemplatePayload;
  context: ThemeRenderContext;
  /** Layout renders section groups when `THEME_SECTION_GROUPS_ENABLED`; use `full` for preview-only pages. */
  chrome?: "template-only" | "full";
}) {
  const style = themeInlineStyle(theme);
  const header = theme.section_groups?.header;
  const footer = theme.section_groups?.footer;
  const includeChrome = chrome === "full";

  return (
    <div data-theme-id={theme.id} style={style} className="mx-auto w-full">
      {includeChrome && header ? (
        <ThemeSectionGroupRenderer
          data={header}
          context={context}
          theme={theme}
          groupKey="header"
        />
      ) : null}
      <div data-theme-template={template.full_key}>
        <ThemeTemplateRenderer
          data={template.data}
          context={context}
          theme={theme}
        />
      </div>
      {includeChrome && footer ? (
        <ThemeSectionGroupRenderer
          data={footer}
          context={context}
          theme={theme}
          groupKey="footer"
        />
      ) : null}
    </div>
  );
}
