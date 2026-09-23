import type { CmsTheme } from "@spree/sdk";
import {
  ThemeAnnouncementSection,
  ThemeFooterSection,
  ThemeHeaderSection,
} from "@/components/theme/chrome/ThemeChromeSections";
import { ProductThemeBody } from "@/components/theme/resource/ProductThemeBody";
import type {
  ThemeRenderContext,
  ThemeSectionInstance,
} from "@/lib/theme/types";

export async function renderResourceSection(
  section: ThemeSectionInstance,
  context: ThemeRenderContext,
  _theme?: CmsTheme | null,
): Promise<React.ReactNode | null> {
  switch (section.section_type) {
    case "announcement_bar":
      return <ThemeAnnouncementSection section={section} context={context} />;
    case "theme_header":
      return <ThemeHeaderSection section={section} context={context} />;
    case "theme_footer":
      return <ThemeFooterSection section={section} context={context} />;
    case "product_main":
      return context.kind === "product" ? (
        <ProductThemeBody context={context} />
      ) : null;
    default:
      return null;
  }
}
