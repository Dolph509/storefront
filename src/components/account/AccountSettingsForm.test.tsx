import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/us/en/account/settings/account",
}));

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const translator = (key: string, values?: Record<string, string>) => {
      if (!values) return key;
      return Object.entries(values).reduce(
        (text, [name, value]) => text.replace(`{${name}}`, value),
        key,
      );
    };
    return translator;
  },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "cus_1",
      email: "buyer@example.com",
      first_name: "Ada",
      last_name: "Buyer",
      member_since: "2024-01-15",
    },
    refreshUser: vi.fn(),
  }),
}));

vi.mock("@/components/layout/RegionPreferences", () => ({
  RegionPreferences: () => (
    <div data-testid="region-preferences">Region preferences</div>
  ),
}));

vi.mock("@/lib/data/customer", () => ({
  updateCustomer: vi.fn(),
}));

import { AccountSettingsForm } from "./AccountSettingsForm";

describe("AccountSettingsForm", () => {
  it("renders account identity fields and RegionPreferences without client-only loading", () => {
    render(<AccountSettingsForm />);

    expect(screen.getByText("settingsAboutYou")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Ada")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Buyer")).toBeInTheDocument();
    expect(screen.getByLabelText("currentEmail")).toHaveValue(
      "buyer@example.com",
    );
    expect(screen.getByText(/memberSince/)).toBeInTheDocument();
    expect(screen.getByTestId("region-preferences")).toBeInTheDocument();
    expect(screen.getByText("settingsLocation")).toBeInTheDocument();
  });
});
