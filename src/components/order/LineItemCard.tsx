"use client";

import type { Order, OrderProof } from "@spree/sdk";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { OrderProofPanel } from "@/components/order/OrderProofPanel";
import { PersonalizationSnapshot } from "@/components/products/PersonalizationSnapshot";
import { LineItemReviewActions } from "@/components/reviews/LineItemReviewActions";
import { ProductImage } from "@/components/ui/product-image";
import type { LineItemReviewState } from "@/lib/reviews/line-item-review-state";

interface LineItemCardProps {
  item: Order["items"][number];
  basePath: string;
  orderId?: string;
  proofs?: OrderProof[];
  reviewState?: LineItemReviewState;
}

export function LineItemCard({
  item,
  basePath,
  orderId,
  proofs = [],
  reviewState,
}: LineItemCardProps) {
  const t = useTranslations("orders");
  return (
    <div className="flex gap-4">
      <Link
        href={`${basePath}/products/${item.slug}`}
        className="relative w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0"
      >
        <ProductImage
          src={item.thumbnail_url}
          alt={item.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          href={`${basePath}/products/${item.slug}`}
          className="text-sm font-medium text-gray-900 hover:text-primary transition-colors line-clamp-2"
        >
          {item.name}
        </Link>
        <div className="mt-1 text-sm text-gray-900">{item.display_price}</div>
        {item.options_text && (
          <p className="mt-1 text-xs text-gray-500">{item.options_text}</p>
        )}
        <PersonalizationSnapshot
          snapshot={item.personalization_snapshot}
          proofRequired={item.proof_required}
          files={item.personalization_files}
        />
        {orderId ? (
          <OrderProofPanel
            orderId={orderId}
            lineItemId={item.id}
            proofRequired={item.proof_required}
            proofs={proofs}
          />
        ) : null}
        <p className="mt-1 text-xs text-gray-500">
          {t("qty", { quantity: item.quantity })}
        </p>
        <Link
          href={`${basePath}/products/${item.slug}`}
          className="mt-2 inline-block text-sm text-primary hover:text-primary font-medium"
        >
          {t("orderAgain")}
        </Link>
        {reviewState ? <LineItemReviewActions state={reviewState} /> : null}
      </div>

      <div className="text-sm font-medium text-gray-900">
        {item.display_total}
      </div>
    </div>
  );
}
