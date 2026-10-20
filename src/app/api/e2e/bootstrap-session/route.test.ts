import { afterEach, describe, expect, it, vi } from "vitest";

const cookies = vi.hoisted(() => ({
  setAccessToken: vi.fn(),
  setRefreshToken: vi.fn(),
}));
vi.mock("@/lib/spree/cookies", () => cookies);

import { POST } from "./route";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("E2E session bootstrap isolation", () => {
  it("rejects production preview (form login is required)", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SPREE_REVIEW_E2E", "1");
    vi.stubEnv("E2E_PREVIEW", "1");
    vi.stubEnv("SPREE_API_URL", "http://127.0.0.1:3011");
    const response = await POST(
      new Request("http://localhost:3302/api/e2e/bootstrap-session", {
        method: "POST",
        body: JSON.stringify({ token: "access", refresh_token: "refresh" }),
      }),
    );
    expect(response.status).toBe(404);
    expect(cookies.setAccessToken).not.toHaveBeenCalled();
  });

  it("accepts isolated review E2E on localhost dev server", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SPREE_REVIEW_E2E", "1");
    vi.stubEnv("E2E_PREVIEW", "");
    vi.stubEnv("SPREE_API_URL", "http://127.0.0.1:3011");
    const response = await POST(
      new Request("http://127.0.0.1:3302/api/e2e/bootstrap-session", {
        method: "POST",
        body: JSON.stringify({ token: "access", refresh_token: "refresh" }),
      }),
    );
    expect(response.status).toBe(200);
    expect(cookies.setAccessToken).toHaveBeenCalledWith("access");
    expect(cookies.setRefreshToken).toHaveBeenCalledWith("refresh");
  });

  it("rejects non-localhost hostnames", async () => {
    vi.stubEnv("SPREE_REVIEW_E2E", "1");
    vi.stubEnv("E2E_PREVIEW", "");
    vi.stubEnv("SPREE_API_URL", "http://127.0.0.1:3011");
    const response = await POST(
      new Request("https://staging.example.com/api/e2e/bootstrap-session", {
        method: "POST",
        body: JSON.stringify({ token: "access", refresh_token: "refresh" }),
      }),
    );
    expect(response.status).toBe(404);
    expect(cookies.setAccessToken).not.toHaveBeenCalled();
  });

  it.each([
    "production",
    "test",
  ])("rejects %s without review E2E flag", async (environment) => {
    vi.stubEnv("NODE_ENV", environment);
    vi.stubEnv("SPREE_REVIEW_E2E", "");
    vi.stubEnv("E2E_PREVIEW", "1");
    vi.stubEnv("SPREE_API_URL", "http://127.0.0.1:3011");
    const response = await POST(
      new Request("http://localhost:3302/api/e2e/bootstrap-session", {
        method: "POST",
        body: JSON.stringify({ token: "test", refresh_token: "test" }),
      }),
    );
    expect(response.status).toBe(404);
    expect(cookies.setAccessToken).not.toHaveBeenCalled();
    expect(cookies.setRefreshToken).not.toHaveBeenCalled();
  });

  it.each([
    "preview",
    "production",
  ])("rejects a %s deployment in development mode", async (deployment) => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL_ENV", deployment);
    vi.stubEnv("SPREE_REVIEW_E2E", "1");
    vi.stubEnv("SPREE_API_URL", "http://127.0.0.1:3011");
    const response = await POST(
      new Request("http://localhost:3302/api/e2e/bootstrap-session", {
        method: "POST",
      }),
    );
    expect(response.status).toBe(404);
    expect(cookies.setAccessToken).not.toHaveBeenCalled();
  });
});
