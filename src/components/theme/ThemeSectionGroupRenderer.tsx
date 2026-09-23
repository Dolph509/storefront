import type { CmsTheme, ThemeTemplateDocument } from "@spree/sdk";
import { ThemeTemplateRenderer } from "@/components/theme/ThemeTemplateRenderer";
import type { ThemeRenderContext } from "@/lib/theme/types";

export async function ThemeSectionGroupRenderer({
  data,
  context,
  theme,
  groupKey,
}: {
  data: ThemeTemplateDocument;
  context: ThemeRenderContext;
  theme?: CmsTheme | null;
  groupKey: "header" | "footer";
}) {
  if (!data?.order?.length) return null;

  return (
    <div data-theme-section-group={groupKey}>
      <ThemeTemplateRenderer data={data} context={context} theme={theme} />
    </div>
  );
}
