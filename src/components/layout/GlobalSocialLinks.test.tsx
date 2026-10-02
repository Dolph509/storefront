import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThemeSettingsProvider } from "@/contexts/ThemeSettingsContext";
import { GlobalSocialLinks } from "./GlobalSocialLinks";

describe("GlobalSocialLinks", () => {
  it("renders configured social networks as labeled icon links", () => {
    render(
      <ThemeSettingsProvider
        settings={{
          social: {
            instagram: "https://instagram.com/store",
            pinterest: "https://pinterest.com/store",
            facebook: "javascript:alert(1)",
          },
        }}
      >
        <GlobalSocialLinks />
      </ThemeSettingsProvider>,
    );

    expect(screen.getByRole("link", { name: "Instagram" })).toHaveAttribute(
      "href",
      "https://instagram.com/store",
    );
    expect(screen.getByRole("link", { name: "Pinterest" })).toHaveAttribute(
      "href",
      "https://pinterest.com/store",
    );
    expect(screen.queryByRole("link", { name: "Facebook" })).toBeNull();
  });

  it("respects the global social links setting", () => {
    render(
      <ThemeSettingsProvider
        settings={{
          social: {
            instagram: "https://instagram.com/store",
            show_social_links: false,
          },
        }}
      >
        <GlobalSocialLinks />
      </ThemeSettingsProvider>,
    );

    expect(
      screen.queryByRole("navigation", { name: "Social media" }),
    ).toBeNull();
  });
});
