import type { Category } from "@spree/sdk";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";

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

  return (
    <>
      <div className="border-b border-marketplace-border bg-marketplace-surface-warm">
        <div
          className={`mx-auto grid max-w-[var(--marketplace-container)] px-4 sm:px-6 lg:px-8 ${category.image_url ? "md:grid-cols-[minmax(0,1fr)_minmax(0,42%)]" : ""}`}
        >
          <div className="flex min-w-0 flex-col justify-center py-8 md:py-14">
            <Breadcrumbs
              category={category}
              basePath={basePath}
              locale={locale}
            />

            <div className="mt-4">
              <h1 className="marketplace-listing-title text-balance text-marketplace-foreground">
                {category.name}
              </h1>
            </div>

            {/* Description */}
            {category.description && (
              <p className="mt-3 max-w-2xl text-marketplace-muted-foreground">
                {category.description}
              </p>
            )}
          </div>
          {category.image_url ? (
            <div
              aria-hidden="true"
              className="hidden min-h-64 bg-cover bg-center md:block"
              style={{ backgroundImage: `url(${category.image_url})` }}
            />
          ) : null}
        </div>
      </div>

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <div className="mx-auto mt-5 max-w-[var(--marketplace-container)] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 border-b border-marketplace-border pb-5">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`${basePath}/c/${child.permalink}`}
                className="rounded-[var(--marketplace-radius-sm)] border border-marketplace-border bg-marketplace-surface px-3 py-1.5 text-sm text-marketplace-foreground transition-colors hover:border-marketplace-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketplace-brand"
              >
                {child.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
