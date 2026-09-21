"use client";

import type { OrderProof } from "@spree/sdk";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  approveOrderProof,
  requestOrderProofChanges,
} from "@/lib/data/order-proofs";

type OrderProofPanelProps = {
  orderId: string;
  lineItemId: string;
  proofRequired?: boolean | null;
  proofs: OrderProof[];
};

export function OrderProofPanel({
  orderId,
  lineItemId,
  proofRequired,
  proofs,
}: OrderProofPanelProps) {
  const t = useTranslations("orderProofs");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [buyerResponse, setBuyerResponse] = useState("");

  const lineProofs = useMemo(
    () =>
      proofs
        .filter((proof) => proof.line_item_id === lineItemId)
        .sort((a, b) => b.version - a.version),
    [proofs, lineItemId],
  );

  if (!proofRequired) return null;

  const latest = lineProofs[0] ?? null;
  const actionable =
    latest?.status === "submitted"
      ? latest
      : (lineProofs.find((proof) => proof.status === "submitted") ?? null);

  async function onApprove() {
    if (!actionable) return;
    setError(null);
    startTransition(async () => {
      try {
        await approveOrderProof(orderId, actionable.id);
        setApproveOpen(false);
        router.refresh();
      } catch {
        setError(t("errors.approveFailed"));
      }
    });
  }

  async function onRequestChanges() {
    if (!actionable) return;
    const response = buyerResponse.trim();
    if (!response) {
      setError(t("errors.responseRequired"));
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await requestOrderProofChanges(orderId, actionable.id, response);
        setRequestOpen(false);
        setBuyerResponse("");
        router.refresh();
      } catch {
        setError(t("errors.requestFailed"));
      }
    });
  }

  return (
    <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-3">
      <p className="text-sm font-medium text-gray-900">{t("title")}</p>

      {!latest ? (
        <p className="text-sm text-gray-600">{t("awaitingSeller")}</p>
      ) : null}

      {latest?.status === "submitted" ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-900">
            {t("ready", { version: latest.version })}
          </p>
          <ProofImages images={latest.images} />
          {latest.seller_note ? (
            <p className="text-sm text-gray-600">
              <span className="font-medium">{t("sellerNote")}</span>{" "}
              {latest.seller_note}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={() => setApproveOpen(true)}
            >
              {t("approve")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => setRequestOpen(true)}
            >
              {t("requestChanges")}
            </Button>
          </div>
        </div>
      ) : null}

      {latest?.status === "changes_requested" ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-900">
            {t("changesRequested", { version: latest.version })}
          </p>
          {latest.buyer_response ? (
            <p className="text-sm text-gray-600">
              <span className="font-medium">{t("yourRequest")}</span>{" "}
              {latest.buyer_response}
            </p>
          ) : null}
          <p className="text-sm text-gray-500">{t("sellerRevising")}</p>
        </div>
      ) : null}

      {latest?.status === "approved" ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-900">
            {t("approved", { version: latest.version })}
          </p>
          <ProofImages images={latest.images} />
          {latest.responded_at ? (
            <p className="text-xs text-gray-500">
              {t("approvedOn", { date: latest.responded_at })}
            </p>
          ) : null}
        </div>
      ) : null}

      {lineProofs.length > 1 ? (
        <details className="text-sm text-gray-600">
          <summary className="cursor-pointer font-medium">
            {t("history")}
          </summary>
          <ul className="mt-2 space-y-1">
            {lineProofs.map((proof) => (
              <li key={proof.id}>
                {t("historyItem", {
                  version: proof.version,
                  status: t(`statuses.${proof.status}`, {
                    defaultValue: proof.status,
                  }),
                })}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {approveOpen ? (
        <div className="rounded-md border border-gray-200 bg-white p-3 space-y-3">
          <p className="text-sm font-medium text-gray-900">
            {t("approveConfirmTitle")}
          </p>
          <p className="text-sm text-gray-600">{t("approveConfirmBody")}</p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={onApprove}
            >
              {t("approveConfirm")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => setApproveOpen(false)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      ) : null}

      {requestOpen ? (
        <div className="rounded-md border border-gray-200 bg-white p-3 space-y-3">
          <p className="text-sm font-medium text-gray-900">
            {t("requestTitle")}
          </p>
          <p className="text-sm text-gray-600">{t("requestHelp")}</p>
          <Textarea
            value={buyerResponse}
            onChange={(event) => setBuyerResponse(event.target.value)}
            rows={3}
            disabled={pending}
            placeholder={t("requestPlaceholder")}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={onRequestChanges}
            >
              {t("sendRequest")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => setRequestOpen(false)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProofImages({ images }: { images: OrderProof["images"] }) {
  if (!images?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {images.map((image) => (
        <a
          key={image.id}
          href={image.url}
          target="_blank"
          rel="noreferrer"
          className="block"
        >
          {/* biome-ignore lint/performance/noImgElement: authorized private blob URLs */}
          <img
            src={image.url}
            alt={image.filename}
            className="h-24 w-24 rounded-md object-cover border border-gray-200"
          />
        </a>
      ))}
    </div>
  );
}
