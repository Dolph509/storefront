import type { ThemeTemplateDocument, ThemeTemplatePayload } from "@spree/sdk";
import type { HomePersonalizationComposition } from "@/lib/data/storefront-personalization-types";
import type { HomeThemeContext } from "@/lib/theme/types";

/** Apply server composition to theme template + home render context (no second renderer). */
export function applyHomePersonalization({
  template,
  composition,
}: {
  template: ThemeTemplatePayload;
  composition: HomePersonalizationComposition | null;
}): {
  template: ThemeTemplatePayload;
  contextExtras: Pick<
    HomeThemeContext,
    "homeComposition" | "compositionVersion"
  >;
} {
  if (
    !composition ||
    composition.composition_version === "static" ||
    !composition.section_order?.length
  ) {
    return {
      template,
      contextExtras: {},
    };
  }

  const data: ThemeTemplateDocument = {
    ...(template.data || { sections: {}, order: [] }),
    order: composition.section_order,
    sections: { ...(template.data?.sections || {}) },
  };

  for (const [sectionId, fill] of Object.entries(composition.sections || {})) {
    const section = data.sections?.[sectionId];
    if (!section) continue;

    const settings = { ...(section.settings || {}) };
    if (fill.hero_variant) {
      settings.hero_variant = fill.hero_variant;
    }
    if (fill.product_ids?.length) {
      settings.source = "manual";
      settings.manual_product_ids = fill.product_ids;
      settings.recommendation_source =
        settings.recommendation_source || "for_you";
    }
    if (fill.reason_codes?.length) {
      settings.personalization_reason_codes = fill.reason_codes;
    }
    data.sections[sectionId] = { ...section, settings };
  }

  return {
    template: { ...template, data },
    contextExtras: {
      homeComposition: composition,
      compositionVersion: composition.composition_version,
    },
  };
}
