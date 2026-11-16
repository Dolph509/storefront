import Link from "next/link";
import {
  MarketplaceEmptyState,
  MarketplacePage,
} from "@/components/marketplace";

export default function CmsNotFound() {
  return (
    <MarketplacePage className="py-20">
      <MarketplaceEmptyState
        illustration="page-not-found"
        title="Page not found"
        description="This page may have moved or is no longer available."
        action={
          <Link
            href="/"
            className="font-medium text-marketplace-brand underline"
          >
            Return to the store
          </Link>
        }
      />
    </MarketplacePage>
  );
}
