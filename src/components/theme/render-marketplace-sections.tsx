import type { Product, ProductListParams, Seller } from "@spree/sdk";
import Link from "next/link";
import {
  MarketplacePage,
  MarketplaceRail,
  MarketplaceSection,
  MarketplaceSectionHeader,
} from "@/components/marketplace";
import { ProductRecommendationRail } from "@/components/products/ProductRecommendationRail";
import { ShopCard } from "@/components/shops/ShopCard";
import { getClient, getLocaleOptions } from "@/lib/spree";
import { marketplaceFor } from "@/lib/spree/marketplace";
import type { ThemeRenderContext } from "@/lib/theme/types";

export type MarketplaceSectionWire = {
  id: string;
  type: string;
  enabled?: boolean;
  disabled?: boolean;
  settings: Record<string, unknown>;
  visibility?: { desktop?: boolean; tablet?: boolean; mobile?: boolean };
};

function string(settings: Record<string, unknown>, key: string): string {
  return typeof settings[key] === "string" ? (settings[key] as string) : "";
}

function ids(settings: Record<string, unknown>, key: string): string[] {
  return Array.isArray(settings[key])
    ? (settings[key] as unknown[]).filter(
        (id): id is string => typeof id === "string",
      )
    : [];
}

function limit(section: MarketplaceSectionWire): number {
  const value = section.settings.limit;
  return typeof value === "number" ? Math.min(24, Math.max(1, value)) : 8;
}

async function listCatalogProducts(
  params?: ProductListParams,
): Promise<Product[]> {
  const options = await getLocaleOptions();
  try {
    const response = await getClient().products.list(params, options);
    return response.data ?? [];
  } catch {
    return [];
  }
}

async function listRecommendationProducts(
  kind: "trending" | "new",
): Promise<Product[]> {
  const options = await getLocaleOptions();
  const marketplace = marketplaceFor(getClient());
  try {
    const response =
      kind === "trending"
        ? await marketplace.recommendations.trending(
            { limit: 24, expand: ["seller"] },
            options,
          )
        : await marketplace.recommendations.new(
            { limit: 24, expand: ["seller"] },
            options,
          );
    return response.data ?? [];
  } catch {
    return [];
  }
}

function safeLink(href: string, basePath: string): string | null {
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  if (href.startsWith("https://")) return href;
  return href ? null : `${basePath}/products`;
}

function listId(
  context: ThemeRenderContext,
  section: MarketplaceSectionWire,
  suffix: string,
): string {
  const scope =
    context.kind === "home"
      ? "home"
      : context.kind === "product"
        ? `product-${context.product.id}`
        : context.kind;
  return `theme-${scope}-${suffix}-${section.id}`;
}

export async function renderMarketplaceSection(
  section: MarketplaceSectionWire,
  context: ThemeRenderContext,
): Promise<React.ReactNode> {
  const enabled = section.enabled ?? !section.disabled;
  if (!enabled) return null;

  switch (section.type) {
    case "hero":
      return renderHero(section, context);
    case "category_tiles":
      return renderTiles(section, context, "category");
    case "collection_tiles":
      return renderTiles(section, context, "collection");
    case "product_rail":
      return renderProductRail(section, context);
    case "shop_rail":
      return renderShopRail(section, context);
    case "editorial":
      return renderEditorial(section, context);
    case "rich_text":
      return renderRichText(section);
    case "trust":
      return renderTrust(section);
    default:
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[theme] unknown marketplace section type: ${section.type}`,
        );
      }
      return null;
  }
}

async function renderHero(
  section: MarketplaceSectionWire,
  { basePath }: ThemeRenderContext,
) {
  const settings = section.settings;
  const image = string(settings, "image_url");
  const link = safeLink(string(settings, "button_link"), basePath);
  const layout = string(settings, "layout");
  return (
    <MarketplaceSection surface="warm" className="py-0">
      <MarketplacePage
        className={`grid gap-0 bg-marketplace-surface-warm px-0 ${image && layout !== "centered" ? "md:grid-cols-2" : ""}`}
      >
        <div
          className={`flex flex-col justify-center px-6 py-12 md:px-12 md:py-20 ${layout === "centered" || !image ? "items-center text-center" : layout === "image_left" ? "md:order-last" : ""}`}
        >
          {string(settings, "eyebrow") && (
            <p className="text-xs uppercase tracking-widest text-marketplace-brand">
              {string(settings, "eyebrow")}
            </p>
          )}
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-marketplace-brand md:text-6xl">
            {string(settings, "heading")}
          </h1>
          {string(settings, "subheading") && (
            <p className="mt-5 max-w-xl text-marketplace-muted-foreground">
              {string(settings, "subheading")}
            </p>
          )}
          {link && string(settings, "button_text") && (
            <Link
              className="mt-8 w-fit border-b border-marketplace-brand pb-1 text-marketplace-brand"
              href={link}
            >
              {string(settings, "button_text")}
            </Link>
          )}
        </div>
        {image && (
          <div
            className={`min-h-72 md:min-h-[32rem] ${layout === "image_left" ? "md:order-first" : ""}`}
          >
            <img src={image} alt="" className="h-full w-full object-cover" />
          </div>
        )}
      </MarketplacePage>
    </MarketplaceSection>
  );
}

async function renderTiles(
  section: MarketplaceSectionWire,
  { basePath }: ThemeRenderContext,
  kind: "category" | "collection",
) {
  const settings = section.settings;
  const selected = ids(
    settings,
    kind === "category" ? "category_ids" : "collection_ids",
  );
  if (!selected.length) return null;
  const client = getClient();
  const response =
    kind === "category"
      ? await client.categories.list({ id_in: selected, limit: 24 })
      : await client.collections.list({ id_in: selected, limit: 24 });
  const items = new Map(response.data.map((item) => [item.id, item]));
  const visible = selected.flatMap((id) => {
    const item = items.get(id);
    if (!item) return [];
    return [
      {
        id: item.id,
        name: item.name,
        href: `${basePath}/${kind === "category" ? "c" : "collections"}/${item.permalink}`,
        image: typeof item.image_url === "string" ? item.image_url : null,
      },
    ];
  });
  if (!visible.length) return null;
  return (
    <MarketplaceSection className="py-[var(--cms-section-spacing)]">
      <MarketplacePage>
        <MarketplaceSectionHeader title={string(settings, "heading")} />
        <div
          className={
            string(settings, "layout") === "rail"
              ? "flex gap-5 overflow-x-auto pb-2"
              : "grid grid-cols-2 gap-5 md:grid-cols-4"
          }
        >
          {visible.map((item) => (
            <Link key={item.id} href={item.href} className="group">
              <div
                className={`aspect-[4/3] bg-marketplace-surface-warm ${string(settings, "layout") === "rail" ? "w-56 shrink-0" : ""}`}
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <h3 className="mt-3 font-medium text-marketplace-foreground group-hover:text-marketplace-brand">
                {item.name}
              </h3>
            </Link>
          ))}
        </div>
      </MarketplacePage>
    </MarketplaceSection>
  );
}

async function renderProductRail(
  section: MarketplaceSectionWire,
  context: ThemeRenderContext,
) {
  const settings = section.settings;
  const source = string(settings, "source");
  const sort =
    string(settings, "strategy") === "newest"
      ? "newest"
      : string(settings, "strategy") === "best_selling"
        ? "popular"
        : undefined;
  let products: Product[] = [];
  if (source === "trending")
    products = await listRecommendationProducts("trending");
  else if (source === "new_arrivals")
    products = await listRecommendationProducts("new");
  else if (source === "collection") {
    products = await listCatalogProducts({
      collection_id: string(settings, "collection_id"),
      limit: limit(section),
      sort,
    });
  } else if (source === "category") {
    products = await listCatalogProducts({
      category_id: string(settings, "category_id"),
      limit: limit(section),
      sort,
    });
  } else if (source === "manual") {
    const selected = ids(settings, "manual_product_ids");
    const fetched = await listCatalogProducts({
      id_in: selected,
      limit: 24,
      expand: ["seller"],
    });
    const byId = new Map(fetched.map((product) => [product.id, product]));
    products = selected.flatMap((id) => byId.get(id) || []);
  }
  if (!products.length) return null;
  return (
    <ProductRecommendationRail
      title={string(settings, "heading")}
      products={products}
      basePath={context.basePath}
      currency={context.currency}
      locale={context.locale}
      listId={listId(context, section, "product-rail")}
    />
  );
}

async function renderShopRail(
  section: MarketplaceSectionWire,
  context: ThemeRenderContext,
) {
  const settings = section.settings;
  const source = string(settings, "source");
  let sellers: Seller[] = [];
  if (source === "manual") {
    const selected = ids(settings, "manual_seller_ids");
    const response = await getClient().sellers.list({
      id_in: selected,
      limit: 24,
    });
    const byId = new Map(response.data.map((seller) => [seller.id, seller]));
    sellers = selected.flatMap((id) => byId.get(id) || []);
  } else {
    const response = await getClient().sellers.list({
      limit: limit(section),
      sort: source || "popular",
    });
    sellers = response.data;
  }
  if (!sellers.length) return null;
  return (
    <MarketplaceSection
      className="py-[var(--cms-section-spacing)]"
      data-list-id={listId(context, section, "shop-rail")}
    >
      <MarketplacePage>
        <MarketplaceSectionHeader title={string(settings, "heading")} />
        <MarketplaceRail>
          {sellers.map((seller) => (
            <ShopCard
              key={seller.id}
              seller={seller}
              basePath={context.basePath}
              locale={context.locale}
            />
          ))}
        </MarketplaceRail>
      </MarketplacePage>
    </MarketplaceSection>
  );
}

async function renderEditorial(
  section: MarketplaceSectionWire,
  { basePath }: ThemeRenderContext,
) {
  const settings = section.settings;
  const image = string(settings, "image_url");
  const link = safeLink(string(settings, "button_link"), basePath);
  return (
    <MarketplaceSection
      surface="warm"
      className="py-[var(--cms-section-spacing)]"
    >
      <MarketplacePage className="grid items-center gap-8 bg-marketplace-surface-warm md:grid-cols-2">
        <div
          className={
            string(settings, "image_position") === "left" ? "md:order-last" : ""
          }
        >
          {string(settings, "eyebrow") && (
            <p className="text-xs uppercase tracking-widest text-marketplace-brand">
              {string(settings, "eyebrow")}
            </p>
          )}
          <h2 className="mt-3 font-display text-3xl font-semibold text-marketplace-brand">
            {string(settings, "heading")}
          </h2>
          {string(settings, "body") && (
            <p className="mt-4 text-marketplace-muted-foreground">
              {string(settings, "body")}
            </p>
          )}
          {link && string(settings, "button_text") && (
            <Link
              className="mt-6 inline-block border-b border-marketplace-brand pb-1 text-marketplace-brand"
              href={link}
            >
              {string(settings, "button_text")}
            </Link>
          )}
        </div>
        {image && (
          <div className="min-h-64">
            <img src={image} alt="" className="h-full w-full object-cover" />
          </div>
        )}
      </MarketplacePage>
    </MarketplaceSection>
  );
}

async function renderRichText(section: MarketplaceSectionWire) {
  const blocks = Array.isArray(section.settings.blocks)
    ? section.settings.blocks
    : [];
  return (
    <MarketplaceSection className="py-[var(--cms-section-spacing)]">
      <MarketplacePage className="max-w-3xl">
        {blocks.map((block, index) => {
          const typed = block as { type?: string; text?: string };
          if (typed.type === "heading") {
            return (
              <h2
                key={index}
                className="mt-8 font-display text-2xl font-semibold"
              >
                {typed.text}
              </h2>
            );
          }
          return (
            <p key={index} className="mt-4 text-marketplace-muted-foreground">
              {typed.text}
            </p>
          );
        })}
      </MarketplacePage>
    </MarketplaceSection>
  );
}

async function renderTrust(section: MarketplaceSectionWire) {
  return (
    <MarketplaceSection className="py-[var(--cms-section-spacing)]">
      <MarketplacePage className="border-t border-marketplace-border-subtle text-center">
        <h2 className="font-display text-2xl font-semibold text-marketplace-brand">
          {string(section.settings, "heading")}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-marketplace-muted-foreground">
          {string(section.settings, "body")}
        </p>
      </MarketplacePage>
    </MarketplaceSection>
  );
}
