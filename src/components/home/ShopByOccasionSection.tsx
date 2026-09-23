import type { Category } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ProductImage } from "@/components/ui/product-image";
import {
  getOccasionCategories,
  resolveCatalogImageUrl,
} from "@/lib/marketplace-stock-images";

interface ShopByOccasionSectionProps {
  categories: Category[];
  basePath: string;
  locale: string;
}

export async function ShopByOccasionSection({
  categories,
  basePath,
  locale,
}: ShopByOccasionSectionProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });
  const items =
    categories.length > 0
      ? categories.slice(0, 8).map((category, index) => ({
          id: category.id,
          name: category.name,
          href: `${basePath}/c/${category.permalink}`,
          imageUrl: resolveCatalogImageUrl(category.image_url, index + 3),
        }))
      : getOccasionCategories(basePath);

  return (
    <section className="bg-marketplace-background py-12 md:py-16">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-0">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold leading-none tracking-tight text-marketplace-brand md:text-[1.75rem]">
              {t("shopByOccasionTitle")}
            </h2>
            <p className="mt-1 text-xs text-marketplace-muted-foreground">
              {t("shopByOccasionDescription")}
            </p>
          </div>
          <Link
            href={`${basePath}/products`}
            className="shrink-0 text-xs font-semibold text-marketplace-brand hover:underline"
          >
            {t("viewAll")} →
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6 md:gap-3">
          {items.map((category) => (
            <li key={category.id}>
              <Link
                href={category.href}
                className="group flex flex-col items-center gap-2 text-center"
              >
                <span className="relative block w-full aspect-[31/20] overflow-hidden rounded-md bg-marketplace-muted ring-1 ring-marketplace-border-subtle transition group-hover:ring-marketplace-brand">
                  <ProductImage
                    src={category.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    iconClassName="size-8"
                  />
                </span>
                <span className="mt-1 block line-clamp-1 text-center font-display text-sm font-semibold text-marketplace-foreground group-hover:text-marketplace-brand">
                  {category.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
