import { describe, expect, it } from "vitest";
import { resolveThemeSetting } from "./dynamic-source";
import type { ProductThemeContext } from "./types";
import type { PageThemeContext, CollectionThemeContext } from "./types";

const productContext: ProductThemeContext = {
  kind: "product",
  basePath: "/us/en",
  locale: "en",
  country: "us",
  product: {
    id: "prod_1",
    name: "Mug",
    slug: "mug",
    description: "A mug",
  } as ProductThemeContext["product"],
};

describe("resolveThemeSetting", () => {
  it("returns literals unchanged", () => {
    expect(resolveThemeSetting("Made for you", productContext)).toBe(
      "Made for you",
    );
  });

  it("resolves allowed dynamic paths", () => {
    expect(
      resolveThemeSetting(
        { source: "current_product", path: "name" },
        productContext,
      ),
    ).toBe("Mug");
  });

  it("rejects disallowed paths", () => {
    expect(
      resolveThemeSetting(
        { source: "current_product", path: "metadata" },
        productContext,
        "fallback",
      ),
    ).toBe("fallback");
  });

  it("uses fallback when value missing", () => {
    expect(resolveThemeSetting(undefined, productContext, "default")).toBe(
      "default",
    );
  });

  it("resolves seller and category properties from product context", () => {
    const context = {
      ...productContext,
      categoryId: "cat_2",
      product: {
        ...productContext.product,
        seller_name: "Maker Shop",
        seller_slug: "maker-shop",
        categories: [
          { id: "cat_1", name: "First", permalink: "first" },
          { id: "cat_2", name: "Second", permalink: "second" },
        ],
      },
    } as ProductThemeContext;

    expect(resolveThemeSetting({ source: "current_seller", path: "name" }, context)).toBe("Maker Shop");
    expect(resolveThemeSetting({ source: "current_seller", path: "slug" }, context)).toBe("maker-shop");
    expect(resolveThemeSetting({ source: "current_category", path: "name" }, context)).toBe("Second");
    expect(resolveThemeSetting({ source: "current_category", path: "slug" }, context)).toBe("second");
  });

  it("resolves page name and slug separately", () => {
    const context: PageThemeContext = {
      kind: "page", basePath: "/us/en", locale: "en", country: "us",
      pageId: "page_1", pageSlug: "our-story", pageName: "Our Story",
      page: { id: 'page_1', name: 'Our Story', slug: 'our-story', page_type: 'page', status: 'published', seo: { title: null, description: null }, version: 1, sections: [], published_at: null },
    };
    expect(resolveThemeSetting({ source: "current_page", path: "name" }, context)).toBe("Our Story");
    expect(resolveThemeSetting({ source: "current_page", path: "slug" }, context)).toBe("our-story");
  });

  it("resolves collection values when collection context provides them", () => {
    const context: CollectionThemeContext = {
      kind: "collection", basePath: "/us/en", locale: "en", country: "us",
      collectionId: "collection_1", collectionName: "New Arrivals", collectionSlug: "new-arrivals",
    };
    expect(resolveThemeSetting({ source: "current_collection", path: "name" }, context)).toBe("New Arrivals");
    expect(resolveThemeSetting({ source: "current_collection", path: "slug" }, context)).toBe("new-arrivals");
  });

  it("resolves the store name", () => {
    expect(resolveThemeSetting({ source: "store", path: "name" }, productContext)).toBeTruthy();
  });
});
