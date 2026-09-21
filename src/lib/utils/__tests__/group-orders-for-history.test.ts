import type { Order } from "@spree/sdk";
import { describe, expect, it } from "vitest";
import { groupOrdersForHistory } from "@/lib/utils/group-orders-for-history";

function orderStub(
  partial: Partial<Order> & { id: string; number: string },
): Order {
  return {
    market_id: null,
    withdrawal_period_ends_at: null,
    within_withdrawal_period: false,
    cart_id: null,
    channel_id: null,
    company_id: null,
    company_name: null,
    po_document_filename: null,
    po_document_byte_size: null,
    email: "buyer@example.com",
    customer_note: null,
    po_number: null,
    currency: "USD",
    locale: "en",
    total_quantity: 1,
    coupon_code: null,
    fulfillment_status: "fulfilled",
    payment_status: "paid",
    completed_at: "2026-09-20T12:00:00Z",
    item_total: "10.0",
    display_item_total: "$10.00",
    adjustment_total: "0.0",
    display_adjustment_total: "$0.00",
    discount_total: "0.0",
    display_discount_total: "$0.00",
    tax_total: "0.0",
    display_tax_total: "$0.00",
    included_tax_total: "0.0",
    display_included_tax_total: "$0.00",
    additional_tax_total: "0.0",
    display_additional_tax_total: "$0.00",
    total: "10.0",
    display_total: "$10.00",
    gift_card_total: "0.0",
    display_gift_card_total: "$0.00",
    amount_due: "0.0",
    display_amount_due: "$0.00",
    delivery_total: "0.0",
    display_delivery_total: "$0.00",
    fee_total: "0.0",
    display_fee_total: "$0.00",
    store_credit_total: "0.0",
    display_store_credit_total: "$0.00",
    covered_by_store_credit: false,
    discounts: [],
    fees: [],
    items: [],
    fulfillments: [],
    payments: [],
    billing_address: null,
    shipping_address: null,
    gift_card: null,
    market: null,
    order_group_id: null,
    order_group_number: null,
    seller_id: null,
    seller_name: null,
    seller_slug: null,
    ...partial,
  } as Order;
}

describe("groupOrdersForHistory", () => {
  it("keeps standalone orders as single buckets", () => {
    const buckets = groupOrdersForHistory([
      orderStub({ id: "1", number: "R1001", seller_name: "Solo Shop" }),
    ]);
    expect(buckets).toHaveLength(1);
    expect(buckets[0].orders).toHaveLength(1);
  });

  it("groups OrderGroup children together", () => {
    const buckets = groupOrdersForHistory([
      orderStub({
        id: "a",
        number: "R1002-1",
        order_group_id: "og_1",
        order_group_number: "R1002",
        seller_name: "Oak & Pine Studio",
      }),
      orderStub({
        id: "b",
        number: "R1002-2",
        order_group_id: "og_1",
        order_group_number: "R1002",
        seller_name: "Crafted Home",
      }),
      orderStub({ id: "c", number: "R1003", seller_name: "Other" }),
    ]);
    expect(buckets).toHaveLength(2);
    expect(buckets[0].orders).toHaveLength(2);
    expect(buckets[0].groupNumber).toBe("R1002");
    expect(buckets[1].orders).toHaveLength(1);
  });
});
