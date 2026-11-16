const SESSION_KEY = "spree_traffic_session";
const VISITOR_KEY = "spree_traffic_visitor";

function randomToken(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getOrCreateTrafficSessionToken(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const token = randomToken();
    sessionStorage.setItem(SESSION_KEY, token);
    return token;
  } catch {
    return randomToken();
  }
}

/** Drop the guest session id after logout or account switch (client-only). */
export function resetTrafficSessionToken(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
  if (typeof document !== "undefined") {
    document.cookie = `${SESSION_KEY}=; path=/; max-age=0; samesite=lax`;
  }
}

export function getOrCreateTrafficVisitorToken(): string {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const token = randomToken();
    localStorage.setItem(VISITOR_KEY, token);
    return token;
  } catch {
    return randomToken();
  }
}
