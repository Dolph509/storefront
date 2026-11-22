import type { Product, Seller } from "@spree/sdk";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FollowShopButton } from "@/components/shops/FollowShopButton";
import { StarSellerAvatar } from "@/components/shops/StarSellerAvatar";
import { productDetailPathSegment } from "@/lib/discovery-context";
import { shopCategoryLabel } from "@/lib/shops/local-directory";
import { cn } from "@/lib/utils";

interface LocalStarSellerCardProps {
  seller: Seller;
  products: Product[];
  basePath: string;
  locale: string;
  className?: string;
}

export function LocalStarSellerCard({
  seller,
  products,
  basePath,
  locale,
  className,
}: LocalStarSellerCardProps) {
  const shopHref = `${basePath}/sellers/${seller.slug}`;
  const category = shopCategoryLabel(seller);
  const hasReviews =
    seller.average_rating != null && (seller.reviews_count ?? 0) > 0;
  const tiles = Array.from(
    { length: 4 },
    (_, index) => products[index] ?? null,
  );

  return (
    <article
      className={cn(
        "min-w-0 w-full rounded-[1rem] border border-marketplace-border-subtle bg-white p-2.5 shadow-[0_1px_2px_rgba(49,43,54,0.04)]",
        className,
      )}
    >
      <div className="grid grid-cols-2 gap-1.5 overflow-hidden rounded-[0.75rem]">
        {tiles.map((product, index) => {
          const key = product?.id ?? `empty-${index}`;
          const href = product
            ? `${basePath}/products/${productDetailPathSegment(product)}`
            : shopHref;
          return (
            <Link
              key={key}
              href={href}
              className="relative aspect-square overflow-hidden bg-[#ebe6df]"
              aria-label={product?.name ?? seller.name}
            >
              {product?.thumbnail_url ? (
                <Image
                  src={product.thumbnail_url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="140px"
                />
              ) : (
                <span
                  className="absolute inset-0 bg-[linear-gradient(145deg,#eee9ef,#e7e0d6)]"
                  aria-hidden
                />
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-3 flex items-start gap-2.5 px-0.5 pb-0.5">
        <StarSellerAvatar
          seller={seller}
          href={shopHref}
          sizeClassName="size-11"
          imageSizes="44px"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-marketplace-foreground">
            <Link href={shopHref} className="hover:underline">
              {seller.name}
            </Link>
          </h3>
          {hasReviews ? (
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-marketplace-muted-foreground">
              <Star
                aria-hidden
                className="size-3.5 fill-[#6b4c9a] text-[#6b4c9a]"
              />
              <span className="font-medium text-marketplace-foreground">
                {seller.average_rating!.toFixed(1)}
              </span>
              <span>
                (
                {new Intl.NumberFormat(locale, {
                  notation: "compact",
                }).format(seller.reviews_count ?? 0)}
                )
              </span>
            </p>
          ) : null}
          {category ? (
            <p className="mt-0.5 truncate text-xs text-marketplace-muted-foreground">
              {category}
            </p>
          ) : null}
        </div>
        <FollowShopButton
          sellerId={seller.id}
          returnTo={shopHref}
          iconOnly
          className="size-9 shrink-0"
        />
      </div>
    </article>
  );
}
