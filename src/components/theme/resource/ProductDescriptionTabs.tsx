import type { Product } from "@spree/sdk";
import { sanitizeThemeRichText } from "@/lib/theme/sanitize-rich-text";
import { ProductDescriptionTabsInteractive } from "./ProductDescriptionTabsInteractive";

export function ProductDescriptionTabs({
  product,
  settings,
}: {
  product: Product;
  settings: Record<string, unknown>;
}) {
  const description =
    product.description_html || escapeHtml(product.description || "");
  const categories =
    product.categories?.map((category) => category.name).join(", ") || "";
  const sku = product.default_variant?.sku || "";
  return (
    <ProductDescriptionTabsInteractive
      descriptionLabel={String(settings.description_label || "Description")}
      detailsLabel={String(settings.details_label || "Details")}
      reviewsLabel={String(settings.reviews_label || "Reviews")}
      descriptionHtml={sanitizeThemeRichText(description)}
      details={[
        sku ? `SKU: ${sku}` : "",
        categories ? `Category: ${categories}` : "",
      ].filter(Boolean)}
      reviewCount={product.reviews_count || 0}
    />
  );
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ] || character,
  );
}
