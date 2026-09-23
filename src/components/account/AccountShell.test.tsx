import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/us/en/account/messages",
  useRouter: () => ({ replace: vi.fn() }),
}));
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { first_name: "Ada", last_name: "Buyer", email: "ada@example.com" },
    logout: vi.fn(),
  }),
}));
vi.mock("@/components/account/MessagesNavBadge", () => ({
  MessagesNavBadge: () => <span>3</span>,
}));

import { AccountShell } from "./AccountShell";

describe("AccountShell", () => {
  it("groups every existing account destination and uses safety semantics", () => {
    render(<AccountShell>Account content</AccountShell>);

    for (const group of [
      "shoppingGroup",
      "communicationGroup",
      "activityGroup",
      "accountGroup",
      "privacySafetyGroup",
    ]) {
      expect(screen.getAllByText(group).length).toBeGreaterThan(0);
    }

    const expectedPaths = [
      "/account",
      "/account/orders",
      "/account/favorites",
      "/account/followed-shops",
      "/account/saved-searches",
      "/account/messages",
      "/account/offers",
      "/account/custom-orders",
      "/account/reviews",
      "/account/profile",
      "/account/addresses",
      "/account/credit-cards",
      "/account/gift-cards",
      "/account/blocked-shops",
    ];

    for (const path of expectedPaths) {
      expect(
        document.querySelector(`a[href="/us/en${path}"]`),
      ).toBeInTheDocument();
    }
    expect(screen.getByText("Account content")).toBeInTheDocument();
  });
});
