import type { Product } from "@spree/sdk";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { StarSellerAvatar } from "@/components/shops/StarSellerAvatar";
import { productDetailPathSegment } from "@/lib/discovery-context";
import { getLocalProductStockImage } from "@/lib/marketplace-stock-images";
import { presentLocalShopById } from "@/lib/shops/local-shop-presentation";
import { cn } from "@/lib/utils";
import { sellerDisplayName, sellerMonogram } from "@/lib/utils/seller-display";

interface LocalMadeCloseProductCardProps {
  product: Product;
  basePath: string;
  locale: string;
  className?: string;
}

const PRODUCT_TITLES = [
  "Speckled Stoneware Mug",
  "Hand-carved Serving Board",
  "Brass Leaf Earrings",
  "Linen Kitchen Towel Set",
  "Pressed Floral Print",
  "Cedar Desk Tray",
  "Honey Oat Soap Bar",
  "Wool Throw Pillow",
  "Ceramic Bud Vase",
  "Hand-bound Sketchbook",
] as const;

function isFixtureProductName(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return (
    normalized.startsWith("[dev-dataset]") ||
    normalized.includes("merch ") ||
    normalized.includes("e2e ")
  );
}

export async function LocalMadeCloseProductCard({
  product,
  basePath,
  locale,
  className,
}: LocalMadeCloseProductCardProps) {
  const href = `${basePath}/products/${productDetailPathSegment(product)}`;
  const imageSrc =
    product.thumbnail_url || getLocalProductStockImage(product.id);
  const amount = product.price?.amount ? Number(product.price.amount) : NaN;
  const priceLabel =
    product.price?.currency && Number.isFinite(amount)
      ? new Intl.NumberFormat(locale, {
          style: "currency",
          currency: product.price.currency,
        }).format(amount)
      : product.price?.display_amount || "$28.00";

  const seller = product.seller;
  const presentation = seller ? presentLocalShopById(seller) : null;
  const rawSellerName = product.seller_name || seller?.name || "";
  const shopName = rawSellerName
    ? sellerDisplayName(rawSellerName) || rawSellerName
    : presentation?.displayName || "Clay & Kind Studio";
  const sellerHref = product.seller_slug
    ? `${basePath}/sellers/${product.seller_slug}`
    : seller?.slug
      ? `${basePath}/sellers/${seller.slug}`
      : null;
  const monogram = sellerMonogram(shopName);

  const title = isFixtureProductName(product.name)
    ? PRODUCT_TITLES[
        Math.abs(
          [...product.id].reduce(
            (hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0,
            0,
          ),
        ) % PRODUCT_TITLES.length
      ]
    : product.name;

  return (
    <article className={cn("min-w-0", className)}>
      <div className="mb-2 flex h-7 min-w-0 items-center gap-2">
        {seller ? (
          <StarSellerAvatar
            seller={seller}
            href={sellerHref ?? undefined}
            sizeClassName="size-7"
            imageSizes="28px"
          />
        ) : (
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#eae4da] text-[11px] font-semibold text-[#55504a] ring-1 ring-[#ddd6cb]"
            aria-hidden
          >
            {monogram}
          </span>
        )}
        {sellerHref ? (
          <Link
            href={sellerHref}
            className="min-w-0 flex-1 truncate text-xs font-medium text-marketplace-muted-foreground transition-colors hover:text-marketplace-brand"
          >
            {shopName}
          </Link>
        ) : (
          <p className="min-w-0 flex-1 truncate text-xs font-medium text-marketplace-muted-foreground">
            {shopName}
          </p>
        )}
      </div>
      <Link
        href={href}
        className="relative block aspect-square overflow-hidden rounded-[1.05rem] bg-[#ebe6df]"
      >
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover"
          sizes="(min-width: 1280px) 18vw, (min-width: 768px) 30vw, 45vw"
        />
        <span className="absolute bottom-2.5 right-2.5 inline-flex size-9 items-center justify-center rounded-full bg-white/95 text-marketplace-foreground shadow-sm">
          <Heart aria-hidden className="size-4" />
        </span>
      </Link>
      <h3 className="mt-2.5 line-clamp-2 text-sm leading-snug text-marketplace-foreground">
        <Link href={href} className="hover:underline">
          {title}
        </Link>
      </h3>
      {priceLabel ? (
        <p className="mt-1 text-sm font-semibold text-marketplace-foreground">
          {priceLabel}
        </p>
      ) : null}
    </article>
  );
}
