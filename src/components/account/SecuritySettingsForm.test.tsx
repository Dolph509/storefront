import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
  useLocale: () => "en",
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "cus_1", email: "buyer@example.com" },
    refreshUser: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock("@/lib/data/customer", () => ({
  updateCustomer: vi.fn(),
  listCustomerIdentities: vi.fn(async () => ({
    success: true,
    identities: [],
  })),
  listCustomerSessions: vi.fn(async () => ({
    success: true,
    sessions: [
      {
        id: "rt_1",
        ip_address: "1.2.3.4",
        user_agent: "Chrome",
        created_at: "2026-01-01T00:00:00Z",
        expires_at: "2026-02-01T00:00:00Z",
        current: true,
      },
    ],
  })),
  listAuthProviders: vi.fn(async () => ({ success: true, providers: [] })),
  getMfaStatus: vi.fn(async () => ({
    success: true,
    status: { mfa_enabled: false, recovery_codes_remaining: 0 },
  })),
  revokeCustomerSession: vi.fn(),
  revokeAllCustomerSessions: vi.fn(),
  disconnectCustomerIdentity: vi.fn(),
  startPhoneVerification: vi.fn(),
  confirmPhoneVerification: vi.fn(),
  setupMfaTotp: vi.fn(),
  confirmMfaTotp: vi.fn(),
  disableMfaTotp: vi.fn(),
}));

import { SecuritySettingsForm } from "./SecuritySettingsForm";

describe("SecuritySettingsForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders phone, two-factor, connected accounts, sessions, and password sections", async () => {
    render(<SecuritySettingsForm />);

    expect(await screen.findByText("phoneVerification")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /twoFactor/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("twoFactorRecommended")).toBeInTheDocument();
    expect(screen.getByText("connectedAccounts")).toBeInTheDocument();
    expect(screen.getByText("signInActivity")).toBeInTheDocument();
    expect(screen.getByText("settingsPassword")).toBeInTheDocument();
    expect(await screen.findByText("currentSession")).toBeInTheDocument();
    expect(screen.getByText("noRedirectProviders")).toBeInTheDocument();
    expect(screen.getByText("signOutEverywhere")).toBeInTheDocument();
    expect(screen.getByText("enableTwoFactor")).toBeInTheDocument();
  });

  it("opens the 2FA method picker dialog", async () => {
    const user = userEvent.setup();
    render(<SecuritySettingsForm />);

    await user.click(await screen.findByText("enableTwoFactor"));

    expect(await screen.findByText("twoFactorDialogTitle")).toBeInTheDocument();
    expect(screen.getByText("twoFactorDialogQuestion")).toBeInTheDocument();
    expect(
      screen.getByText("twoFactorMethodAuthenticator"),
    ).toBeInTheDocument();
    expect(screen.getByText("twoFactorMostSecure")).toBeInTheDocument();
    expect(
      screen.getByText("twoFactorMethodSms (twoFactorMethodUnavailableShort)"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "twoFactorMethodPhoneCall (twoFactorMethodUnavailableShort)",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("twoFactorMethodUnavailable")).toBeInTheDocument();
  });
});
