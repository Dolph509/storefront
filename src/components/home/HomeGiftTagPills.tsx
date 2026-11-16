import type { Category } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MarketplacePage, MarketplaceSection } from "@/components/marketplace";
import { ProductImage } from "@/components/ui/product-image";
import {
  getEditorialCategories,
  resolveCatalogImageUrl,
} from "@/lib/marketplace-stock-images";

interface HomeGiftTagPillsProps {
  categories: Category[];
  basePath: string;
  locale: string;
}

export async function HomeGiftTagPills({
  categories,
  basePath,
  locale,
}: HomeGiftTagPillsProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });

  const items =
    categories.length > 0
      ? categories.slice(0, 6).map((category, index) => ({
          id: category.id,
          name: category.name,
          href: `${basePath}/c/${category.permalink}`,
          imageUrl: resolveCatalogImageUrl(category.image_url, index + 2),
        }))
      : getEditorialCategories(basePath).slice(0, 6);

  if (!items.length) return null;

  return (
    <MarketplaceSection
      surface="none"
      className="py-4 md:py-6"
      data-theme-section="gift_tag_pills"
    >
      <MarketplacePage>
        <h2 className="text-xl font-bold tracking-tight text-marketplace-foreground md:text-2xl">
          {t("giftTagPillsTitle")}
        </h2>
        <ul
          className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
          data-theme-gift-tag-grid
        >
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex min-h-[3.25rem] items-center gap-3 rounded-xl border border-marketplace-border-subtle bg-marketplace-surface px-3 py-2 shadow-[var(--marketplace-shadow-card)] transition hover:border-marketplace-brand/40 hover:shadow-[var(--marketplace-shadow-card-hover)]"
              >
                <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-marketplace-muted">
                  <ProductImage
                    src={item.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    iconClassName="size-5"
                  />
                </span>
                <span className="line-clamp-2 text-sm font-semibold leading-snug text-marketplace-foreground">
                  {item.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </MarketplacePage>
    </MarketplaceSection>
  );
}
