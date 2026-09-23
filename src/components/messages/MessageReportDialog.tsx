"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getAbuseReportReasons,
  reportMessage,
  reportMessageThread,
} from "@/lib/data/messages";

type ReportSubject =
  | { kind: "thread"; threadId: string }
  | { kind: "message"; messageId: string };

export function MessageReportDialog({
  subject,
  onClose,
  onReported,
}: {
  subject: ReportSubject;
  onClose: () => void;
  onReported?: () => void;
}) {
  const t = useTranslations("messages");
  const [body, setBody] = useState("");
  const [reasonId, setReasonId] = useState("");
  const [reasons, setReasons] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    void getAbuseReportReasons().then((page) => {
      setReasons(
        (page.data ?? []).map((reason) => ({
          id: reason.id,
          name: reason.name,
        })),
      );
    });
  }, []);

  const title =
    subject.kind === "message" ? t("report.messageTitle") : t("report.title");

  function handleSubmit() {
    if (!body.trim() || pending) return;
    setError(null);
    startTransition(async () => {
      try {
        if (subject.kind === "message") {
          await reportMessage({
            messageId: subject.messageId,
            body: body.trim(),
            reasonId: reasonId || undefined,
          });
        } else {
          await reportMessageThread({
            threadId: subject.threadId,
            body: body.trim(),
            reasonId: reasonId || undefined,
          });
        }
        onReported?.();
        onClose();
      } catch {
        setError(t("report.failed"));
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600">{t("report.warning")}</p>
        {reasons.length > 0 ? (
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={reasonId}
            onChange={(event) => setReasonId(event.target.value)}
          >
            <option value="">{t("report.reasonNone")}</option>
            {reasons.map((reason) => (
              <option key={reason.id} value={reason.id}>
                {reason.name}
              </option>
            ))}
          </select>
        ) : null}
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={4}
          placeholder={t("report.placeholder")}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("report.cancel")}
          </Button>
          <Button
            type="button"
            disabled={!body.trim() || pending}
            onClick={handleSubmit}
          >
            {t("report.submit")}
          </Button>
        </div>
      </div>
    </div>
  );
}
