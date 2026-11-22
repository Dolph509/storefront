import { afterEach, describe, expect, it, vi } from "vitest";
import {
  looksLikePostalCode,
  resolveLocationQuery,
  resolvePostalCodeToCityState,
} from "./resolve-location-query";

describe("looksLikePostalCode", () => {
  it("detects US ZIP codes", () => {
    expect(looksLikePostalCode("10001")).toBe(true);
    expect(looksLikePostalCode("34953-1234")).toBe(true);
    expect(looksLikePostalCode("Austin, TX")).toBe(false);
  });

  it("detects Canadian postal codes", () => {
    expect(looksLikePostalCode("K1A 0B1")).toBe(true);
    expect(looksLikePostalCode("k1a0b1")).toBe(true);
  });
});

describe("resolvePostalCodeToCityState", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps a US ZIP to city and state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          places: [
            {
              "place name": "Port Saint Lucie",
              "state abbreviation": "FL",
              state: "Florida",
            },
          ],
        }),
      }),
    );

    await expect(resolvePostalCodeToCityState("34953")).resolves.toBe(
      "Port Saint Lucie, FL",
    );
  });

  it("returns null for unknown ZIP codes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({}),
      }),
    );

    await expect(resolvePostalCodeToCityState("00000")).resolves.toBeNull();
  });
});

describe("resolveLocationQuery", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps city-state text as-is", async () => {
    await expect(resolveLocationQuery("Austin, TX")).resolves.toEqual({
      label: "Austin, TX",
      resolvedFromPostal: false,
    });
  });

  it("resolves ZIP codes to city and state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          places: [
            {
              "place name": "New York",
              "state abbreviation": "NY",
            },
          ],
        }),
      }),
    );

    await expect(resolveLocationQuery("10001")).resolves.toEqual({
      label: "New York, NY",
      resolvedFromPostal: true,
    });
  });
});
