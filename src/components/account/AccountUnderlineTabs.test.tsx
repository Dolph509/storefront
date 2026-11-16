import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AccountUnderlineTabs } from "./AccountUnderlineTabs";

describe("AccountUnderlineTabs", () => {
  it("marks the active tab and keeps inactive tabs clickable", () => {
    render(
      <AccountUnderlineTabs
        aria-label="Settings"
        tabs={[
          {
            href: "/us/en/account/settings/account",
            label: "Account",
            isActive: true,
          },
          {
            href: "/us/en/account/settings/security",
            label: "Security",
            isActive: false,
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("navigation", { name: "Settings" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Account" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Security" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
