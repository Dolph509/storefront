import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ShopEditorAction } from "./ShopEditorAction";

describe("ShopEditorAction", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends the selected editor panel action to the parent frame", () => {
    const postMessage = vi.spyOn(window.parent, "postMessage");
    render(
      <ShopEditorAction
        action="banner-layout"
        label="Change layout"
        showLabel
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Change layout" }));

    expect(postMessage).toHaveBeenCalledWith(
      { source: "spree-shop-editor", action: "banner-layout" },
      "*",
    );
  });
});
