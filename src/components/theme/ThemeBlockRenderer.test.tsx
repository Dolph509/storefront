import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ThemeBlockRenderer } from "./ThemeBlockRenderer";

const context = {
  kind: "collection" as const,
  collectionId: "col_1",
  collectionName: "Gifts",
  basePath: "/us/en",
  locale: "en",
  country: "US",
};

describe("collection sidebar blocks", () => {
  it("renders sidebar text and promotion content from block settings", () => {
    const text = renderToStaticMarkup(
      <ThemeBlockRenderer
        block={{
          type: "collection_sidebar_text",
          settings: {
            heading: "Shop with confidence",
            text: "Independent makers",
          },
        }}
        context={context}
      />,
    );
    const promo = renderToStaticMarkup(
      <ThemeBlockRenderer
        block={{
          type: "collection_sidebar_promo",
          settings: {
            heading: "New season",
            text: "Fresh finds",
            button_label: "Explore",
            link: "/collections/new",
          },
        }}
        context={context}
      />,
    );

    expect(text).toContain("Shop with confidence");
    expect(text).toContain("Independent makers");
    expect(promo).toContain("New season");
    expect(promo).toContain('href="/collections/new"');
    expect(promo).toContain("Explore");
  });
});

describe("slideshow blocks", () => {
  it("applies heading typography directly to the rendered heading", () => {
    const markup = renderToStaticMarkup(
      <ThemeBlockRenderer
        block={{
          type: "heading",
          settings: {
            text: "I am Avone",
            level: "h1",
            preset: "custom_hd",
            font_size: 44,
            font_size_mobile: 28,
            font_weight: "700",
            line_height: "1.2",
            letter_spacing: "1px",
            uppercase: true,
            hide_on_mobile: true,
            padding_x: 10,
            padding_y: 5,
            margin_bottom: 5,
          },
        }}
        context={context}
      />,
    );

    expect(markup).toContain("<h1");
    expect(markup).toContain("font-size:44px");
    expect(markup).toContain("font-weight:700");
    expect(markup).toContain("line-height:1.2");
    expect(markup).toContain("letter-spacing:1px");
    expect(markup).toContain("text-transform:uppercase");
    expect(markup).toContain("margin-bottom:5px");
    expect(markup).toContain("max-md:hidden");
    expect(markup).toContain("font-size: var(--theme-heading-mobile-size)");
  });

  it("uses the selected focal point for each slide image", () => {
    const markup = renderToStaticMarkup(
      <ThemeBlockRenderer
        block={{
          type: "slide",
          settings: {
            image_url: "/slide.jpg",
            alt: "Slide artwork",
            focal_point: "top",
          },
        }}
        context={context}
      />,
    );

    expect(markup).toContain('alt="Slide artwork"');
    expect(markup).toContain("object-position:center top");
  });
});
