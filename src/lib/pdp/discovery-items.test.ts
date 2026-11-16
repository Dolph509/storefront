import { describe, expect, it } from "vitest";
import {
  buildPdpRelatedDiscoveryPlan,
  searchBrowseHref,
} from "@/lib/pdp/discovery-items";

describe("buildPdpRelatedDiscoveryPlan", () => {
  it("derives links from product categories, tags, and name tokens without duplicate labels", () => {
    const product = {
      id: "prod_1",
      name: "Handmade Ceramic Vase",
      tags: ["pottery", "home decor"],
      categories: [
        {
          id: "cat_1",
          name: "Home Decor",
          permalink: "home-decor",
        },
      ],
    } as import("@spree/sdk").Product;

    const plan = buildPdpRelatedDiscoveryPlan(product, "/us/en", {
      chips: 4,
      gridCategories: 2,
      gridSearchTerms: 2,
      pills: 3,
      termPool: 10,
    });

    expect(plan.chips[0]?.href).toBe("/us/en/c/home-decor");
    expect(plan.chips.some((item) => item.label === "pottery")).toBe(true);
    expect(
      plan.gridTiles.every(
        (item, index, items) =>
          items.findIndex(
            (other) => other.label.toLowerCase() === item.label.toLowerCase(),
          ) === index,
      ),
    ).toBe(true);
    expect(
      plan.pills.every(
        (pill) =>
          !plan.gridTiles.some(
            (tile) => tile.label.toLowerCase() === pill.label.toLowerCase(),
          ) &&
          !plan.chips.some(
            (chip) => chip.label.toLowerCase() === pill.label.toLowerCase(),
          ),
      ),
    ).toBe(true);
  });

  it("builds search URLs consistently", () => {
    expect(searchBrowseHref("/us/en", "blue vase")).toBe(
      "/us/en/products?q=blue%20vase",
    );
  });
});
