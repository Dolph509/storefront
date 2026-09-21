import type { LineItem } from "@spree/sdk";
import { describe, expect, it } from "vitest";
import { groupLineItemsBySeller } from "@/lib/utils/group-line-items-by-seller";

function item(
  overrides: Partial<LineItem> & { id: string; name: string },
): LineItem {
  return {
    variant_id: "var_1",
    seller_id: null,
    seller_name: null,
    seller_slug: null,
    preorder: false,
    preorder_ships_at: null,
    quantity: 1,
    currency: "USD",
    slug: "item",
    options_text: "",
    proof_required: false,
    personalization_snapshot: null,
    personalization_fingerprint: null,
    price: "10.00",
    display_price: "$10.00",
    total: "10.00",
    display_total: "$10.00",
    adjustment_total: null,
    display_adjustment_total: null,
    additional_tax_total: null,
    display_additional_tax_total: null,
    included_tax_total: null,
    display_included_tax_total: null,
    discount_total: null,
    display_discount_total: null,
    pre_tax_amount: null,
    display_pre_tax_amount: null,
    discounted_amount: null,
    display_discounted_amount: null,
    display_compare_at_amount: null,
    compare_at_amount: null,
    thumbnail_url: null,
    option_values: [],
    digital_links: [],
    ...overrides,
  } as LineItem;
}

describe("groupLineItemsBySeller", () => {
  it("groups lines into one section per seller", () => {
    const groups = groupLineItemsBySeller([
      item({
        id: "li_1",
        name: "Wood Sign",
        seller_id: "sel_a",
        seller_name: "Oak & Pine",
        seller_slug: "oak-pine",
      }),
      item({
        id: "li_2",
        name: "Ornament",
        seller_id: "sel_a",
        seller_name: "Oak & Pine",
        seller_slug: "oak-pine",
      }),
      item({
        id: "li_3",
        name: "Mug",
        seller_id: "sel_b",
        seller_name: "Crafted Home",
        seller_slug: "crafted-home",
      }),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].sellerName).toBe("Oak & Pine");
    expect(groups[0].items).toHaveLength(2);
    expect(groups[1].sellerName).toBe("Crafted Home");
    expect(groups[1].items).toHaveLength(1);
  });

  it("keeps first-party lines in a marketplace group", () => {
    const groups = groupLineItemsBySeller([
      item({ id: "li_1", name: "Store tee" }),
      item({
        id: "li_2",
        name: "Seller mug",
        seller_id: "sel_b",
        seller_name: "Crafted Home",
        seller_slug: "crafted-home",
      }),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].sellerId).toBeNull();
    expect(groups[0].sellerName).toBe("Marketplace");
  });
});
