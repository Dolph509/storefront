import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductReviewCard } from "@/components/reviews/ProductReviewCard";
import { StarRatingDisplay } from "@/components/reviews/StarRating";
import { FollowShopButton } from "@/components/shops/FollowShopButton";
import { Button } from "@/components/ui/button";
import {
  getSeller,
  getSellerProducts,
  getSellerReviews,
} from "@/lib/data/sellers";
import { RequestCustomOrderForm } from "./RequestCustomOrderForm";

interface SellerShopPageProps {
  params: Promise<{
    country: string;
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: SellerShopPageProps): Promise<Metadata> {
  const { slug, country, locale } = await params;
  try {
    const seller = await getSeller(slug);
    return {
      title: seller.name,
      description:
        seller.about || seller.shop_announcement || `Shop ${seller.name}`,
      alternates: { canonical: `/${country}/${locale}/sellers/${seller.slug}` },
    };
  } catch {
    return { title: "Shop" };
  }
}

export default async function SellerShopPage({
  params,
  searchParams,
}: SellerShopPageProps & { searchParams: Promise<{ page?: string }> }) {
  const { country, locale, slug } = await params;
  const t = await getTranslations("customOrders");
  const tSellers = await getTranslations("sellers");
  const basePath = `/${country}/${locale}`;

  let seller;
  try {
    seller = await getSeller(slug);
  } catch {
    notFound();
  }

  const page = Math.max(
    Number.parseInt((await searchParams).page ?? "1", 10) || 1,
    1,
  );
  let products: Awaited<ReturnType<typeof getSellerProducts>>;
  try {
    products = await getSellerProducts(seller.id, page);
  } catch {
    products = {
      data: [],
      meta: { count: 0, page: 1, pages: 1, from: 0, to: 0, limit: 24 },
    } as Awaited<ReturnType<typeof getSellerProducts>>;
  }
  let reviews: Awaited<ReturnType<typeof getSellerReviews>>;
  try {
    reviews = await getSellerReviews(seller.id);
  } catch {
    reviews = {
      data: [],
      meta: { count: 0, page: 1, pages: 1, from: 0, to: 0, limit: 5 },
    } as Awaited<ReturnType<typeof getSellerReviews>>;
  }

  const policies = (seller.policies ?? []).filter((policy) =>
    Boolean(policy.body || policy.body_html),
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-3">
        {seller.cover_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={seller.cover_photo_url}
            alt=""
            className="h-48 w-full rounded-xl object-cover"
          />
        ) : null}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            {seller.square_logo_url || seller.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={seller.square_logo_url || seller.logo_url || ""}
                alt=""
                className="size-16 rounded-full object-cover"
              />
            ) : null}
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {seller.name}
              </h1>
              {seller.shop_announcement ? (
                <p className="text-muted-foreground mt-1 text-sm">
                  {seller.shop_announcement}
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {seller.average_rating != null ? (
                  <span className="flex items-center gap-2">
                    <StarRatingDisplay
                      rating={seller.average_rating}
                      size="sm"
                      showValue
                    />
                    <span>({seller.reviews_count})</span>
                  </span>
                ) : null}
                <span>
                  {tSellers("productCount", {
                    count: products.meta.count ?? products.data.length,
                  })}
                </span>
                {seller.followers_count > 0 ? (
                  <span>
                    {tSellers("followersCount", {
                      count: seller.followers_count,
                    })}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <FollowShopButton sellerId={seller.id} />
            <Button variant="outline" size="sm" asChild>
              <Link href={`${basePath}/account/messages`}>
                {tSellers("contactSeller")}
              </Link>
            </Button>
          </div>
        </div>
        {seller.about ? (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: seller.about_html || seller.about,
            }}
          />
        ) : null}
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{tSellers("productsHeading")}</h2>
        <ProductGrid
          products={products.data}
          basePath={basePath}
          emptyMessage={tSellers("noProducts")}
          listDiscovery={{
            listId: `seller-shop-${seller.id}`,
            listName: seller.name,
            sourceId: seller.id,
          }}
          discoveryPageKey={`seller-shop-${seller.id}-p${page}`}
        />
        {products.meta.pages > 1 ? (
          <nav className="flex gap-3" aria-label={tSellers("productPages")}>
            {page > 1 ? (
              <a className="underline" href={`?page=${page - 1}`}>
                {tSellers("previous")}
              </a>
            ) : null}
            {page < products.meta.pages ? (
              <a className="underline" href={`?page=${page + 1}`}>
                {tSellers("next")}
              </a>
            ) : null}
          </nav>
        ) : null}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">{tSellers("reviewsHeading")}</h2>
        {reviews.data.length ? (
          reviews.data.map((review) => (
            <ProductReviewCard
              key={review.id}
              review={review}
              locale={locale}
              basePath={basePath}
              showProductLink
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            {tSellers("noReviews")}
          </p>
        )}
      </section>

      {policies.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">
            {tSellers("policiesHeading")}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {policies.map((policy) => (
              <article
                key={policy.id || policy.slug}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <h3 className="font-medium text-gray-900">{policy.name}</h3>
                <div
                  className="prose prose-sm mt-2 max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: policy.body_html || policy.body || "",
                  }}
                />
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {seller.accepts_custom_orders ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">{t("sectionTitle")}</h2>
          <p className="text-muted-foreground text-sm">{t("sectionHelp")}</p>
          <RequestCustomOrderForm sellerId={seller.id} basePath={basePath} />
        </section>
      ) : null}
    </div>
  );
}
