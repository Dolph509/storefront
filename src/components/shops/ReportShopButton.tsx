"use client";

import { Flag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import {
  getSellerAbuseReportReasons,
  reportSellerShop,
} from "@/lib/data/abuse-reports";

interface ReportShopButtonProps {
  sellerId: string;
  marketplaceName: string;
  /** Inline link in the shop header row (after Follow). */
  variant?: "header" | "sidebar";
}

export function ReportShopButton({
  sellerId,
  marketplaceName,
  variant = "sidebar",
}: ReportShopButtonProps) {
  const t = useTranslations("sellers");
  const [open, setOpen] = useState(false);

  const triggerClass =
    variant === "header"
      ? "inline-flex shrink-0 items-center gap-1.5 border-0 bg-transparent p-0 text-sm text-[#595959] underline decoration-[#595959]/40 underline-offset-2 hover:text-[#222] hover:decoration-[#222]"
      : "inline-flex w-full items-center justify-start gap-1.5 rounded-sm border-0 bg-transparent px-0 py-1 text-left text-xs text-[#595959] underline decoration-[#595959]/40 underline-offset-2 hover:text-[#222] hover:decoration-[#222]";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClass}
      >
        <Flag className="size-3.5 shrink-0" aria-hidden />
        {t("reportShopToMarketplace", { marketplace: marketplaceName })}
      </button>
      {open ? (
        <ReportShopDialog sellerId={sellerId} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}

function ReportShopDialog({
  sellerId,
  onClose,
}: {
  sellerId: string;
  onClose: () => void;
}) {
  const t = useTranslations("sellers");
  const tMessages = useTranslations("messages");
  const { isAuthenticated } = useAuth();
  const [body, setBody] = useState("");
  const [reasonId, setReasonId] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [reasons, setReasons] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    void getSellerAbuseReportReasons().then((page) => {
      setReasons(
        (page.data ?? []).map((reason) => ({
          id: reason.id,
          name: reason.name,
        })),
      );
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function handleSubmit() {
    if (!body.trim() || pending) return;
    if (!isAuthenticated && !reporterEmail.trim()) {
      setError(t("reportShopEmailRequired"));
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await reportSellerShop({
          sellerId,
          body: body.trim(),
          reasonId: reasonId || undefined,
          reporterEmail: isAuthenticated ? undefined : reporterEmail.trim(),
        });
        onClose();
      } catch {
        setError(tMessages("report.failed"));
      }
    });
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label={tMessages("report.cancel")}
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-shop-title"
        className="relative z-[201] w-full max-w-md space-y-4 rounded-xl bg-white p-5 shadow-lg"
      >
        <h2
          id="report-shop-title"
          className="text-lg font-semibold text-gray-900"
        >
          {t("reportShopTitle")}
        </h2>
        <p className="text-sm text-gray-600">{tMessages("report.warning")}</p>
        {reasons.length > 0 ? (
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={reasonId}
            onChange={(event) => setReasonId(event.target.value)}
          >
            <option value="">{tMessages("report.reasonNone")}</option>
            {reasons.map((reason) => (
              <option key={reason.id} value={reason.id}>
                {reason.name}
              </option>
            ))}
          </select>
        ) : null}
        {!isAuthenticated ? (
          <input
            type="email"
            autoComplete="email"
            value={reporterEmail}
            onChange={(event) => setReporterEmail(event.target.value)}
            placeholder={t("reportShopEmailPlaceholder")}
            className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
          />
        ) : null}
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={4}
          placeholder={tMessages("report.placeholder")}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {tMessages("report.cancel")}
          </Button>
          <Button
            type="button"
            disabled={!body.trim() || pending}
            onClick={handleSubmit}
          >
            {tMessages("report.submit")}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
