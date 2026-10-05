import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((location: string) => {
    throw new Error(`redirect:${location}`);
  }),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import AddressesRedirectPage from "./addresses/page";
import BlockedShopsRedirectPage from "./blocked-shops/page";
import CreditCardsRedirectPage from "./credit-cards/page";
import ProfileRedirectPage from "./profile/page";

describe("legacy settings redirects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    {
      name: "profile",
      run: ProfileRedirectPage,
      destination: "/us/en/account/settings/public-profile",
    },
    {
      name: "addresses",
      run: AddressesRedirectPage,
      destination: "/us/en/account/settings/addresses",
    },
    {
      name: "credit cards",
      run: CreditCardsRedirectPage,
      destination: "/us/en/account/settings/credit-cards",
    },
    {
      name: "blocked shops",
      run: BlockedShopsRedirectPage,
      destination: "/us/en/account/settings/privacy",
    },
  ])("redirects $name to the settings destination", async ({
    run,
    destination,
  }) => {
    await expect(
      run({ params: Promise.resolve({ country: "us", locale: "en" }) }),
    ).rejects.toThrow(`redirect:${destination}`);
    expect(mocks.redirect).toHaveBeenCalledWith(destination);
  });
});
