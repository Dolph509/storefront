import { act, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SellerShopEditorThemeBridge } from "./SellerShopEditorThemeBridge";

describe("SellerShopEditorThemeBridge", () => {
  it("updates the storefront theme from trusted editor preview messages", () => {
    const { container } = render(
      <header data-theme-seller-identity>
        <SellerShopEditorThemeBridge enabled />
      </header>,
    );
    const header = container.querySelector("header")!;

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          source: window,
          data: {
            source: "spree-shop-editor-parent",
            action: "patch",
            payload: { shop_accent_color: "#f08092" },
          },
        }),
      );
    });

    expect(header.style.getPropertyValue("--marketplace-seller-accent")).toBe(
      "#f08092",
    );
    expect(
      header.style.getPropertyValue("--marketplace-seller-action-bg"),
    ).toBe("#ffffff");
    expect(
      header.style.getPropertyValue("--marketplace-seller-action-border"),
    ).toBe("#f08092");
    expect(
      header.style.getPropertyValue("--marketplace-seller-action-text"),
    ).toBe("#222222");
    expect(
      header.style.getPropertyValue("--marketplace-seller-rating-star"),
    ).toBe("#5a3c12");

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          source: null,
          data: {
            source: "spree-shop-editor-parent",
            action: "patch",
            payload: { shop_accent_color: "#00ff00" },
          },
        }),
      );
    });

    expect(header.style.getPropertyValue("--marketplace-seller-accent")).toBe(
      "#f08092",
    );

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          source: window,
          data: {
            source: "spree-shop-editor-parent",
            action: "patch",
            payload: { shop_accent_color: "#273a35" },
          },
        }),
      );
    });

    expect(
      header.style.getPropertyValue("--marketplace-seller-action-bg"),
    ).toBe("#ffffff");
    expect(
      header.style.getPropertyValue("--marketplace-seller-action-border"),
    ).toBe("#ffffff");
    expect(
      header.style.getPropertyValue("--marketplace-seller-action-text"),
    ).toBe("#273a35");
    expect(
      header.style.getPropertyValue("--marketplace-seller-rating-star"),
    ).toBe("#ffffff");
  });
});
