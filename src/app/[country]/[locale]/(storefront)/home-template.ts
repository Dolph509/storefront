import type { ThemeTemplateDocument } from "@spree/sdk";
import { getEditorialStockImage } from "@/lib/marketplace-stock-images";

export function defaultHomeTemplate(): ThemeTemplateDocument {
  return {
    order: ["default-marketplace-hero"],
    sections: {
      "default-marketplace-hero": {
        type: "hero",
        settings: {
          hero_variant: "split",
          heading: "Find gifts made to mean more.",
          button_text: "Shop all",
          button_link: "/products",
          media_1_image_url: getEditorialStockImage("makers"),
          media_2_image_url: getEditorialStockImage("gifts"),
          subheading: "Discover independent creators",
          promo_link: "/products",
          split_background_color: "#f4a900",
          height: "small",
          padding_top: 24,
          padding_bottom: 24,
          gap: 16,
        },
      },
    },
  };
}
