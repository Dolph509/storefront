import type { Seller } from "@spree/sdk";
import { ScanSearch } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FeaturedShopFavoriteButton } from "@/components/shops/FeaturedShopFavoriteButton";

interface FeaturedShopCardProps {
  seller: Seller;
  basePath: string;
  locale: string;
  showVisualSearch?: boolean;
}

export async function FeaturedShopCard({
  seller,
  basePath,
  locale,
  showVisualSearch = false,
}: FeaturedShopCardProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });
  const shopHref = `${basePath}/sellers/${seller.slug}`;
  const cover = seller.cover_photo_url;
  const logo = seller.square_logo_url || seller.logo_url;

  return (
    <article className="group min-w-0 flex-1">
      <div className="relative">
        <Link href={shopHref} className="block">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#e8e4df]">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#e8e4df] to-[#d9d4cd] text-4xl font-semibold text-[#222]/30"
                aria-hidden
              >
                {seller.name.slice(0, 1)}
              </div>
            )}
          </div>
        </Link>

        <FeaturedShopFavoriteButton sellerId={seller.id} shopPath={shopHref} />

        {showVisualSearch ? (
          <Link
            href={`${shopHref}?tab=products`}
            className="absolute bottom-3 left-3 z-10 flex size-9 items-center justify-center rounded-full bg-[#222]/85 text-white shadow-sm transition-colors hover:bg-[#222]"
            aria-label={t("visualSearchShop")}
          >
            <ScanSearch className="size-4" aria-hidden />
          </Link>
        ) : null}
      </div>

      <div className="relative z-[1] -mt-7 flex flex-col items-center px-2">
        <Link
          href={shopHref}
          className="relative rounded-full border-[3px] border-white bg-white shadow-sm"
        >
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt={seller.name}
              className="size-14 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex size-14 items-center justify-center rounded-full bg-[#f0ebe4] text-lg font-semibold text-[#222]"
              aria-hidden
            >
              {seller.name.slice(0, 1)}
            </div>
          )}
        </Link>
        <h3 className="mt-2 w-full truncate text-center text-sm font-bold text-[#222]">
          <Link href={shopHref} className="hover:underline">
            {seller.name}
          </Link>
        </h3>
      </div>
    </article>
  );
}
