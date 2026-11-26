"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getSellerApplication,
  listSellerApplications,
  type SellerApplicationRecord,
} from "@/lib/data/seller-applications";

const STORAGE_KEY = "oddkeeps.seller_application";

export { EDITABLE_STATUSES } from "./application-status";

type StoredAccess = { id: string; accessToken: string };

function readStoredAccess(): StoredAccess | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredAccess>;
    if (!parsed.id || !parsed.accessToken) return null;
    return { id: parsed.id, accessToken: parsed.accessToken };
  } catch {
    return null;
  }
}

function writeStoredAccess(application: SellerApplicationRecord) {
  if (!application.access_token) return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        id: application.id,
        accessToken: application.access_token,
      }),
    );
  } catch {
    // Private browsing can refuse storage; the signed-in lookup still works.
  }
}

function clearStoredAccess() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * The applicant's one seller application: the draft saved in this browser,
 * or the latest application linked to the signed-in customer.
 */
export function useSellerApplication() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [application, setApplicationState] =
    useState<SellerApplicationRecord | null>(null);
  const [accessToken, setAccessToken] = useState("");
  const [lookupFailed, setLookupFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  const setApplication = useCallback((next: SellerApplicationRecord) => {
    setApplicationState(next);
    if (next.access_token) {
      setAccessToken(next.access_token);
      writeStoredAccess(next);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    async function load() {
      if (isAuthenticated) {
        const applications = await listSellerApplications();
        if (cancelled) return;
        const existing =
          applications.find(
            (item) => !["draft", "changes_requested"].includes(item.status),
          ) ?? applications[0];
        if (existing) {
          setApplicationState(existing);
          const stored = readStoredAccess();
          setAccessToken(
            existing.access_token ||
              (stored?.id === existing.id ? stored.accessToken : ""),
          );
          writeStoredAccess(existing);
          return;
        }
      }
      const stored = readStoredAccess();
      if (stored) {
        try {
          const found = await getSellerApplication(
            stored.id,
            stored.accessToken,
          );
          if (cancelled) return;
          setApplicationState(found);
          setAccessToken(found.access_token || stored.accessToken);
          return;
        } catch {
          clearStoredAccess();
        }
      }
    }

    setApplicationState(null);
    setAccessToken("");
    setLookupFailed(false);
    setLoading(true);
    void load()
      .catch(() => {
        if (!cancelled) setLookupFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, user?.id]);

  if (lookupFailed) throw new Error("Unable to load your seller application.");
  return { application, accessToken, loading, setApplication };
}
