import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const productCatalog = vi.hoisted(() => ({
  list: vi.fn(async () => ({ data: [] })),
  pages: vi.fn(async () => ({
    data: [] as Array<{
      id: string;
      name: string;
      slug: string;
      page_type: string;
      seo?: { description?: string | null };
      published_at?: string | null;
    }>,
  })),
  collectionGet: vi.fn(async () => ({
    id: "collection-1",
    name: "Featured collection",
    permalink: "featured",
    products_count: 0,
  })),
  collectionProductsList: vi.fn(async () => ({ data: [] })),
}));
vi.mock("@/lib/spree", () => ({
  getClient: () => ({
    request: productCatalog.pages,
    products: { list: productCatalog.list },
    collections: {
      get: productCatalog.collectionGet,
      products: { list: productCatalog.collectionProductsList },
    },
  }),
  getLocaleOptions: async () => ({ country: "US", locale: "en" }),
  isWholesaleEnabled: () => false,
}));
vi.mock("@/components/products/FeaturedCollectionProductCard", () => ({
  FeaturedCollectionProductCard: ({
    parts,
  }: {
    parts: Array<{ type: string; settings: Record<string, unknown> }>;
  }) => {
    const settings = parts.find(
      (part) => part.type === "product_card",
    )?.settings;
    return (
      <article
        data-card-background={String(settings?.background_color)}
        data-card-border={String(settings?.border_style)}
        data-card-radius={String(settings?.corner_radius)}
        data-card-gap={String(settings?.vertical_gap)}
      />
    );
  },
}));

import {
  isMarketplaceSectionType,
  renderMarketplaceSection,
} from "./render-marketplace-sections";
import { SandboxedThemeCode } from "./SandboxedThemeCode";
import { ThemeBlockRenderer } from "./ThemeBlockRenderer";

const context = {
  kind: "home",
  basePath: "/us/en",
  locale: "en",
  country: "US",
} as const;

describe("theme section dispatch", () => {
  it("routes every registered Avone section family, including shoppable videos", () => {
    expect(isMarketplaceSectionType("shoppable_videos")).toBe(true);
    expect(isMarketplaceSectionType("image")).toBe(true);
  });

  it("renders Blog posts from published CMS article records", async () => {
    productCatalog.pages.mockResolvedValue({
      data: [
        {
          id: "cmsp_article1",
          name: "Meet the makers",
          slug: "meet-the-makers",
          page_type: "article",
          seo: { description: "Stories from our community." },
          published_at: "2026-09-01T00:00:00Z",
        },
        {
          id: "cmsp_article2",
          name: "A guide to gifting",
          slug: "gifting-guide",
          page_type: "article",
          seo: { description: "Thoughtful gifts, chosen well." },
          published_at: "2026-08-01T00:00:00Z",
        },
      ],
    });

    const node = await renderMarketplaceSection(
      {
        id: "blog-posts",
        type: "blog_posts",
        settings: {
          heading: "From the journal",
          source: "manual",
          page_ids: ["cmsp_article2", "cmsp_article1"],
          limit: 1,
        },
      },
      context,
    );
    const html = renderToStaticMarkup(node);

    expect(html).toContain("From the journal");
    expect(html).toContain("A guide to gifting");
    expect(html).toContain('href="/us/en/pages/gifting-guide"');
    expect(html).not.toContain("Meet the makers");
    expect(html).toContain("Thoughtful gifts, chosen well.");
    expect(productCatalog.pages).toHaveBeenCalledWith(
      "GET",
      "/cms/pages",
      expect.objectContaining({ params: { page_type: "article", limit: 50 } }),
    );
  });

  it("renders the standalone Image section without a blank text column", async () => {
    const node = await renderMarketplaceSection(
      {
        id: "image-section",
        type: "image",
        settings: {
          image_url: "/media/feature.jpg",
          heading: "Handmade details",
          body: "Designed by independent makers.",
          alt: "Handmade feature",
          image_ratio: "portrait",
          image_link: "/products/featured",
        },
      },
      context,
    );
    const html = renderToStaticMarkup(node);
    expect(html).toContain('src="/media/feature.jpg"');
    expect(html).toContain('alt="Handmade feature"');
    expect(html).toContain('href="/products/featured"');
    expect(html).toContain("Handmade details");
    expect(html).toContain("Designed by independent makers.");
    expect(html).not.toContain("<h2");
  });

  it("applies the selected image layout and aspect ratio", async () => {
    const carousel = await renderMarketplaceSection(
      {
        id: "image-carousel",
        type: "image_carousel",
        settings: {
          image_urls: ["/media/one.jpg"],
          image_ratio: "square",
        },
      },
      context,
    );
    const masonry = await renderMarketplaceSection(
      {
        id: "image-masonry-ratio",
        type: "image_masonry",
        settings: {
          image_urls: ["/media/two.jpg"],
          image_ratio: "portrait",
        },
      },
      context,
    );
    const gallery = await renderMarketplaceSection(
      {
        id: "image-gallery-masonry-layout",
        type: "image_gallery",
        settings: {
          image_urls: ["/media/three.jpg"],
          layout: "masonry",
        },
      },
      context,
    );
    const carouselGrid = await renderMarketplaceSection(
      {
        id: "image-carousel-grid-layout",
        type: "image_carousel",
        settings: {
          image_urls: ["/media/four.jpg"],
          layout: "grid",
        },
      },
      context,
    );
    const adaptedGallery = await renderMarketplaceSection(
      {
        id: "image-gallery-adapt-layout",
        type: "image_gallery",
        settings: { image_urls: ["/media/five.jpg"], image_ratio: "adapt" },
      },
      context,
    );

    expect(renderToStaticMarkup(carousel)).toContain("aspect-ratio:1 / 1");
    expect(renderToStaticMarkup(carousel)).toContain(
      'data-theme-image-layout="carousel"',
    );
    expect(renderToStaticMarkup(masonry)).toContain("aspect-ratio:4 / 5");
    expect(renderToStaticMarkup(gallery)).toContain(
      'data-theme-image-layout="masonry"',
    );
    expect(renderToStaticMarkup(carouselGrid)).toContain(
      'data-theme-image-layout="grid"',
    );
    expect(renderToStaticMarkup(adaptedGallery)).not.toContain("aspect-ratio");
  });

  it("expands seller and media for product rail listings", async () => {
    productCatalog.list.mockClear();
    await renderMarketplaceSection(
      {
        id: "all-products",
        type: "product_rail",
        settings: { source: "all", limit: 8 },
      },
      context,
    );

    expect(productCatalog.list).toHaveBeenCalledWith(
      expect.objectContaining({
        expand: expect.arrayContaining(["seller", "media"]),
      }),
      expect.anything(),
    );
  });

  it("renders configured body copy in image masonry and image comparison sections", async () => {
    const masonry = await renderMarketplaceSection(
      {
        id: "image-masonry",
        type: "image_masonry",
        settings: {
          heading: "Maker stories",
          body: "A closer look at how each piece is made.",
          image_urls: ["/media/maker.jpg"],
        },
      },
      context,
    );
    const comparison = await renderMarketplaceSection(
      {
        id: "image-comparison",
        type: "image_comparison",
        settings: {
          heading: "Before and after",
          body: "Drag the handle to compare.",
          before_image_url: "/media/before.jpg",
          after_image_url: "/media/after.jpg",
        },
      },
      context,
    );

    expect(renderToStaticMarkup(masonry)).toContain(
      "A closer look at how each piece is made.",
    );
    expect(renderToStaticMarkup(comparison)).toContain(
      "Drag the handle to compare.",
    );
  });

  it("renders Banners content, secondary images, alignment, and links as configured", async () => {
    const node = await renderMarketplaceSection(
      {
        id: "banner-grid",
        type: "banners",
        settings: {
          heading: "Featured makers",
          eyebrow: "Shop small",
          body: "Meet independent sellers.",
          image_urls: ["/media/banner-one.jpg"],
          image_url: "/media/banner-two.jpg",
          secondary_image_url: "/media/banner-three.jpg",
          alignment: "right",
          image_position: "right",
          button_text: "Explore",
          button_link: "/collections/featured",
        },
      },
      context,
    );
    const html = renderToStaticMarkup(node);

    expect(html).toContain("Shop small");
    expect(html).toContain("Meet independent sellers.");
    expect(html).toContain('src="/media/banner-two.jpg"');
    expect(html).toContain('src="/media/banner-three.jpg"');
    expect(html).toContain("text-right");
    expect(html).toContain("Explore");
    expect(html).toContain('href="/collections/featured"');

    const unlinkedNode = await renderMarketplaceSection(
      {
        id: "unlinked-banner-grid",
        type: "banners",
        settings: {
          image_urls: ["/media/banner-one.jpg"],
          button_text: "Explore",
        },
      },
      context,
    );
    expect(renderToStaticMarkup(unlinkedNode)).not.toContain(
      'href="/products"',
    );
  });

  it("applies editorial text alignment from section settings", async () => {
    const node = await renderMarketplaceSection(
      {
        id: "editorial-right-aligned",
        type: "image_with_text",
        settings: {
          heading: "Made by hand",
          body: "A story about the maker.",
          image_url: "/media/maker.jpg",
          alignment: "right",
        },
      },
      context,
    );

    expect(renderToStaticMarkup(node)).toContain("text-right");
  });

  it("uses the theme border color when a divider selects the palette color", async () => {
    const node = await renderMarketplaceSection(
      {
        id: "palette-divider",
        type: "divider",
        settings: { color: "palette", thickness: 2 },
      },
      context,
    );

    expect(renderToStaticMarkup(node)).toContain(
      "border-top:2px solid var(--marketplace-border)",
    );
  });

  it("renders scrolling content as an automatically looped accessible track", async () => {
    const node = await renderMarketplaceSection(
      {
        id: "scrolling-messages",
        type: "scrolling_content",
        settings: { messages: "Free shipping|Made by independent sellers" },
      },
      context,
    );
    const markup = renderToStaticMarkup(node);

    expect(markup).toContain('data-theme-scrolling-content="true"');
    expect(markup).toContain("theme-scrolling-content-track");
    expect(markup).toContain(
      'aria-label="Free shipping|Made by independent sellers"',
    );
    expect(markup).toContain('aria-hidden="true"');
  });

  it("embeds safe Google Maps embed URLs in the Map section", async () => {
    const node = await renderMarketplaceSection(
      {
        id: "maker-map",
        type: "map",
        settings: {
          heading: "Visit our studio",
          address: "12 Maker Lane",
          map_url: "https://www.google.com/maps/embed?pb=example",
        },
      },
      context,
    );
    const markup = renderToStaticMarkup(node);

    expect(markup).toContain('<iframe title="Visit our studio: 12 Maker Lane"');
    expect(markup).toContain(
      'src="https://www.google.com/maps/embed?pb=example"',
    );
    expect(markup).toContain(
      'href="https://www.google.com/maps/embed?pb=example"',
    );
  });

  it("leaves optional map and hero links empty instead of linking to products", async () => {
    const map = await renderMarketplaceSection(
      {
        id: "map",
        type: "map",
        settings: { heading: "Visit us", address: "Main Street" },
      },
      context,
    );
    const hero = await renderMarketplaceSection(
      {
        id: "unlinked-hero",
        type: "hero",
        settings: { heading: "New arrivals", button_text: "Shop now" },
      },
      context,
    );

    const mapHtml = renderToStaticMarkup(map);
    const heroHtml = renderToStaticMarkup(hero);
    expect(mapHtml).not.toContain("Open map");
    expect(mapHtml).not.toContain('href="/us/en/products"');
    expect(heroHtml).not.toContain('href="/us/en/products"');
    expect(heroHtml).not.toContain('data-theme-hero-link="true"');
  });

  it("loads catalog products for product sections configured to show all products", async () => {
    productCatalog.list.mockClear();
    await renderMarketplaceSection(
      {
        id: "all-products",
        type: "products_listing",
        settings: { source: "all", product_count: 6 },
      },
      context,
    );
    expect(productCatalog.list).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 24 }),
      expect.objectContaining({ country: "US", locale: "en" }),
    );
  });

  it("applies common Avone section width, spacing, colors and padding settings", async () => {
    const node = await renderMarketplaceSection(
      {
        id: "countdown-test",
        type: "countdown_timer",
        settings: {
          heading: "Sale ends soon",
          width: "full",
          gap: 36,
          background_color: "#f6f1e8",
          text_color: "#222222",
          padding_top: 52,
          padding_bottom: 28,
        },
      },
      context,
    );
    const html = renderToStaticMarkup(node);

    expect(html).toContain("max-w-none");
    expect(html).toContain("background-color:#f6f1e8");
    expect(html).toContain(
      "padding-top:calc(52px * var(--cms-section-spacing-scale, 1))",
    );
    expect(html).toContain(
      "padding-bottom:calc(28px * var(--cms-section-spacing-scale, 1))",
    );
    expect(html).toContain("color:#222222");
    expect(html).toContain("gap:36px");
  });

  it("renders the carousel-only basic blocks and omits them in grid mode", async () => {
    const section = {
      id: "carousel-content",
      type: "featured_collection",
      settings: {
        collection_id: "collection-1",
        type: "carousel",
        product_cards: false,
      },
      blockOrder: ["extra-heading", "extra-text", "extra-button"],
      blocks: {
        "extra-heading": {
          type: "heading",
          settings: { text: "Seasonal highlights" },
        },
        "extra-text": {
          type: "text",
          settings: { text: "Independent makers and gifts." },
        },
        "extra-button": {
          type: "button",
          settings: { label: "Shop now", link: "/products" },
        },
      },
    };
    const carousel = renderToStaticMarkup(
      await renderMarketplaceSection(section, context),
    );
    const grid = renderToStaticMarkup(
      await renderMarketplaceSection(
        {
          ...section,
          id: "grid-content",
          settings: { ...section.settings, type: "grid" },
        },
        context,
      ),
    );

    expect(carousel).toContain("Seasonal highlights");
    expect(carousel).toContain("Independent makers and gifts.");
    expect(carousel).toContain("Shop now");
    expect(grid).not.toContain("Seasonal highlights");
    expect(grid).not.toContain("Independent makers and gifts.");
    expect(grid).not.toContain("Shop now");
  });

  it("renders collection title rich text safely", async () => {
    const markup = renderToStaticMarkup(
      await renderMarketplaceSection(
        {
          id: "rich-collection-title",
          type: "featured_collection",
          settings: {
            collection_id: "collection-1",
            type: "carousel",
            product_cards: false,
          },
          blockOrder: ["header", "title"],
          blocks: {
            header: { type: "collection_header", settings: {} },
            title: {
              type: "collection_title",
              parent_id: "header",
              settings: {
                text: "<p>Made <strong>for makers</strong><script>bad()</script></p>",
              },
            },
          },
        },
        context,
      ),
    );

    expect(markup).toContain("Made <strong>for makers</strong>");
    expect(markup).not.toContain("<script>");
    expect(markup).not.toContain("bad()");
  });

  it("does not render carousel header and collection title blocks in grid mode", async () => {
    const markup = renderToStaticMarkup(
      await renderMarketplaceSection(
        {
          id: "grid-header-blocks",
          type: "featured_collection",
          settings: {
            collection_id: "collection-1",
            type: "grid",
            product_cards: false,
          },
          blockOrder: ["header", "title", "view-all"],
          blocks: {
            header: {
              type: "collection_header",
              settings: { background_color: "#ff0000" },
            },
            title: {
              type: "collection_title",
              parent_id: "header",
              settings: { text: "Carousel-only title" },
            },
            "view-all": {
              type: "view_all_button",
              parent_id: "header",
              settings: { label: "Carousel-only view all" },
            },
          },
        },
        context,
      ),
    );

    expect(markup).not.toContain("Carousel-only title");
    expect(markup).not.toContain("Carousel-only view all");
    expect(markup).not.toContain("background-color:#ff0000");
  });

  it("renders featured collection header image and video backgrounds from the media setting", async () => {
    const makeSection = (
      backgroundMedia: string,
      blockSettings: Record<string, unknown>,
    ) => ({
      id: `featured-${backgroundMedia}`,
      type: "featured_collection",
      settings: {
        collection_id: "collection-1",
        type: "carousel",
        product_cards: false,
      },
      blockOrder: ["collection-header"],
      blocks: {
        "collection-header": {
          type: "collection_header",
          settings: { background_media: backgroundMedia, ...blockSettings },
        },
      },
    });
    const image = renderToStaticMarkup(
      await renderMarketplaceSection(
        makeSection("image", {
          background_color: "palette",
          background_image_url: "/media/header.jpg",
        }),
        context,
      ),
    );
    const video = renderToStaticMarkup(
      await renderMarketplaceSection(
        makeSection("video", { background_video_url: "/media/header.mp4" }),
        context,
      ),
    );

    expect(image).toContain('src="/media/header.jpg"');
    expect(image).toContain("background-color:var(--marketplace-surface-warm)");
    expect(video).toContain('src="/media/header.mp4"');
    expect(video).toContain("autoPlay");
    expect(video).toContain("loop");
  });

  it("applies custom featured collection header dimensions", async () => {
    const markup = renderToStaticMarkup(
      await renderMarketplaceSection(
        {
          id: "featured-custom-header-size",
          type: "featured_collection",
          settings: {
            collection_id: "collection-1",
            type: "carousel",
            product_cards: false,
          },
          blockOrder: ["header"],
          blocks: {
            header: {
              type: "collection_header",
              settings: {
                width: "custom",
                width_custom: 560,
                mobile_width: "custom",
                mobile_width_custom: 340,
                height: "custom",
                height_custom: 280,
              },
            },
          },
        },
        context,
      ),
    );

    expect(markup).toContain("width:560px");
    expect(markup).toContain("min-height:280px");
    expect(markup).toContain("featured-header-mobile-custom");
    expect(markup).toContain("width:340px!important");
  });

  it("applies collection title palette colors and header alignment", async () => {
    const markup = renderToStaticMarkup(
      await renderMarketplaceSection(
        {
          id: "featured-header-palette",
          type: "featured_collection",
          settings: {
            collection_id: "collection-1",
            type: "carousel",
            product_cards: false,
          },
          blockOrder: ["header", "title"],
          blocks: {
            header: {
              type: "collection_header",
              settings: { alignment: "center" },
            },
            title: {
              type: "collection_title",
              parent_id: "header",
              settings: {
                text: "Collection title",
                text_color: "palette",
                background_enabled: true,
                background_color: "palette",
              },
            },
          },
        },
        context,
      ),
    );

    expect(markup).toContain("--marketplace-foreground");
    expect(markup).toContain("--marketplace-surface-warm");
    expect(markup).toContain("text-align:center");
  });

  it("shows the View all button unconditionally when Show if more is off", async () => {
    productCatalog.collectionGet.mockImplementationOnce(async () => ({
      id: "collection-1",
      name: "Featured collection",
      permalink: "featured",
      products_count: 1,
    }));
    productCatalog.collectionProductsList.mockImplementationOnce(async () => ({
      data: [{ id: "prod-1" } as never],
    }));

    const markup = renderToStaticMarkup(
      await renderMarketplaceSection(
        {
          id: "featured-view-all-always",
          type: "featured_collection",
          settings: {
            collection_id: "collection-1",
            type: "carousel",
            product_count: 1,
            product_cards: false,
          },
          blockOrder: ["view-all"],
          blocks: {
            "view-all": {
              type: "view_all_button",
              settings: {
                label: "View all",
                show_if_more: false,
                style: "secondary",
                open_in_new_tab: true,
                desktop_width: "custom",
                mobile_width: "fit",
              },
            },
          },
        },
        context,
      ),
    );

    expect(markup).toContain("View all");
    expect(markup).toContain('href="/us/en/collections/featured"');
    expect(markup).toContain('data-slot="button"');
    expect(markup).toContain('data-variant="secondary"');
    expect(markup).toContain('target="_blank"');
    expect(markup).toContain("w-fit md:w-full");
  });

  it("only shows View all when there are more products if Show if more is on", async () => {
    const renderButton = async (productsCount: number) => {
      productCatalog.collectionGet.mockImplementationOnce(async () => ({
        id: "collection-1",
        name: "Featured collection",
        permalink: "featured",
        products_count: productsCount,
      }));
      productCatalog.collectionProductsList.mockImplementationOnce(
        async () => ({
          data: [{ id: "prod-1" } as never],
        }),
      );
      const node = await renderMarketplaceSection(
        {
          id: `featured-view-all-${productsCount}`,
          type: "featured_collection",
          settings: {
            collection_id: "collection-1",
            type: "carousel",
            product_count: 1,
            product_cards: false,
          },
          blockOrder: ["view-all"],
          blocks: {
            "view-all": {
              type: "view_all_button",
              settings: { label: "View all", show_if_more: true },
            },
          },
        },
        context,
      );
      return renderToStaticMarkup(node);
    };

    expect(await renderButton(1)).not.toContain("View all");
    expect(await renderButton(2)).toContain("View all");
  });

  it("scopes section custom CSS to its own content", async () => {
    const markup = renderToStaticMarkup(
      await renderMarketplaceSection(
        {
          id: "custom-css-text-section",
          type: "text",
          settings: {
            heading: "Made for makers",
            body: "Thoughtfully selected goods.",
            custom_css: ".custom-title { color: #123456; }",
          },
        },
        context,
      ),
    );

    expect(markup).toContain(
      'data-theme-custom-section="custom-css-text-section"',
    );
    expect(markup).toContain(
      '[data-theme-custom-section="custom-css-text-section"] .custom-title',
    );
    expect(markup).toContain("Made for makers");
  });

  it("passes the product card parent settings to storefront product cards", async () => {
    productCatalog.collectionProductsList.mockImplementationOnce(async () => ({
      data: [{ id: "prod-1" } as never],
    }));
    const node = await renderMarketplaceSection(
      {
        id: "featured-card-settings",
        type: "featured_collection",
        settings: {
          collection_id: "collection-1",
          type: "grid",
          carousel_on_mobile: true,
        },
        blockOrder: ["product-card", "media"],
        blocks: {
          "product-card": {
            type: "product_card",
            settings: {
              background_color: "#fefefe",
              border_style: "solid",
              corner_radius: 12,
              vertical_gap: 9,
            },
          },
          media: {
            type: "media",
            parent_id: "product-card",
            settings: {},
          },
        },
      },
      context,
    );
    const html = renderToStaticMarkup(node);

    expect(html).toContain('data-card-background="#fefefe"');
    expect(html).toContain('data-card-border="solid"');
    expect(html).toContain('data-card-radius="12"');
    expect(html).toContain('data-card-gap="9"');
    expect(html).not.toContain(
      'class="featured-collection-grid featured-mobile-carousel"',
    );
  });

  it("enables mobile scrolling only for a featured carousel", async () => {
    productCatalog.collectionProductsList.mockImplementationOnce(async () => ({
      data: [{ id: "prod-1" } as never],
    }));
    const node = await renderMarketplaceSection(
      {
        id: "featured-mobile-carousel",
        type: "featured_collection",
        settings: {
          collection_id: "collection-1",
          type: "carousel",
          carousel_on_mobile: true,
        },
        blockOrder: ["product-card", "media"],
        blocks: {
          "product-card": { type: "product_card", settings: {} },
          media: { type: "media", parent_id: "product-card", settings: {} },
        },
      },
      context,
    );

    expect(renderToStaticMarkup(node)).toContain("featured-mobile-carousel");
  });

  it("renders custom Liquid tags and variables in an isolated frame", async () => {
    const node = await SandboxedThemeCode({
      code: "{% assign items = 'a,b,c' | split: ',' %}<strong>{{ localization.language | upcase }}</strong>{% for item in items %}<i>{{ item }}</i>{% endfor %}",
      context,
    });
    const markup = renderToStaticMarkup(node);

    expect(markup).toContain("<iframe");
    expect(markup).toContain('sandbox=""');
    expect(markup).toContain(
      "&lt;strong&gt;EN&lt;/strong&gt;&lt;i&gt;a&lt;/i&gt;&lt;i&gt;b&lt;/i&gt;&lt;i&gt;c&lt;/i&gt;",
    );
    expect(markup).not.toContain("<pre");
  });

  it("renders ordered blocks and nested group blocks in regular Avone sections", async () => {
    const node = await renderMarketplaceSection(
      {
        id: "rich-content",
        type: "text",
        settings: { heading: "Section body", body: "Intro copy" },
        blockOrder: ["content-group", "content-heading"],
        blocks: {
          "content-group": {
            type: "group",
            settings: { direction: "horizontal", gap: 12 },
          },
          "content-heading": {
            type: "heading",
            parent_id: "content-group",
            settings: { text: "Nested content", level: "h2" },
          },
        },
      },
      context,
    );
    const html = renderToStaticMarkup(node);

    expect(html).toContain("Section body");
    expect(html).toContain("Intro copy");
    expect(html).toMatch(
      /data-theme-section-content[^>]*>[\s\S]*data-theme-section-blocks="rich-content"/,
    );
    expect(html).toContain('data-theme-block-id="content-group"');
    expect(html).toContain('data-theme-block-id="content-heading"');
    expect(html).toContain("Nested content");
  });

  it("renders Custom content blocks inside the section and preserves nesting", async () => {
    const node = await renderMarketplaceSection(
      {
        id: "custom-content-blocks",
        type: "custom_content",
        settings: { heading: "Made for makers", body: "Section introduction" },
        blockOrder: ["content-group", "content-heading", "content-button"],
        blocks: {
          "content-group": {
            type: "group",
            settings: { direction: "horizontal", gap: 12 },
          },
          "content-heading": {
            type: "heading",
            parent_id: "content-group",
            settings: { text: "Built with care" },
          },
          "content-button": {
            type: "button",
            settings: { label: "Explore makers", link: "/shops" },
          },
        },
      },
      context,
    );
    const html = renderToStaticMarkup(node);

    expect(html).toContain("Made for makers");
    expect(html).toContain("Section introduction");
    expect(html).toContain('data-theme-section-blocks="custom-content-blocks"');
    expect(html).toContain("Built with care");
    expect(html).toContain('href="/shops"');
    expect(html).not.toContain("max-w-[1400px] px-5 py-4");
  });

  it("lays out Custom content masonry blocks in responsive columns", async () => {
    const node = await renderMarketplaceSection(
      {
        id: "custom-content-masonry-blocks",
        type: "custom_content_masonry",
        settings: {},
        blockOrder: ["content-text"],
        blocks: {
          "content-text": {
            type: "text",
            settings: { text: "A flexible content block" },
          },
        },
      },
      context,
    );

    expect(renderToStaticMarkup(node)).toContain(
      "columns-1 gap-6 md:columns-2 lg:columns-3",
    );
  });

  it("keeps section blocks hidden when the parent section is disabled", async () => {
    const node = await renderMarketplaceSection(
      {
        id: "disabled-section",
        type: "text",
        enabled: false,
        settings: {},
        blockOrder: ["hidden-heading"],
        blocks: {
          "hidden-heading": {
            type: "heading",
            settings: { text: "Should stay hidden" },
          },
        },
      },
      context,
    );

    expect(node).toBeNull();
  });

  it("renders slideshow images in a horizontal carousel", async () => {
    const node = await renderMarketplaceSection(
      {
        id: "campaign-slideshow",
        type: "slideshow",
        settings: {
          heading: "Seasonal stories",
          slide_image_urls: [
            "https://cdn.example/slide-one.jpg",
            "https://cdn.example/slide-two.jpg",
          ],
        },
      },
      context,
    );
    const html = renderToStaticMarkup(node);

    expect(html).toContain("Seasonal stories");
    expect(html).toContain("flex snap-x overflow-x-auto");
    expect(html).toContain("slide-one.jpg");
    expect(html).toContain("slide-two.jpg");
    expect(html).toContain('aria-label="Previous slides"');
    expect(html).toContain('aria-label="Next slides"');
    expect(html).toContain('id="theme-home-slideshow-campaign-slideshow"');
  });

  it("renders Video popup button settings and rejects unsafe links", async () => {
    const renderVideoPopup = async (buttonLink: string) =>
      renderToStaticMarkup(
        await renderMarketplaceSection(
          {
            id: "video-popup-cta",
            type: "video_popup",
            settings: {
              video_url: "/media/story.mp4",
              heading: "Maker story",
              button_text: "Shop the collection",
              button_link: buttonLink,
            },
          },
          context,
        ),
      );

    const valid = await renderVideoPopup("/collections/handmade");
    const unsafe = await renderVideoPopup("javascript:alert(1)");
    expect(valid).toContain("Shop the collection");
    expect(valid).toContain('href="/collections/handmade"');
    expect(unsafe).not.toContain("Shop the collection");
    expect(unsafe).not.toContain("javascript:");
  });

  it("renders brand logos with matching labels", async () => {
    const node = await renderMarketplaceSection(
      {
        id: "brand-logos",
        type: "brands_list",
        settings: {
          heading: "Featured brands",
          items:
            "North Studio|https://north.example\nMoss & Co|https://moss.example",
          image_urls: [
            "https://cdn.example/north.svg",
            "https://cdn.example/moss.svg",
          ],
        },
      },
      context,
    );
    const html = renderToStaticMarkup(node);

    expect(html).toContain("Featured brands");
    expect(html).toContain("North Studio");
    expect(html).toContain("Moss &amp; Co");
    expect(html).toContain("north.svg");
    expect(html).toContain("moss.svg");
    expect(html).toContain("object-contain");
  });

  it("renders button groups and sandboxes custom code blocks", async () => {
    const buttons = renderToStaticMarkup(
      ThemeBlockRenderer({
        block: {
          type: "button_group",
          settings: {
            buttons: "Shop|/products\nBad|javascript:alert(1)",
            alignment: "center",
          },
        },
        context,
      }),
    );
    const codeBlock = ThemeBlockRenderer({
      block: { type: "custom_code", settings: { code: "<b>Safe preview</b>" } },
      context,
    });
    const codeProps = (codeBlock as React.ReactElement).props as {
      code: string;
      context: typeof context;
      title?: string;
    };
    const customCode = renderToStaticMarkup(
      await SandboxedThemeCode(codeProps),
    );

    expect(buttons).toContain('href="/products"');
    expect(buttons).toContain('data-slot="button"');
    expect(buttons).not.toContain("javascript:");
    expect(customCode).toContain('sandbox=""');
    expect(customCode).toContain("&lt;b&gt;Safe preview&lt;/b&gt;");
  });

  it("applies palette text to heading blocks and global button hooks to buttons", () => {
    const heading = renderToStaticMarkup(
      ThemeBlockRenderer({
        block: {
          type: "heading",
          settings: { text: "Shop the latest", text_color: "palette" },
        },
        context,
      }),
    );
    const button = renderToStaticMarkup(
      ThemeBlockRenderer({
        block: {
          type: "button",
          settings: { label: "Shop now", link: "/products", style: "primary" },
        },
        context,
      }),
    );

    expect(heading).toContain("var(--marketplace-foreground)");
    expect(button).toContain('data-slot="button"');
    expect(button).toContain('data-variant="default"');
  });

  it("renders rich text formatting while stripping unsafe markup", () => {
    const html = renderToStaticMarkup(
      ThemeBlockRenderer({
        block: {
          type: "heading",
          settings: {
            text: '<p><strong>Bold heading</strong><img src="x" onerror="alert(1)"><script>alert(2)</script></p>',
            level: "h2",
          },
        },
        context,
      }),
    );

    expect(html).toContain('role="heading" aria-level="2"');
    expect(html).toContain("<strong>Bold heading</strong>");
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("<script");
  });

  it("renders named icon blocks as sized storefront icons", () => {
    const html = renderToStaticMarkup(
      ThemeBlockRenderer({
        block: { type: "icon", settings: { name: "gift", size: "large" } },
        context,
      }),
    );

    expect(html).toContain('data-theme-icon="gift"');
    expect(html).toContain('width="32"');
    expect(html).toContain("title>gift icon</title>");
  });

  it("renders social media blocks as accessible icon links", () => {
    const html = renderToStaticMarkup(
      ThemeBlockRenderer({
        block: {
          type: "social_media",
          settings: {
            instagram: "https://instagram.com/store",
            facebook: "javascript:alert(1)",
          },
        },
        context,
      }),
    );

    expect(html).toContain('aria-label="Instagram"');
    expect(html).toContain('href="https://instagram.com/store"');
    expect(html).not.toContain("javascript:");
    expect(html).toContain('target="_blank"');
  });
});

describe("Hero theme settings", () => {
  it("renders the reference split hero with independently linked CTA and promo card", async () => {
    const node = await renderMarketplaceSection(
      {
        id: "split-hero",
        type: "hero",
        settings: {
          hero_variant: "split",
          media_1_image_url: "/media/design-award.jpg",
          media_2_image_url: "/media/trick-or-treat-bags.jpg",
          subheading: "Trick-or-treat bags with personality",
          promo_link: "/collections/trick-or-treat",
          split_background_color: "#ffad00",
        },
        blockOrder: ["headline", "main-cta"],
        blocks: {
          headline: {
            type: "heading",
            settings: { text: "Meet the Etsy Design Awards Finalists" },
          },
          "main-cta": {
            type: "button",
            settings: {
              label: "Get inspired",
              link: "/collections/design-awards",
            },
          },
        },
      },
      context,
    );
    const html = renderToStaticMarkup(node);

    expect(html).toContain("Meet the Etsy Design Awards Finalists");
    expect(html).toContain("Trick-or-treat bags with personality");
    expect(html).toContain("#ffad00");
    expect(html).toContain('href="/collections/design-awards"');
    expect(html).toContain('href="/collections/trick-or-treat"');
    expect(html).toContain(
      'data-theme-hero-promo-default-href="/us/en/products"',
    );
  });

  it("lets a media-only hero use the full section width", async () => {
    const node = await renderMarketplaceSection(
      {
        id: "hero-image-only",
        type: "hero",
        settings: {
          media_1_type: "image",
          media_1_image_url: "https://cdn.example/hero.webp",
          direction: "horizontal",
          section_width: "full",
        },
      },
      context,
    );
    const html = renderToStaticMarkup(node);

    expect(html).toMatch(
      /data-theme-hero-frame="true"[^>]*class="relative grid items-stretch grid-cols-1/,
    );
    expect(html).not.toContain('data-theme-hero-content="true"');
    expect(html).toContain("https://cdn.example/hero.webp");
  });

  it("renders both selected media, mobile settings, overlays, layout and section link", async () => {
    const node = await renderMarketplaceSection(
      {
        id: "hero-main",
        type: "hero",
        settings: {
          heading: "Shop the collection",
          media_1_type: "image",
          media_1_image_url: "https://cdn.example/hero.webp",
          media_2_type: "video",
          media_2_video_url: "https://cdn.example/hero.mp4",
          show_different_media_mobile: true,
          stack_media_mobile: true,
          section_link: "/collections/summer",
          open_link_in_new_tab: true,
          direction: "vertical",
          alignment: "center",
          position: "middle",
          gap: 24,
          section_width: "full",
          height: "large",
          background_color: "#f6f1e8",
          media_overlay: true,
          overlay_color: "#121212",
          overlay_style: "gradient",
          blur_media: true,
          padding_top: 100,
          padding_bottom: 72,
          theme_color_scheme: "scheme-2",
          theme_text_color: "#6c315d",
        },
      },
      context,
    );
    const html = renderToStaticMarkup(node);

    expect(html).toContain("Shop the collection");
    expect(html).toContain("https://cdn.example/hero.webp");
    expect(html).toContain("https://cdn.example/hero.mp4");
    expect(html).toContain('data-theme-hero-media="1"');
    expect(html).toContain('data-theme-hero-media="2"');
    expect(html).toContain("object-cover");
    expect(html).toContain("h-[44rem]");
    expect(html).toContain("hidden sm:block");
    expect(html).toContain("sm:hidden");
    expect(html).toContain("linear-gradient");
    expect(html).toContain("#f6f1e8");
    expect(html).toContain("padding-top:100px");
    expect(html).toContain("padding-bottom:72px");
    expect(html).toContain('href="/collections/summer"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain("#6c315d");
  });
});

describe("Hero heading and button blocks", () => {
  it("applies text block width, typography, colors, background and padding", () => {
    const html = renderToStaticMarkup(
      <ThemeBlockRenderer
        context={context}
        block={{
          type: "text",
          settings: {
            text: "We make things that work better.",
            width: "fill",
            max_width: "wide",
            preset: "heading_3",
            text_color: "#202020",
            background_enabled: true,
            background_color: "#f6f1e8",
            padding_top: 8,
            padding_left: 16,
          },
        }}
      />,
    );

    expect(html).toContain("We make things that work better.");
    expect(html).toContain("w-full");
    expect(html).toContain("max-w-5xl");
    expect(html).toContain("text-2xl md:text-3xl");
    expect(html).toContain("#202020");
    expect(html).toContain("#f6f1e8");
    expect(html).toContain("padding-left:16px");
  });

  it("applies heading layout, typography, colors and padding", () => {
    const html = renderToStaticMarkup(
      <ThemeBlockRenderer
        context={context}
        block={{
          type: "heading",
          settings: {
            text: "Browse our latest products",
            level: "h2",
            width: "fill",
            max_width: "wide",
            preset: "heading_2",
            text_color: "#202020",
            background_enabled: true,
            background_color: "#f6f1e8",
            padding_top: 8,
            padding_bottom: 12,
            padding_left: 16,
            padding_right: 20,
          },
        }}
      />,
    );
    expect(html).toContain("Browse our latest products");
    expect(html).toContain("w-full");
    expect(html).toContain("max-w-5xl");
    expect(html).toContain("#202020");
    expect(html).toContain("#f6f1e8");
    expect(html).toContain("padding-left:16px");
  });

  it("applies button style, palette colors, responsive width and new-tab link", () => {
    const html = renderToStaticMarkup(
      <ThemeBlockRenderer
        context={context}
        block={{
          type: "button",
          settings: {
            label: "Shop all",
            link: "https://shop.example/collection",
            open_in_new_tab: true,
            style: "custom",
            background_color: "#ffffff",
            text_color: "#111111",
            border_color: "#d1d1d1",
            desktop_width: "fit",
            mobile_width: "custom",
          },
        }}
      />,
    );
    expect(html).toContain("Shop all");
    expect(html).toContain('href="https://shop.example/collection"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain("noopener noreferrer");
    expect(html).toContain("#ffffff");
    expect(html).toContain("#111111");
    expect(html).toContain("#d1d1d1");
    expect(html).toContain("w-full md:w-fit");
  });
});
