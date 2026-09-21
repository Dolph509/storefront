import type { Seller } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { StarRatingDisplay } from "@/components/reviews/StarRating";
import { FollowShopButton } from "@/components/shops/FollowShopButton";
import { Button } from "@/components/ui/button";

interface ShopCardProps {
  seller: Seller;
  basePath: string;
  locale: string;
  productThumbs?: Array<string | null | undefined>;
  showFollow?: boolean;
}

export async function ShopCard({
  seller,
  basePath,
  locale,
  productThumbs = [],
  showFollow = true,
}: ShopCardProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });
  const logo = seller.square_logo_url || seller.logo_url;
  const thumbs = productThumbs.filter(Boolean).slice(0, 3) as string[];

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt=""
            className="size-12 rounded-full object-cover"
          />
        ) : (
          <div className="size-12 rounded-full bg-gray-100" aria-hidden />
        )}
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-gray-900">
            {seller.name}
          </h3>
          {seller.average_rating != null && seller.reviews_count > 0 ? (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
              <StarRatingDisplay
                rating={seller.average_rating}
                size="sm"
                showValue
              />
              <span>({seller.reviews_count})</span>
            </div>
          ) : null}
        </div>
      </div>

      {thumbs.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {thumbs.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
              className="aspect-square rounded-md bg-gray-100 object-cover"
            />
          ))}
        </div>
      ) : null}

      <div className="mt-auto flex flex-col gap-2">
        {showFollow ? <FollowShopButton sellerId={seller.id} /> : null}
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href={`${basePath}/sellers/${seller.slug}`}>
            {t("visitShop")}
          </Link>
        </Button>
      </div>
    </article>
  );
}
