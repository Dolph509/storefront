"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  listSellerApplications,
  type SellerApplicationRecord,
} from "@/lib/data/seller-applications";

export type SellerJourneyState =
  | "none"
  | "inProgress"
  | "underReview"
  | "decided"
  | "activate"
  | "setup"
  | "active";

const SETUP_SELLER_STATUSES = new Set([
  "pending",
  "invited",
  "onboarding",
  "ready_for_review",
]);

/**
 * Where a buyer is on the way to selling. `dashboardAccess` is the customer's
 * `seller_dashboard_access`: true only once they can sign in to the seller panel.
 */
export function sellerJourneyState(
  application: SellerApplicationRecord | null | undefined,
  dashboardAccess: boolean,
): SellerJourneyState {
  if (!application) return dashboardAccess ? "active" : "none";
  if (dashboardAccess && application.status !== "approved") return "active";

  switch (application.status) {
    case "draft":
    case "changes_requested":
      return "inProgress";
    case "submitted":
      return "underReview";
    case "rejected":
      return "decided";
  }

  if (!application.seller_access) return "activate";
  if (application.seller_status === "approved") return "active";
  if (SETUP_SELLER_STATUSES.has(application.seller_status ?? ""))
    return "setup";
  return "decided";
}

export function sellerJourneyLink(
  state: SellerJourneyState,
  basePath: string,
  sellerPanelHref?: string,
): { href: string; external: boolean } | null {
  switch (state) {
    case "none":
      return { href: `${basePath}/sell`, external: false };
    case "inProgress":
      return { href: `${basePath}/sell/apply`, external: false };
    case "underReview":
    case "decided":
    case "activate":
      return { href: `${basePath}/sell/application`, external: false };
    case "setup":
    case "active":
      return sellerPanelHref ? { href: sellerPanelHref, external: true } : null;
  }
}

/** The signed-in buyer's latest seller application and journey state. */
export function useSellerJourney() {
  const { isAuthenticated, user } = useAuth();
  const dashboardAccess = !!user?.seller_dashboard_access;
  const [application, setApplication] =
    useState<SellerApplicationRecord | null>(null);
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-read when the buyer changes or moves on, since submitting or resubmitting navigates
  useEffect(() => {
    if (!isAuthenticated) {
      setApplication(null);
      setLoaded(false);
      return;
    }
    let cancelled = false;
    listSellerApplications()
      .then((applications) => {
        if (!cancelled) setApplication(applications[0] ?? null);
      })
      .catch(() => {
        if (!cancelled) setApplication(null);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.id, pathname]);

  return {
    application,
    loaded,
    state: sellerJourneyState(application, dashboardAccess),
  };
}
