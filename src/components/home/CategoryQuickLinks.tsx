import type { Category } from "@spree/sdk";
import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";
import {
  getEditorialCategories,
  resolveCatalogImageUrl,
} from "@/lib/marketplace-stock-images";

interface CategoryQuickLinksProps {
  categories: Category[];
  basePath: string;
  locale: string;
}

export async function CategoryQuickLinks({
  categories,
  basePath,
}: CategoryQuickLinksProps) {
  const items =
    categories.length > 0
      ? categories.slice(0, 10).map((category, index) => ({
          id: category.id,
          name: category.name,
          href: `${basePath}/c/${category.permalink}`,
          imageUrl: resolveCatalogImageUrl(category.image_url, index),
        }))
      : getEditorialCategories(basePath);

  return (
    <section className="bg-marketplace-background py-3 md:py-4">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-0">
        <ul className="flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-5 md:gap-4 md:overflow-visible lg:grid-cols-10">
          {items.map((category, index) => (
            <li key={category.id} className="w-[4.5rem] shrink-0 md:w-auto">
              <Link
                href={category.href}
                className="group flex flex-col items-center gap-2 text-center"
              >
                <span className="relative size-[4rem] overflow-hidden rounded-full bg-marketplace-muted ring-1 ring-marketplace-border-subtle transition group-hover:ring-marketplace-brand md:size-[4.4rem]">
                  <ProductImage
                    src={category.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    iconClassName="size-8"
                    fetchPriority={index < 4 ? "high" : undefined}
                  />
                </span>
                <span className="line-clamp-2 text-xs font-medium text-marketplace-foreground group-hover:text-marketplace-brand">
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
