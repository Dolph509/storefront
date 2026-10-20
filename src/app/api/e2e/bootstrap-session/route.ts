import { NextResponse } from "next/server";
import { setAccessToken, setRefreshToken } from "@/lib/spree/cookies";

function reviewE2eBootstrapAllowed(request: Request): boolean {
  if (process.env.SPREE_REVIEW_E2E !== "1") return false;
  if (process.env.E2E_PREVIEW === "1") return false;
  if (process.env.SPREE_API_URL !== "http://127.0.0.1:3011") return false;
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "development") {
    return false;
  }
  const hostname = new URL(request.url).hostname;
  return hostname === "localhost" || hostname === "127.0.0.1";
}

/**
 * Playwright-only session bootstrap. Sets auth cookies the same way login does.
 */
export async function POST(request: Request) {
  if (!reviewE2eBootstrapAllowed(request)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let body: { token?: string; refresh_token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 422 });
  }

  const token = body.token?.trim();
  const refreshToken = body.refresh_token?.trim();
  if (!token || !refreshToken) {
    return NextResponse.json({ error: "missing_tokens" }, { status: 422 });
  }

  await setAccessToken(token);
  await setRefreshToken(refreshToken);

  return NextResponse.json({ ok: true });
}
