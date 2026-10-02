import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ThemeSettingsProvider } from "@/contexts/ThemeSettingsContext";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

import { WishlistFeatureGate } from "./WishlistFeatureGate";

describe("WishlistFeatureGate", () => {
  it("redirects away from favorites when the General wishlist setting is disabled", async () => {
    render(
      <ThemeSettingsProvider settings={{ general: { enable_wishlist: false } }}>
        <WishlistFeatureGate basePath="/us/en">
          <div>Saved products</div>
        </WishlistFeatureGate>
      </ThemeSettingsProvider>,
    );

    expect(screen.queryByText("Saved products")).not.toBeInTheDocument();
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/us/en/account"));
  });

  it("keeps favorites available by default", () => {
    render(
      <WishlistFeatureGate basePath="/us/en">
        <div>Saved products</div>
      </WishlistFeatureGate>,
    );

    expect(screen.getByText("Saved products")).toBeVisible();
  });
});
