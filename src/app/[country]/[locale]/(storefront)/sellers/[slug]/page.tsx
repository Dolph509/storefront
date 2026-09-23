import { SpreeError } from "@spree/sdk";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SellerShopAnnouncement } from "@/components/shops/seller-storefront/SellerShopAnnouncement";
import { SellerShopHeader } from "@/components/shops/seller-storefront/SellerShopHeader";
import { SellerShopNav } from "@/components/shops/seller-storefront/SellerShopNav";
import { SellerShopTrafficBeacon } from "@/components/shops/seller-storefront/SellerShopTrafficBeacon";
import { SellerStorefrontAbout } from "@/components/shops/seller-storefront/SellerStorefrontAbout";
import { SellerStorefrontHome } from "@/components/shops/seller-storefront/SellerStorefrontHome";
import { SellerStorefrontPolicies } from "@/components/shops/seller-storefront/SellerStorefrontPolicies";
import { SellerStorefrontProducts } from "@/components/shops/seller-storefront/SellerStorefrontProducts";
import { SellerStorefrontReviews } from "@/components/shops/seller-storefront/SellerStorefrontReviews";
import type { SellerStorefrontPayload } from "@/lib/data/seller-storefront-types";
import {
  getSeller,
  getSellerProducts,
  getSellerStorefront,
} from "@/lib/data/sellers";
import { getStoreName } from "@/lib/store";
import {
  parseSellerStorefrontTab,
  sellerShopPath,
  sellerShopShellClass,
} from "@/lib/utils/seller-storefront";
import { RequestCustomOrderForm } from "./RequestCustomOrderForm";

interface SellerShopPageProps {
  params: Promise<{
    country: string;
    locale: string;
    slug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function pickParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

async function loadStorefront(slug: string): Promise<SellerStorefrontPayload> {
  try {
    return await getSellerStorefront(slug);
  } catch (error) {
    const storefrontMissing =
      error instanceof SpreeError && error.status === 404;
    if (!storefrontMissing) throw error;

    const seller = await getSeller(slug);
    return {
      seller,
      sections: [],
      featured_product_ids: [],
      stats: {
        reviews_count: seller.reviews_count,
        average_rating: seller.average_rating,
        followers_count: seller.followers_count,
        sales_count: 0,
      },
      following: null,
      messaging_available: null,
    };
  }
}

export async function generateMetadata({
  params,
}: SellerShopPageProps): Promise<Metadata> {
  const { slug, country, locale } = await params;
  try {
    const { seller } = await loadStorefront(slug);
    const description =
      seller.tagline ||
      seller.about ||
      seller.shop_announcement ||
      `Shop ${seller.name}`;
    const canonical = `/${country}/${locale}/sellers/${seller.slug}`;
    const images = seller.cover_photo_url
      ? [{ url: seller.cover_photo_url }]
      : seller.square_logo_url
        ? [{ url: seller.square_logo_url }]
        : undefined;

    return {
      title: `${seller.name} | Shop`,
      description: description.slice(0, 160),
      alternates: { canonical },
      openGraph: {
        title: seller.name,
        description: description.slice(0, 160),
        url: canonical,
        images,
        type: "website",
      },
      robots: { index: true, follow: true },
    };
  } catch {
    return { title: "Shop", robots: { index: false } };
  }
}

export default async function SellerShopPage({
  params,
  searchParams,
}: SellerShopPageProps) {
  const { country, locale, slug } = await params;
  const raw = await searchParams;
  const basePath = `/${country}/${locale}`;
  const tab = parseSellerStorefrontTab(pickParam(raw.tab));
  const page = Math.max(
    Number.parseInt(pickParam(raw.page) ?? "1", 10) || 1,
    1,
  );
  const section = pickParam(raw.section);
  const query = pickParam(raw.q);
  const sort = pickParam(raw.sort);
  const _minPrice = pickParam(raw.min_price);
  const _maxPrice = pickParam(raw.max_price);
  const _minRating = pickParam(raw.min_rating);
  const _personalizable = pickParam(raw.personalizable);
  const onSale = pickParam(raw.sale);

  let payload: SellerStorefrontPayload;
  try {
    payload = await loadStorefront(slug);
  } catch {
    notFound();
  }

  const {
    seller,
    sections,
    featured_product_ids,
    following,
    messaging_available,
  } = payload;
  const shopPath = `${basePath}/sellers/${seller.slug}`;

  const productList = await getSellerProducts(slug, {
    sellerId: seller.id,
    page: 1,
    limit: 1,
  }).catch(() => ({ data: [], meta: { count: 0, pages: 1 } }));
  const productCount = productList.meta.count ?? 0;

  const t = await getTranslations("sellers");
  const marketplaceName = getStoreName();
  const customOrderHref = seller.accepts_custom_orders
    ? sellerShopPath(basePath, seller.slug, "custom-orders")
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: seller.name,
    description: seller.tagline || seller.about,
    image: seller.cover_photo_url || seller.logo_url,
    url: shopPath,
    ...(seller.average_rating != null && seller.reviews_count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: seller.average_rating,
            reviewCount: seller.reviews_count,
          },
        }
      : {}),
  };

  return (
    <div className="min-h-screen bg-white">
      <SellerShopTrafficBeacon sellerId={seller.id} path={shopPath} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SellerShopHeader
        seller={seller}
        basePath={basePath}
        following={following === true}
        messagingAvailable={messaging_available !== false}
        shopPath={shopPath}
        followersCount={seller.followers_count ?? 0}
      />
      <SellerShopNav
        slug={seller.slug}
        basePath={basePath}
        activeTab={tab}
        productCount={productCount}
        query={query}
      />

      {!seller.on_vacation ? (
        <SellerShopAnnouncement
          shopAnnouncement={seller.shop_announcement}
          shopAnnouncementHtml={seller.shop_announcement_html}
        />
      ) : null}

      {tab === "home" ? (
        <SellerStorefrontHome
          slug={seller.slug}
          basePath={basePath}
          locale={locale}
          sellerId={seller.id}
          sections={sections}
          featuredIds={featured_product_ids}
          aboutHtml={seller.about_html}
          about={seller.about}
          reviewsCount={seller.reviews_count}
          sellable={seller.sellable}
          onVacation={seller.on_vacation}
        />
      ) : null}

      {productCount === 0 && tab === "products" ? (
        <div className={`${sellerShopShellClass} py-16 text-center`}>
          <p className="text-lg font-medium text-gray-900">
            {t("emptyShopTitle")}
          </p>
          <p className="mt-2 text-gray-600">{t("emptyShopBody")}</p>
        </div>
      ) : null}

      {tab === "products" && productCount > 0 ? (
        <SellerStorefrontProducts
          slug={seller.slug}
          sellerId={seller.id}
          basePath={basePath}
          sections={sections}
          featuredIds={featured_product_ids}
          page={page}
          section={section}
          query={query}
          sort={sort}
          onSale={onSale}
          totalItemCount={productCount}
          salesCount={seller.sales_count ?? payload.stats.sales_count}
          followersCount={seller.followers_count ?? 0}
          customOrderHref={customOrderHref}
          shopPath={shopPath}
          marketplaceName={marketplaceName}
        />
      ) : null}

      {tab === "custom-orders" && seller.accepts_custom_orders ? (
        <div className={`${sellerShopShellClass} py-8`}>
          <h2 className="text-2xl font-bold text-gray-900">
            {t("requestCustomOrder")}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{t("customOrderHelp")}</p>
          <div className="mt-6 rounded-md border border-[#e8d5cc] bg-white p-6">
            <RequestCustomOrderForm
              sellerId={seller.id}
              basePath={basePath}
              messagingAvailable={messaging_available !== false}
            />
          </div>
        </div>
      ) : null}

      {tab === "reviews" ? (
        <SellerStorefrontReviews
          slug={seller.slug}
          basePath={basePath}
          locale={locale}
          page={page}
          sort={sort}
          averageRating={seller.average_rating}
          reviewsCount={seller.reviews_count}
          distribution={seller.rating_distribution}
        />
      ) : null}

      {tab === "about" ? (
        <>
          <SellerStorefrontAbout
            shopName={seller.name}
            marketplaceName={marketplaceName}
            tagline={seller.tagline}
            aboutHtml={seller.about_html}
            about={seller.about}
            salesCount={seller.sales_count ?? payload.stats.sales_count}
          />
          <SellerStorefrontPolicies
            policies={seller.policies ?? []}
            marketplaceName={marketplaceName}
          />
        </>
      ) : null}

      {tab === "policies" ? (
        <SellerStorefrontPolicies
          policies={seller.policies ?? []}
          marketplaceName={marketplaceName}
        />
      ) : null}
    </div>
  );
}
