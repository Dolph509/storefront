import { describe, expect, it } from "vitest";
import { resolveThemeSetting } from "./dynamic-source";
import type { ProductThemeContext } from "./types";

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
});
