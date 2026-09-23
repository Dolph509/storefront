import { describe, expect, it } from "vitest";
import { buildSellerShopProductQuery } from "./seller-storefront";

describe("buildSellerShopProductQuery", () => {
  it("returns undefined when no filters are set", () => {
    expect(buildSellerShopProductQuery({})).toBeUndefined();
  });

  it("builds ransack keys for text and on-sale filters", () => {
    expect(
      buildSellerShopProductQuery({ textQuery: "sign", onSale: "1" }),
    ).toEqual({ name_cont: "sign", on_sale: true });
  });
});
