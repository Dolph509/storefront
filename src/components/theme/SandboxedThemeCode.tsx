import { Liquid } from "liquidjs";
import { getClient, getLocaleOptions } from "@/lib/spree";
import type { ThemeRenderContext } from "@/lib/theme/types";

async function liquidScope(context: ThemeRenderContext) {
  const scope: Record<string, unknown> = {
    localization: {
      language: context.locale,
      country: context.country,
      currency: context.currency || "",
    },
    routes: {
      root_url: `${context.basePath}/`,
      all_products_collection_url: `${context.basePath}/products`,
      cart_url: `${context.basePath}/cart`,
    },
  };

  if (context.kind === "product") {
    const product = context.product;
    scope.product = {
      id: product.id,
      name: product.name,
      title: product.name,
      description: product.description || "",
      description_html: product.description_html || "",
      slug: product.slug,
      available: product.available,
      price: product.price,
      compare_at_price: product.price?.compare_at_amount_in_cents,
      url: `${context.basePath}/products/${product.slug}`,
      variants: (product.variants || []).map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        price: variant.price,
      })),
    };
  }

  if (context.kind === "collection") {
    try {
      const collection = await getClient().collections.get(
        context.collectionId,
        undefined,
        await getLocaleOptions(),
      );
      scope.collection = {
        id: collection.id,
        title: collection.name,
        name: collection.name,
        description: collection.description,
        description_html: collection.description_html,
        products_count: collection.products_count,
        url: `${context.basePath}/collections/${collection.permalink || context.collectionId}`,
      };
    } catch {
      scope.collection = {
        id: context.collectionId,
        title: "",
        name: "",
        url: `${context.basePath}/collections/${context.collectionId}`,
      };
    }
  }

  if (context.kind === "seller") {
    scope.shop = {
      name: "",
      url: `${context.basePath}/shops/${context.sellerSlug}`,
      slug: context.sellerSlug,
    };
  }

  return scope;
}

export async function SandboxedThemeCode({
  code,
  context,
  title = "Custom theme content",
}: {
  code: string;
  context: ThemeRenderContext;
  title?: string;
}) {
  if (!code.trim()) return null;

  let output: string;
  try {
    const liquid = new Liquid({
      templates: {},
      root: [],
      partials: [],
      layouts: [],
      relativeReference: false,
      dynamicPartials: false,
      ownPropertyOnly: true,
      strictVariables: false,
      parseLimit: 5_000,
      renderLimit: 100,
      memoryLimit: 100_000,
    });
    output = await liquid.parseAndRender(code, await liquidScope(context), {
      ownPropertyOnly: true,
      strictVariables: false,
      templateLimit: 2_000,
      renderLimit: 100,
      memoryLimit: 100_000,
    });
  } catch {
    output = "";
  }

  return (
    <iframe
      title={title}
      sandbox=""
      referrerPolicy="no-referrer"
      loading="lazy"
      srcDoc={output}
      className="block min-h-40 w-full border-0"
    />
  );
}
