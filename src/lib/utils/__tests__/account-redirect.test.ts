import { describe, expect, it } from "vitest";
import {
  buildAccountLoginHref,
  rebaseAccountRedirect,
  rebaseAccountRedirectSearch,
  resolveAccountRedirect,
} from "../account-redirect";

describe("resolveAccountRedirect", () => {
  const basePath = "/us/en";

  it.each([
    [
      "/us/en/account/orders?state=complete#latest",
      "/us/en/account/orders?state=complete#latest",
    ],
    ["/us/en/checkout/cart_123", "/us/en/checkout/cart_123"],
    ["/us/en/sellers/oak-studio", "/us/en/sellers/oak-studio"],
  ])("allows a localized sign-in return path", (redirect, expected) => {
    expect(resolveAccountRedirect(redirect, basePath)).toBe(expected);
  });

  it.each([
    "https://example.com/us/en/account/orders",
    "//example.com/us/en/account/orders",
    "/\\example.com/us/en/account/orders",
    "/us/en/account%2forders",
    "/fr/fr/account/orders",
    "/us/en/products",
    "/us/en/sellers-evil/oak-studio",
  ])("rejects an unsafe return target: %s", (redirect) => {
    expect(resolveAccountRedirect(redirect, basePath)).toBeNull();
  });
});

describe("buildAccountLoginHref", () => {
  it("adds a validated return target", () => {
    expect(
      buildAccountLoginHref("/us/en", "/us/en/account/orders?state=complete"),
    ).toBe(
      "/us/en/account?redirect=%2Fus%2Fen%2Faccount%2Forders%3Fstate%3Dcomplete",
    );
  });

  it("falls back to the account page for an invalid target", () => {
    expect(buildAccountLoginHref("/us/en", "https://example.com")).toBe(
      "/us/en/account",
    );
  });

  it("returns shoppers to a seller after sign-in", () => {
    expect(buildAccountLoginHref("/us/en", "/us/en/sellers/oak-studio")).toBe(
      "/us/en/account?redirect=%2Fus%2Fen%2Fsellers%2Foak-studio",
    );
  });
});

describe("rebaseAccountRedirect", () => {
  it("moves a localized target while preserving its suffix and query", () => {
    expect(
      rebaseAccountRedirect(
        "/pl/de/account/orders?state=complete#latest",
        "/pl/de",
        "/us/en",
      ),
    ).toBe("/us/en/account/orders?state=complete#latest");
  });

  it("updates the redirect parameter and preserves other search params", () => {
    expect(
      rebaseAccountRedirectSearch(
        "?redirect=%2Fpl%2Fde%2Faccount%2Forders%3Fstate%3Dcomplete&source=login",
        "/pl/de",
        "/fr/fr",
      ),
    ).toBe(
      "?redirect=%2Ffr%2Ffr%2Faccount%2Forders%3Fstate%3Dcomplete&source=login",
    );
  });

  it("drops an invalid redirect instead of carrying it across markets", () => {
    expect(
      rebaseAccountRedirectSearch(
        "?redirect=https%3A%2F%2Fevil.example%2Faccount&source=login",
        "/pl/de",
        "/us/en",
      ),
    ).toBe("?source=login");
  });
});
