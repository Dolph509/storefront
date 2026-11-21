import type { Category } from "@spree/sdk";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  MarketplacePage,
  MarketplaceSection,
  MarketplaceSectionHeader,
} from "@/components/marketplace";
import { ProductImage } from "@/components/ui/product-image";
import { resolveCatalogImageUrl } from "@/lib/marketplace-stock-images";

interface CategoryBrowseGridProps {
  categories: Category[];
  basePath: string;
  locale: string;
}

export async function CategoryBrowseGrid({
  categories,
  basePath,
  locale,
}: CategoryBrowseGridProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });

  if (!categories.length) return null;

  const items = categories.slice(0, 6).map((category, index) => ({
    id: category.id,
    name: category.name,
    href: `${basePath}/c/${category.permalink}`,
    imageUrl: resolveCatalogImageUrl(category.image_url, index),
  }));

  return (
    <MarketplaceSection
      surface="none"
      className="py-10 md:py-12"
      data-theme-section="category_grid"
    >
      <MarketplacePage>
        <MarketplaceSectionHeader
          eyebrow={t("browseByInterest")}
          title={t("mostLovedCategoriesTitle")}
          density="home"
          action={
            <Link
              href={`${basePath}/products`}
              className="group inline-flex items-center gap-1 text-sm font-medium text-marketplace-brand transition-colors hover:text-marketplace-brand-accent"
            >
              {t("viewAll")}
              <ArrowRight
                className="size-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          }
        />
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-5">
          {items.map((category, index) => (
            <li key={category.id}>
              <Link href={category.href} className="group block">
                <span className="relative block aspect-[4/5] overflow-hidden rounded-[var(--marketplace-radius-sm)] border border-marketplace-border-subtle bg-marketplace-surface-subtle transition-colors group-hover:border-marketplace-brand">
                  <ProductImage
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 15vw"
                    iconClassName="size-10"
                    fetchPriority={index < 4 ? "high" : undefined}
                  />
                </span>
                <span className="mt-2.5 flex items-center justify-between gap-2 text-sm font-medium leading-snug text-marketplace-foreground transition-colors group-hover:text-marketplace-brand-accent">
                  <span className="line-clamp-1">{category.name}</span>
                  <ArrowRight
                    className="size-3.5 shrink-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </MarketplacePage>
    </MarketplaceSection>
  );
}
