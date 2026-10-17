"use client";

import { useEffect } from "react";
import { getOrCreateTrafficSessionToken } from "@/lib/traffic/tokens";

const COOKIE_NAME = "spree_traffic_session";
const MAX_AGE_SECONDS = 60 * 60 * 24;

/**
 * Mirrors the traffic session token into a first-party cookie so SSR can pass
 * `session_token` to personalization APIs without reading sessionStorage.
 */
export function TrafficSessionCookie() {
  useEffect(() => {
    const token = getOrCreateTrafficSessionToken();
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${MAX_AGE_SECONDS}; samesite=lax`;
  }, []);

  return null;
}
