import type { CmsTheme, ThemeTemplateDocument } from "@spree/sdk";
import { renderMarketplaceSection } from "@/components/theme/render-marketplace-sections";
import { renderResourceSection } from "@/components/theme/render-resource-sections";
import { ThemeBlockRenderer } from "@/components/theme/ThemeBlockRenderer";
import type {
  ThemeRenderContext,
  ThemeSectionInstance,
} from "@/lib/theme/types";

function toWire(section: ThemeSectionInstance) {
  return {
    id: section.section_id,
    type: section.section_type,
    disabled: section.disabled,
    settings: section.settings,
  };
}

export async function ThemeTemplateRenderer({
  data,
  context,
  theme,
}: {
  data: ThemeTemplateDocument;
  context: ThemeRenderContext;
  theme?: CmsTheme | null;
}) {
  const sections = data.sections || {};
  const order = data.order || [];

  const rendered = await Promise.all(
    order.map(async (sectionId) => {
      const raw = sections[sectionId];
      if (!raw || raw.disabled) return null;

      const section: ThemeSectionInstance = {
        section_id: sectionId,
        section_type: raw.type,
        settings: raw.settings || {},
        blocks: (raw.blocks || {}) as ThemeSectionInstance["blocks"],
        block_order: raw.block_order || [],
        disabled: raw.disabled,
      };

      try {
        const resource = await renderResourceSection(section, context, theme);
        if (resource)
          return (
            <div key={sectionId} data-theme-section-id={sectionId}>
              {resource}
            </div>
          );

        const blocks = section.block_order
          .map((blockId) => section.blocks[blockId])
          .filter(Boolean)
          .map((block, index) => (
            <ThemeBlockRenderer
              key={`${sectionId}-${index}`}
              block={block}
              context={context}
            />
          ));

        const body = await renderMarketplaceSection(toWire(section), context);
        if (!body && blocks.length === 0) return null;

        return (
          <div
            key={sectionId}
            data-theme-section-id={sectionId}
            data-theme-section-type={section.section_type}
          >
            {body}
            {blocks.length > 0 ? (
              <div className="space-y-3">{blocks}</div>
            ) : null}
          </div>
        );
      } catch (error) {
        console.error(`[theme] section ${sectionId} failed`, error);
        return null;
      }
    }),
  );

  return <>{rendered}</>;
}
