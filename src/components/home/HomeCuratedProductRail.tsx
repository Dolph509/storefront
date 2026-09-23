import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ProductCarousel } from "@/components/products/ProductCarousel";
import { PRODUCT_CARD_FIELDS } from "@/lib/data/cached";
import { getProducts } from "@/lib/data/products";
import { getNewArrivalProducts } from "@/lib/data/recommendations";

interface HomeCuratedProductRailProps {
  basePath: string;
  locale: string;
  currency?: string;
}

export async function HomeCuratedProductRail({
  basePath,
  locale,
  currency,
}: HomeCuratedProductRailProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });
  const searchQuery = t("curatedProductRailSearchQuery");

  let products =
    (
      await getProducts({
        search: searchQuery,
        limit: 14,
        fields: PRODUCT_CARD_FIELDS,
        expand: ["seller"],
      }).catch(() => ({ data: [] }))
    ).data ?? [];

  if (!products.length) {
    products = await getNewArrivalProducts();
  }

  if (!products.length) return null;

  const viewAllHref = `${basePath}/products?q=${encodeURIComponent(searchQuery)}`;

  return (
    <section className="bg-white py-8 md:py-10">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-normal leading-tight text-[#222] md:text-[1.65rem]">
            {t("curatedProductRailTitle")}
          </h2>
          <Link
            href={viewAllHref}
            className="shrink-0 rounded-full border border-[#222] px-5 py-2 text-sm font-semibold text-[#222] transition hover:bg-[#f8f8f8]"
          >
            {t("viewAll")}
          </Link>
        </div>
        <ProductCarousel
          products={products}
          basePath={basePath}
          currency={currency}
          listId="home-curated-rail"
          listName={t("curatedProductRailTitle")}
          variant="etsy"
        />
      </div>
    </section>
  );
}
