import type { ReviewablePurchase } from "@spree/sdk";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReviewFormDialog } from "./ReviewFormDialog";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  refresh: vi.fn(),
  upload: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, string>) =>
    values ? `${key} ${Object.values(values).join(" ")}` : key,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));

vi.mock("@/lib/data/reviews", () => ({
  createProductReview: mocks.create,
  updateProductReview: vi.fn(),
  uploadReviewMedia: mocks.upload,
}));

vi.mock("@/components/ui/product-image", () => ({
  ProductImage: () => <div data-testid="product-image" />,
}));

const purchase = {
  id: "purchase_1",
  quantity: 1,
  options_text: null,
  line_item_id: "li_1",
  order_id: "order_1",
  order_number: "R123",
  product_id: "prod_1",
  product_name: "Handmade tumbler",
  product_slug: "handmade-tumbler",
  variant_id: "variant_1",
  seller_id: "seller_1",
  seller_name: "Maker Shop",
  thumbnail_url: null,
  delivered_at: "2026-09-01T00:00:00Z",
  review_window_closes_at: "2026-10-01T00:00:00Z",
} satisfies ReviewablePurchase;

describe("ReviewFormDialog", () => {
  beforeEach(() => {
    mocks.create.mockReset().mockResolvedValue({ id: "review_1" });
    mocks.refresh.mockReset();
    mocks.upload.mockReset().mockResolvedValue("signed-video");
  });

  it("collects a rating, written review, and video on the order item", async () => {
    const user = userEvent.setup();
    render(
      <ReviewFormDialog
        target={{ mode: "create", purchase }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    const overallStars = screen.getByRole("radiogroup", {
      name: "ratingLabel",
    });
    const fifthOverallStar = within(overallStars).getByRole("radio", {
      name: "starLabel 5",
    });
    fireEvent.pointerEnter(fifthOverallStar);
    expect(fifthOverallStar.querySelector("svg")).toHaveClass("fill-amber-400");
    fireEvent.pointerLeave(fifthOverallStar);
    expect(fifthOverallStar.querySelector("svg")).not.toHaveClass(
      "fill-amber-400",
    );
    await user.click(fifthOverallStar);
    await user.click(screen.getByRole("radio", { name: "recommendYes" }));
    await user.click(screen.getByRole("button", { name: /continue/i }));
    await user.click(
      within(
        screen.getByRole("radiogroup", { name: "itemQualityRating" }),
      ).getByRole("radio", { name: "starLabel 5" }),
    );
    await user.click(
      within(
        screen.getByRole("radiogroup", { name: "shippingRating" }),
      ).getByRole("radio", { name: "starLabel 4" }),
    );
    await user.click(
      within(
        screen.getByRole("radiogroup", { name: "customerServiceRating" }),
      ).getByRole("radio", { name: "starLabel 3" }),
    );
    await user.type(
      screen.getByRole("textbox", { name: /titleOptional/ }),
      "Great quality",
    );
    await user.type(
      screen.getByRole("textbox", { name: /bodyLabel/ }),
      "Lovely quality.",
    );

    const video = new File(["video"], "review.mp4", { type: "video/mp4" });
    fireEvent.change(screen.getByLabelText("mediaLabel"), {
      target: { files: [video] },
    });

    await waitFor(() => expect(mocks.upload).toHaveBeenCalledOnce());
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(mocks.create).toHaveBeenCalledWith({
        line_item_id: "li_1",
        rating: 5,
        item_quality_rating: 5,
        shipping_rating: 4,
        customer_service_rating: 3,
        recommended: true,
        title: "Great quality",
        body: "Lovely quality.",
        videos: ["signed-video"],
      });
      expect(mocks.refresh).toHaveBeenCalledOnce();
    });
  });

  it("requires every rating, recommendation, title, and review before enabling submission", async () => {
    const user = userEvent.setup();
    render(
      <ReviewFormDialog
        target={{ mode: "create", purchase }}
        onClose={vi.fn()}
      />,
    );

    const continueButton = screen.getByRole("button", { name: /continue/i });
    expect(continueButton).toBeDisabled();
    await user.click(
      within(screen.getByRole("radiogroup", { name: "ratingLabel" })).getByRole(
        "radio",
        { name: "starLabel 5" },
      ),
    );
    expect(continueButton).toBeDisabled();
    await user.click(screen.getByRole("radio", { name: "recommendNo" }));
    expect(continueButton).toBeEnabled();
    await user.click(continueButton);

    const submitButton = screen.getByRole("button", { name: "submit" });
    expect(submitButton).toBeDisabled();
    await user.click(
      within(
        screen.getByRole("radiogroup", { name: "itemQualityRating" }),
      ).getByRole("radio", { name: "starLabel 5" }),
    );
    await user.click(
      within(
        screen.getByRole("radiogroup", { name: "shippingRating" }),
      ).getByRole("radio", { name: "starLabel 4" }),
    );
    await user.click(
      within(
        screen.getByRole("radiogroup", { name: "customerServiceRating" }),
      ).getByRole("radio", { name: "starLabel 3" }),
    );
    await user.type(
      screen.getByRole("textbox", { name: /titleOptional/ }),
      "Great quality",
    );
    expect(submitButton).toBeDisabled();
    await user.type(
      screen.getByRole("textbox", { name: /bodyLabel/ }),
      "Lovely quality.",
    );
    expect(submitButton).toBeEnabled();
    expect(mocks.upload).not.toHaveBeenCalled();
  });
});
