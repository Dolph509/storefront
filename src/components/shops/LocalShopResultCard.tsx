import type { Product, Seller } from "@spree/sdk";
import { MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FollowShopButton } from "@/components/shops/FollowShopButton";
import { getSellerProducts } from "@/lib/data/sellers";
import { productDetailPathSegment } from "@/lib/discovery-context";
import { cn } from "@/lib/utils";

interface LocalShopResultCardProps {
  seller: Seller;
  basePath: string;
  locale: string;
  className?: string;
}

export async function LocalShopResultCard({
  seller,
  basePath,
  locale,
  className,
}: LocalShopResultCardProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "shops",
  });
  const shopHref = `${basePath}/sellers/${seller.slug}`;
  const logo = seller.square_logo_url || seller.logo_url;
  const hasReviews =
    seller.average_rating != null && (seller.reviews_count ?? 0) > 0;
  const salesCount = seller.sales_count ?? 0;

  let products: Product[] = [];
  let listedCount = 0;
  try {
    const response = await getSellerProducts(seller.slug, {
      sellerId: seller.id,
      limit: 4,
      projection: "shop-card",
    });
    products = (response.data ?? [])
      .filter((product) => product.purchasable !== false)
      .slice(0, 4);
    listedCount = response.meta?.count ?? products.length;
  } catch {
    products = [];
  }

  const gallery: Array<{
    key: string;
    src: string;
    href: string;
    alt: string;
  }> = products.map((product) => ({
    key: product.id,
    src: product.thumbnail_url || "",
    href: `${basePath}/products/${productDetailPathSegment(product)}`,
    alt: product.name,
  }));

  if (gallery.length === 0 && seller.cover_photo_url) {
    gallery.push({
      key: "cover",
      src: seller.cover_photo_url,
      href: shopHref,
      alt: seller.name,
    });
  }

  while (gallery.length < 4) {
    gallery.push({
      key: `placeholder-${gallery.length}`,
      src: "",
      href: shopHref,
      alt: "",
    });
  }

  return (
    <article
      data-local-shop-result
      className={cn(
        "group border-b border-marketplace-border-subtle py-6 first:pt-0 last:border-b-0 sm:py-7",
        className,
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <Link
          href={shopHref}
          className="relative size-12 shrink-0 overflow-hidden rounded-full border border-marketplace-border-subtle bg-marketplace-surface-subtle sm:size-14"
        >
          {logo ? (
            <Image
              src={logo}
              alt=""
              fill
              className="object-cover"
              sizes="56px"
            />
          ) : (
            <span
              className="flex size-full items-center justify-center font-display text-lg text-marketplace-brand"
              aria-hidden
            >
              {seller.name.slice(0, 1)}
            </span>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate font-display text-xl font-normal leading-tight tracking-[-0.02em] text-marketplace-foreground sm:text-[1.35rem]">
                <Link
                  href={shopHref}
                  className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketplace-brand"
                >
                  {seller.name}
                </Link>
              </h2>

              <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-marketplace-muted-foreground">
                {hasReviews ? (
                  <span className="inline-flex items-center gap-1 font-medium text-marketplace-foreground">
                    <Star
                      aria-hidden
                      className="size-3.5 fill-[#d49132] text-[#d49132]"
                    />
                    {seller.average_rating!.toFixed(1)}
                    <span className="font-normal text-marketplace-muted-foreground">
                      (
                      {new Intl.NumberFormat(locale, {
                        notation: "compact",
                      }).format(seller.reviews_count ?? 0)}
                      )
                    </span>
                  </span>
                ) : (
                  <span>{t("newShop")}</span>
                )}
                {seller.ships_from ? (
                  <>
                    <span aria-hidden className="text-marketplace-border">
                      ·
                    </span>
                    <span className="inline-flex min-w-0 items-center gap-1">
                      <MapPin aria-hidden className="size-3.5 shrink-0" />
                      <span className="truncate">{seller.ships_from}</span>
                    </span>
                  </>
                ) : null}
                {salesCount > 0 ? (
                  <>
                    <span aria-hidden className="text-marketplace-border">
                      ·
                    </span>
                    <span>{t("salesCount", { count: salesCount })}</span>
                  </>
                ) : null}
              </div>

              {seller.tagline ? (
                <p className="mt-1.5 line-clamp-2 max-w-2xl text-sm leading-relaxed text-marketplace-muted-foreground">
                  {seller.tagline}
                </p>
              ) : null}
            </div>

            <div className="shrink-0">
              <FollowShopButton
                sellerId={seller.id}
                returnTo={shopHref}
                iconOnly
                className="size-10"
              />
            </div>
          </div>

          <ul className="mt-4 grid grid-cols-4 gap-1.5 sm:mt-5 sm:gap-2 md:max-w-xl">
            {gallery.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="relative block aspect-square overflow-hidden rounded-[var(--marketplace-radius-sm)] bg-marketplace-surface-subtle"
                  aria-label={item.alt || seller.name}
                >
                  {item.src ? (
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                      sizes="(min-width: 768px) 140px, 22vw"
                    />
                  ) : (
                    <span
                      className="absolute inset-0 bg-[linear-gradient(145deg,var(--marketplace-accent),var(--marketplace-surface-subtle))]"
                      aria-hidden
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            {listedCount > 0 ? (
              <p className="text-sm text-marketplace-muted-foreground">
                {t("itemsCount", { count: listedCount })}
              </p>
            ) : null}
            <Link
              href={shopHref}
              className="inline-flex text-sm font-medium text-marketplace-brand underline-offset-4 hover:underline"
            >
              {t("visitShop")}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
