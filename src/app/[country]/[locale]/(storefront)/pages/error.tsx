"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { EmptyStateIllustration } from "@/components/empty-states/EmptyStateIllustration";
import { MarketplacePage } from "@/components/marketplace";

export default function CmsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <MarketplacePage className="flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <EmptyStateIllustration
        name="could-not-connect"
        className="text-marketplace-brand"
      />
      <h1 className="mt-6 text-2xl font-semibold text-marketplace-foreground">
        Could not load this page
      </h1>
      <p className="mt-2 text-marketplace-muted-foreground">
        Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 border-b border-marketplace-brand pb-1 font-medium text-marketplace-brand"
      >
        Try again
      </button>
    </MarketplacePage>
  );
}
