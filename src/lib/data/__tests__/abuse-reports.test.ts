import { beforeEach, describe, expect, it, vi } from "vitest";

const { state } = vi.hoisted(() => ({ state: { client: {} as any } }));

vi.mock("@/lib/spree", () => ({
  getClient: () => state.client,
  withAuthRefresh: async (callback: (options: object) => Promise<unknown>) =>
    callback({ token: "session" }),
}));

import {
  getProductReviewAbuseReportReasons,
  reportProductReview,
} from "@/lib/data/abuse-reports";

describe("product review abuse reports", () => {
  beforeEach(() => {
    state.client = {};
  });

  it("loads reasons specifically for product reviews", async () => {
    const reasons = vi.fn().mockResolvedValue({ data: [{ id: "reason_1" }] });
    state.client = { abuseReports: { reasons } };

    await expect(getProductReviewAbuseReportReasons()).resolves.toEqual({
      data: [{ id: "reason_1" }],
    });
    expect(reasons).toHaveBeenCalledWith("product_review");
  });

  it("submits a report against the selected review", async () => {
    const create = vi.fn().mockResolvedValue({ id: "report_1" });
    state.client = { abuseReports: { create } };

    await reportProductReview({
      reviewId: "review_123",
      body: "This review is abusive.",
      reasonId: "reason_1",
      reporterEmail: "buyer@example.com",
    });

    expect(create).toHaveBeenCalledWith(
      {
        subject_type: "product_review",
        subject_id: "review_123",
        body: "This review is abusive.",
        reason_id: "reason_1",
        reporter_email: "buyer@example.com",
      },
      { token: "session" },
    );
  });
});
