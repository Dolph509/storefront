import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StarSellerAvatar } from "./StarSellerAvatar";

describe("StarSellerAvatar", () => {
  it("frames the seller photo with the Star Seller seal and mark", () => {
    const seller = {
      id: "seller-1",
      slug: "maker-shop",
      name: "Maker Shop",
      square_logo_url: null,
      logo_url: null,
      badges: [
        {
          id: "badge-1",
          key: "star_seller",
          label: "Star Seller",
          description: "Consistently excellent service",
          awarded_at: "2026-10-01T00:00:00Z",
        },
      ],
    };

    const { container } = render(
      <StarSellerAvatar
        seller={seller}
        href="/us/en/sellers/maker-shop"
        sizeClassName="size-20"
      />,
    );

    expect(
      container.querySelector("[data-star-seller-avatar='true']"),
    ).toBeTruthy();
    expect(screen.getByRole("img", { name: "Star Seller" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Maker Shop" })).toHaveAttribute(
      "href",
      "/us/en/sellers/maker-shop",
    );
  });
});
