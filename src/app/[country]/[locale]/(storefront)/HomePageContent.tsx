import { connection } from "next/server";
import { NativeMarketplaceHome } from "@/components/home/NativeMarketplaceHome";
import { ThemePageRenderer } from "@/components/theme/ThemePageRenderer";
import { resolveCurrency } from "@/lib/data/markets";
import { getMerchandisingPlacements } from "@/lib/data/merchandising";
import { getHomePersonalizationComposition } from "@/lib/data/storefront-personalization";
import { applyHomePersonalization } from "@/lib/theme/apply-home-composition";
import { themeTemplateHomeEnabled } from "@/lib/theme/flags";
import { usesNativeHome } from "@/lib/theme/native-home";
import { getActiveTheme, getResolvedTemplate } from "@/lib/theme/resolver";
import type { HomeMerchandisingContext } from "@/lib/theme/types";

async function loadHomeMerchandising(country: string) {
  const [currency, placements] = await Promise.all([
    resolveCurrency(country),
    getMerchandisingPlacements({ surface: "homepage" }),
  ]);
  return { currency, placements };
}

export async function HomePageContent({
  country,
  locale,
  basePath,
  previewPersona,
}: {
  country: string;
  locale: string;
  basePath: string;
  previewPersona?: string;
}) {
  await connection();

  const useTemplate = themeTemplateHomeEnabled();
  let merchandising: Promise<HomeMerchandisingContext> | undefined;
  const homeMerchandising = () =>
    (merchandising ??= loadHomeMerchandising(country));
  const [composition, theme, template] = await Promise.all([
    useTemplate ? getHomePersonalizationComposition(previewPersona) : null,
    useTemplate ? getActiveTheme() : null,
    useTemplate
      ? getResolvedTemplate({ templateType: "home", templateKey: "default" })
      : null,
  ]);
  if (theme && template?.data && !usesNativeHome(template.data)) {
    const personalized = applyHomePersonalization({
      template,
      composition,
    });
    return (
      <div
        className="bg-marketplace-background"
        data-composition-version={personalized.contextExtras.compositionVersion}
      >
        <ThemePageRenderer
          theme={theme}
          template={personalized.template}
          homeMerchandising={homeMerchandising}
          context={{
            kind: "home",
            basePath,
            locale,
            country,
            ...personalized.contextExtras,
          }}
        />
      </div>
    );
  }

  return (
    <NativeMarketplaceHome
      country={country}
      locale={locale}
      basePath={basePath}
    />
  );
}
