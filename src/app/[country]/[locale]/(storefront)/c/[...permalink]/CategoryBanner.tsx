import type { Category } from "@spree/sdk";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { CategoryImage } from "@/components/ui/category-image";

interface CategoryBannerProps {
  category: Category;
  basePath: string;
  locale: string;
}

export async function CategoryBanner({
  category,
  basePath,
  locale,
}: CategoryBannerProps) {
  "use cache: remote";
  cacheLife("minutes");
  cacheTag("category-banner");

  const heroImage = category.image_url;

  return (
    <>
      <div
        data-theme-category-banner
        className="border-b border-marketplace-border-subtle bg-marketplace-surface-warm"
      >
        <div
          className={`mx-auto grid max-w-[var(--marketplace-container)] px-4 sm:px-6 lg:px-8 ${heroImage ? "md:grid-cols-[minmax(0,1fr)_minmax(0,40%)]" : ""}`}
        >
          <div className="order-2 flex min-w-0 flex-col justify-center py-5 md:order-1 md:py-10">
            <Breadcrumbs
              category={category}
              basePath={basePath}
              locale={locale}
              centered
            />

            <div className="mt-2 md:mt-3">
              <h1 className="marketplace-listing-title text-balance text-marketplace-foreground">
                {category.name}
              </h1>
            </div>

            {category.description ? (
              <p className="mt-2 max-w-2xl text-sm text-marketplace-muted-foreground md:mt-3 md:text-base">
                {category.description}
              </p>
            ) : null}
          </div>
          {heroImage ? (
            <div
              aria-hidden="true"
              className="relative order-1 aspect-[5/3] overflow-hidden md:order-2 md:aspect-auto md:min-h-56"
            >
              <CategoryImage
                src={heroImage}
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </div>

      {category.children && category.children.length > 0 ? (
        <div
          data-theme-category-subnav
          className="mx-auto max-w-[var(--marketplace-container)] px-4 pt-4 sm:px-6 lg:px-8"
        >
          <ul className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {category.children.map((child) => (
              <li key={child.id} className="shrink-0 snap-start sm:shrink">
                <Link
                  href={`${basePath}/c/${child.permalink}`}
                  className="inline-flex rounded-full border border-marketplace-border-subtle bg-marketplace-surface px-3.5 py-1.5 text-sm text-marketplace-foreground transition-colors hover:border-marketplace-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketplace-brand"
                >
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
