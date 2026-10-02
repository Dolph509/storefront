import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ThemeSettingsProvider } from "@/contexts/ThemeSettingsContext";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

import { FavoriteButton } from "./FavoriteButton";

describe("FavoriteButton global wishlist setting", () => {
  it("hides product favorite controls when the wishlist is disabled", () => {
    render(
      <ThemeSettingsProvider settings={{ general: { enable_wishlist: false } }}>
        <FavoriteButton productId="prod_1" />
      </ThemeSettingsProvider>,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("keeps product favorite controls visible by default", () => {
    render(<FavoriteButton productId="prod_1" />);

    expect(screen.getByRole("button", { name: "addFavorite" })).toBeVisible();
  });
});
