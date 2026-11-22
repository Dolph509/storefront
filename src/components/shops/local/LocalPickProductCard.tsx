import type { Product } from "@spree/sdk";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { productDetailPathSegment } from "@/lib/discovery-context";
import { cn } from "@/lib/utils";

interface LocalPickProductCardProps {
  product: Product;
  basePath: string;
  locale: string;
  className?: string;
}

export function LocalPickProductCard({
  product,
  basePath,
  locale,
  className,
}: LocalPickProductCardProps) {
  const href = `${basePath}/products/${productDetailPathSegment(product)}`;
  const amount = product.price?.amount ? Number(product.price.amount) : NaN;
  const priceLabel =
    product.price?.currency && Number.isFinite(amount)
      ? new Intl.NumberFormat(locale, {
          style: "currency",
          currency: product.price.currency,
        }).format(amount)
      : product.price?.display_amount;
  const hasReviews =
    product.average_rating != null && (product.reviews_count ?? 0) > 0;

  return (
    <article className={cn("min-w-0 w-full", className)}>
      <Link
        href={href}
        className="block overflow-hidden rounded-[0.85rem] bg-[#ebe6df] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketplace-brand"
      >
        <span className="relative block aspect-square">
          {product.thumbnail_url ? (
            <Image
              src={product.thumbnail_url}
              alt=""
              fill
              className="object-cover transition-transform duration-300 hover:scale-[1.03]"
              sizes="184px"
            />
          ) : (
            <span
              className="absolute inset-0 bg-[linear-gradient(145deg,#eee9ef,#e4ddd2)]"
              aria-hidden
            />
          )}
        </span>
      </Link>
      <h3 className="mt-2 line-clamp-2 text-sm leading-snug text-marketplace-foreground">
        <Link href={href} className="hover:underline">
          {product.name}
        </Link>
      </h3>
      {hasReviews ? (
        <p className="mt-1 inline-flex items-center gap-1 text-xs text-marketplace-muted-foreground">
          <Star aria-hidden className="size-3 fill-[#d49132] text-[#d49132]" />
          {product.average_rating!.toFixed(1)}
        </p>
      ) : null}
      {priceLabel ? (
        <p className="mt-1 text-sm font-medium text-marketplace-foreground">
          {priceLabel}
        </p>
      ) : null}
    </article>
  );
}
