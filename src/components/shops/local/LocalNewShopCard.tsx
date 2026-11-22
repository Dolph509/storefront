import type { Product, Seller } from "@spree/sdk";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FeaturedShopFavoriteButton } from "@/components/shops/FeaturedShopFavoriteButton";
import { StarSellerAvatar } from "@/components/shops/StarSellerAvatar";
import { productDetailPathSegment } from "@/lib/discovery-context";
import { monthsOnMarketplace } from "@/lib/shops/local-directory";
import { cn } from "@/lib/utils";

interface LocalNewShopCardProps {
  seller: Seller;
  featuredProduct?: Product;
  basePath: string;
  locale: string;
  className?: string;
}

export async function LocalNewShopCard({
  seller,
  featuredProduct,
  basePath,
  locale,
  className,
}: LocalNewShopCardProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "shops",
  });
  const shopHref = `${basePath}/sellers/${seller.slug}`;
  const imageSrc =
    featuredProduct?.thumbnail_url ||
    seller.cover_photo_url ||
    seller.square_logo_url ||
    seller.logo_url ||
    "";
  const imageHref = featuredProduct
    ? `${basePath}/products/${productDetailPathSegment(featuredProduct)}`
    : shopHref;
  const months = monthsOnMarketplace(seller.seller_since);
  const tenureLabel =
    months == null
      ? t("newOnMarketplace")
      : months < 1
        ? t("tenureLessThanMonth")
        : t("tenureMonths", { count: months });

  return (
    <article className={cn("min-w-0", className)}>
      <div className="relative">
        <Link
          href={imageHref}
          className="relative block aspect-[4/5] overflow-hidden rounded-[1rem] bg-[#ebe6df] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketplace-brand"
        >
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt=""
              fill
              className="object-cover transition-transform duration-300 hover:scale-[1.02]"
              sizes="(min-width: 1024px) 220px, 40vw"
            />
          ) : (
            <span
              className="absolute inset-0 bg-[linear-gradient(160deg,#eee9ef,#e4ddd2_55%,#d9d2c7)]"
              aria-hidden
            />
          )}
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#312b36]/70 to-transparent px-3 pb-3 pt-10 text-xs font-medium text-white">
            {tenureLabel}
          </span>
        </Link>
        <FeaturedShopFavoriteButton sellerId={seller.id} shopPath={shopHref} />
      </div>

      <div className="mt-3 flex items-center gap-2.5">
        <StarSellerAvatar
          seller={seller}
          href={shopHref}
          sizeClassName="size-10"
          imageSizes="40px"
        />
        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-marketplace-foreground">
          <Link href={shopHref} className="hover:underline">
            {seller.name}
          </Link>
        </h3>
      </div>
    </article>
  );
}
