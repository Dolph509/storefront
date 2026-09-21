const SESSION_STORAGE_KEY = "spree:discovery:session_key";

/** Anonymous buyer session for discovery events (not PII). */
export function getDiscoverySessionKey(): string {
  if (typeof window === "undefined") {
    return "server";
  }
  try {
    const existing = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;
    const key =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_STORAGE_KEY, key);
    return key;
  } catch {
    return `sess_${Date.now()}`;
  }
}
