import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { CmsPage } from "./types";

vi.mock("@/lib/spree", () => ({
  getClient: () => ({ request: async () => ({ data: { settings: {} } }) }),
}));

import { CmsPageRenderer } from "./CmsPageRenderer";

describe("CmsPageRenderer", () => {
  it("keeps section IDs and order while skipping hidden and unknown sections", async () => {
    const page: CmsPage = {
      id: "cmsp_1",
      name: "Guide",
      slug: "guide",
      page_type: "standard",
      status: "published",
      seo: { title: null, description: null },
      version: 1,
      published_at: null,
      sections: [
        {
          id: "trust-first",
          type: "trust",
          enabled: true,
          settings: { heading: "First", body: "Safe text" },
        },
        {
          id: "trust-hidden",
          type: "trust",
          enabled: false,
          settings: { heading: "Hidden" },
        },
        {
          id: "unknown-third",
          type: "future_type",
          enabled: true,
          settings: {},
        },
        {
          id: "trust-fourth",
          type: "trust",
          enabled: true,
          settings: { heading: "Fourth" },
        },
      ],
    };

    const html = renderToStaticMarkup(
      await CmsPageRenderer({ page, basePath: "/us/en", locale: "en" }),
    );
    expect(html).toContain('data-cms-section-id="trust-first"');
    expect(html).toContain('data-cms-section-id="trust-fourth"');
    expect(html.indexOf("First")).toBeLessThan(html.indexOf("Fourth"));
    expect(html).not.toContain("Hidden");
    expect(html).not.toContain("unknown-third");
  });
});
