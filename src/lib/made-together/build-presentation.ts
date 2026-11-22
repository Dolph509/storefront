import type { CollaborationCredit, Product, Seller } from "@spree/sdk";
import { getSellerStorefront } from "@/lib/data/sellers";
import type { MadeTogetherMaker, MadeTogetherPresentation } from "./types";

function hasStarSellerBadge(
  seller: Pick<Seller, "badges"> | undefined,
): boolean {
  return (
    seller?.badges?.some(
      (badge) => badge.key === "star_seller" && badge.awarded_at != null,
    ) ?? false
  );
}

function resolveSellerRating(seller: Seller | null | undefined): {
  averageRating: number | null;
  reviewsCount: number;
} {
  if (!seller) return { averageRating: null, reviewsCount: 0 };
  if (
    seller.average_rating != null &&
    Number.isFinite(seller.average_rating) &&
    (seller.reviews_count ?? 0) > 0
  ) {
    return {
      averageRating: seller.average_rating,
      reviewsCount: seller.reviews_count ?? 0,
    };
  }
  const dist = (
    seller as Seller & { rating_distribution?: Record<string, number> | null }
  ).rating_distribution;
  if (dist) {
    let totalCount = 0;
    let weightedSum = 0;
    for (const [starKey, rawCount] of Object.entries(dist)) {
      const star = Number(starKey);
      const count = Number(rawCount);
      if (star >= 1 && star <= 5 && count > 0) {
        totalCount += count;
        weightedSum += star * count;
      }
    }
    if (totalCount > 0) {
      return {
        averageRating: weightedSum / totalCount,
        reviewsCount: totalCount,
      };
    }
  }
  return {
    averageRating: seller.average_rating ?? null,
    reviewsCount: seller.reviews_count ?? 0,
  };
}

function makerFromSeller(
  seller: Seller,
  basePath: string,
  craftContribution: string | null,
  key: string,
): MadeTogetherMaker {
  const { averageRating, reviewsCount } = resolveSellerRating(seller);
  return {
    key,
    name: seller.name,
    slug: seller.slug,
    href: seller.slug ? `${basePath}/sellers/${seller.slug}` : null,
    logoUrl: seller.square_logo_url || seller.logo_url,
    craftContribution,
    averageRating,
    reviewsCount,
    starSeller: hasStarSellerBadge(seller),
    isSellerOfRecord: true,
    role: "lead_seller",
    tagline: seller.tagline ?? null,
    shipsFrom: seller.ships_from ?? null,
    followersCount: seller.followers_count ?? 0,
  };
}

async function makerFromCredit(
  credit: CollaborationCredit,
  basePath: string,
): Promise<MadeTogetherMaker> {
  const slug = credit.seller_slug;
  let enriched: Seller | null = null;
  if (slug) {
    try {
      const storefront = await getSellerStorefront(slug);
      enriched = storefront.seller;
    } catch {
      enriched = null;
    }
  }

  const name =
    credit.display_name || enriched?.name || credit.seller_name || "Maker";
  const { averageRating, reviewsCount } = resolveSellerRating(enriched);

  return {
    key: credit.id,
    name,
    slug,
    href: slug ? `${basePath}/sellers/${slug}` : null,
    logoUrl: enriched?.square_logo_url || enriched?.logo_url || null,
    craftContribution: credit.craft_contribution,
    averageRating,
    reviewsCount,
    starSeller: hasStarSellerBadge(enriched ?? undefined),
    isSellerOfRecord: false,
    role: credit.role,
    tagline: enriched?.tagline ?? null,
    shipsFrom: enriched?.ships_from ?? null,
    followersCount: enriched?.followers_count ?? 0,
  };
}

/**
 * Buyer-facing roster for a co-created product: seller of record plus credited
 * partners, with enough display metadata for the PDP Made together block.
 */
export async function buildMadeTogetherPresentation(
  product: Product,
  credits: CollaborationCredit[],
  basePath: string,
): Promise<MadeTogetherPresentation | null> {
  if (credits.length === 0) return null;

  const makers: MadeTogetherMaker[] = [];
  const seenSlugs = new Set<string>();

  const sellerOfRecord = product.seller;
  if (sellerOfRecord?.slug) {
    seenSlugs.add(sellerOfRecord.slug);
    makers.push(
      makerFromSeller(sellerOfRecord, basePath, null, sellerOfRecord.id),
    );
  }

  for (const credit of credits) {
    if (credit.seller_slug && seenSlugs.has(credit.seller_slug)) continue;
    const maker = await makerFromCredit(credit, basePath);
    if (maker.slug) seenSlugs.add(maker.slug);
    makers.push(maker);
  }

  const rated = makers.filter(
    (maker) =>
      maker.averageRating != null && Number.isFinite(maker.averageRating),
  );
  const aggregateRating =
    rated.length > 0
      ? rated.reduce((sum, maker) => sum + maker.averageRating!, 0) /
        rated.length
      : null;

  const productRating =
    product.average_rating != null &&
    Number.isFinite(product.average_rating) &&
    (product.reviews_count ?? 0) > 0
      ? product.average_rating
      : null;

  const compactRating = aggregateRating ?? productRating;

  return { makers, aggregateRating, compactRating };
}
