import type { Product, Seller } from "@spree/sdk";
import Image from "next/image";
import Link from "next/link";
import { FeaturedShopFavoriteButton } from "@/components/shops/FeaturedShopFavoriteButton";
import { StarSellerAvatar } from "@/components/shops/StarSellerAvatar";
import { productDetailPathSegment } from "@/lib/discovery-context";
import { cn } from "@/lib/utils";

interface LocalFeaturedShopCardProps {
  seller: Seller;
  featuredProduct?: Product;
  basePath: string;
  className?: string;
}

export function LocalFeaturedShopCard({
  seller,
  featuredProduct,
  basePath,
  className,
}: LocalFeaturedShopCardProps) {
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

  return (
    <article className={cn("min-w-0 w-full", className)}>
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
              sizes="216px"
            />
          ) : (
            <span
              className="absolute inset-0 bg-[linear-gradient(160deg,#eee9ef,#e4ddd2)]"
              aria-hidden
            />
          )}
        </Link>
        <FeaturedShopFavoriteButton sellerId={seller.id} shopPath={shopHref} />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <StarSellerAvatar
          seller={seller}
          href={shopHref}
          sizeClassName="size-9"
          imageSizes="36px"
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
