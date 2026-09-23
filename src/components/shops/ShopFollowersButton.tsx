"use client";

import type { SellerFollow } from "@spree/sdk";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { getSellerFollowers } from "@/lib/data/sellers";

interface ShopFollowersButtonProps {
  sellerIdOrSlug: string;
  followersCount: number;
  /** Inline count in the shop header stats row. */
  variant?: "header" | "sidebar";
}

export function ShopFollowersButton({
  sellerIdOrSlug,
  followersCount,
  variant = "header",
}: ShopFollowersButtonProps) {
  const t = useTranslations("sellers");
  const [open, setOpen] = useState(false);

  const triggerClass =
    variant === "header"
      ? "cursor-pointer text-inherit underline decoration-transparent underline-offset-2 hover:decoration-current"
      : "cursor-pointer font-medium tabular-nums text-[#222] underline decoration-transparent underline-offset-2 hover:decoration-current";

  const label =
    variant === "sidebar"
      ? followersCount.toLocaleString()
      : t("followersCount", { count: followersCount });

  return (
    <>
      <button
        type="button"
        className={triggerClass}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={t("followersDialogTitle")}
      >
        {variant === "sidebar" ? label : <span>{label}</span>}
      </button>
      {open ? (
        <ShopFollowersDialog
          sellerIdOrSlug={sellerIdOrSlug}
          followersCount={followersCount}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

function ShopFollowersDialog({
  sellerIdOrSlug,
  followersCount,
  onClose,
}: {
  sellerIdOrSlug: string;
  followersCount: number;
  onClose: () => void;
}) {
  const t = useTranslations("sellers");
  const [mounted, setMounted] = useState(false);
  const [rows, setRows] = useState<SellerFollow[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    startTransition(async () => {
      try {
        setLoadError(false);
        const response = await getSellerFollowers(sellerIdOrSlug, page, 24);
        setRows((prev) =>
          page === 1 ? response.data : [...prev, ...response.data],
        );
        setHasMore(response.meta?.next != null);
      } catch {
        setLoadError(true);
      }
    });
  }, [sellerIdOrSlug, page]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label={t("followersDialogClose")}
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shop-followers-title"
        className="relative z-[201] flex max-h-[min(32rem,85vh)] w-full max-w-md flex-col rounded-xl bg-white shadow-lg"
      >
        <div className="border-b border-[#e8e3df] px-5 py-4">
          <h2
            id="shop-followers-title"
            className="text-lg font-semibold text-[#222]"
          >
            {t("followersDialogTitle")}
          </h2>
          <p className="mt-0.5 text-sm text-[#595959]">
            {t("followersCount", { count: followersCount })}
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
          {loadError ? (
            <p className="py-6 text-center text-sm text-red-600">
              {t("followersDialogError")}
            </p>
          ) : pending && rows.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#595959]">
              {t("followersDialogLoading")}
            </p>
          ) : rows.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#595959]">
              {t("followersDialogEmpty")}
            </p>
          ) : (
            <ul className="divide-y divide-[#e8e3df]">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className="flex items-center gap-3 py-3 text-sm text-[#222]"
                >
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#faf8f7] text-sm font-medium text-[#595959]"
                    aria-hidden
                  >
                    {(row.customer_name ?? "?").slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0 truncate">
                    {row.customer_name ?? t("followersDialogAnonymous")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-[#e8e3df] px-5 py-4">
          {hasMore ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("followersDialogLoadMore")}
            </Button>
          ) : (
            <span />
          )}
          <Button type="button" variant="outline" onClick={onClose}>
            {t("followersDialogClose")}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
