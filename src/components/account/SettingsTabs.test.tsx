import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const pathnameMock = vi.hoisted(() => ({
  value: "/us/en/account/settings/account",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock.value,
}));
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import { SettingsTabs } from "./SettingsTabs";

describe("SettingsTabs", () => {
  it("renders every settings destination and marks the active tab", () => {
    pathnameMock.value = "/us/en/account/settings/account";
    render(<SettingsTabs />);

    for (const slug of [
      "account",
      "security",
      "public-profile",
      "privacy",
      "addresses",
      "credit-cards",
      "notifications",
    ]) {
      expect(
        document.querySelector(`a[href="/us/en/account/settings/${slug}"]`),
      ).toBeInTheDocument();
    }

    expect(
      screen.getByRole("link", { name: "settingsTabAccount" }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("marks Account as active on the settings root", () => {
    pathnameMock.value = "/us/en/account/settings";
    render(<SettingsTabs />);
    expect(
      screen.getByRole("link", { name: "settingsTabAccount" }),
    ).toHaveAttribute("aria-current", "page");
  });
});
