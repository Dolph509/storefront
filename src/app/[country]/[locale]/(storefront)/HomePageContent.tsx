import { MarketplaceHomeSections } from "@/components/home/MarketplaceHomeSections";
import { ThemePageRenderer } from "@/components/theme/ThemePageRenderer";
import { ThemeTemplateRenderer } from "@/components/theme/ThemeTemplateRenderer";
import { resolveCurrency } from "@/lib/data/markets";
import { getMerchandisingPlacements } from "@/lib/data/merchandising";
import { themeTemplateHomeEnabled } from "@/lib/theme/flags";
import {
  getActiveTheme,
  getResolvedTemplate,
  themeGroupHasContent,
} from "@/lib/theme/resolver";
import { defaultHomeTemplate } from "./home-template";

export async function HomePageContent({
  country,
  locale,
  basePath,
}: {
  country: string;
  locale: string;
  basePath: string;
}) {
  const [currency, placements] = await Promise.all([
    resolveCurrency(country),
    getMerchandisingPlacements({ surface: "homepage" }),
  ]);
  if (themeTemplateHomeEnabled()) {
    const [theme, template] = await Promise.all([
      getActiveTheme(),
      getResolvedTemplate({ templateType: "home", templateKey: "default" }),
    ]);
    const templateData = template?.data;
    if (theme && templateData && themeGroupHasContent(templateData)) {
      return (
        <div className="bg-marketplace-background">
          <ThemePageRenderer
            theme={theme}
            template={template}
            context={{
              kind: "home",
              basePath,
              locale,
              country,
              currency,
              placements,
            }}
          />
        </div>
      );
    }
  }

  return (
    <div className="bg-marketplace-background">
      <ThemeTemplateRenderer
        data={defaultHomeTemplate()}
        context={{ kind: "home", basePath, locale, country, currency }}
      />
      <MarketplaceHomeSections
        basePath={basePath}
        locale={locale}
        country={country}
        currency={currency}
        placements={placements}
      />
    </div>
  );
}
