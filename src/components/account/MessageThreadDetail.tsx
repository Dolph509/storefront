"use client";

import type { Message, MessageThread } from "@spree/sdk";
import { ChevronLeft, Flag, ImagePlus, Send, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getAbuseReportReasons,
  markMessageThreadRead,
  reportMessageThread,
  sendMessageThreadReply,
  uploadMessageImage,
} from "@/lib/data/messages";

interface MessageThreadDetailProps {
  thread: MessageThread;
  messages: Message[];
  basePath: string;
  storeName?: string | null;
}

type PendingImage = {
  key: string;
  signedId: string;
  previewUrl: string;
  filename: string;
};

export function MessageThreadDetail({
  thread,
  messages,
  basePath,
  storeName,
}: MessageThreadDetailProps) {
  const t = useTranslations("messages");
  const router = useRouter();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState("");
  const [images, setImages] = useState<PendingImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  const chronological = useMemo(() => [...messages].reverse(), [messages]);
  const trimmed = body.trim();
  const canSend =
    (trimmed.length > 0 || images.length > 0) && !pending && !uploading;
  const marketplaceLabel = storeName?.trim() || t("marketplaceFallback");

  function subjectHref() {
    if (thread.subject_type === "order") {
      return `${basePath}/account/orders/${thread.subject_id}`;
    }
    if (thread.subject_type === "buyer_offer") {
      return `${basePath}/account/offers`;
    }
    return null;
  }

  async function handleAddImages(fileList: FileList | null) {
    if (!fileList?.length) return;
    setError(null);
    setUploading(true);
    try {
      const next: PendingImage[] = [];
      for (const file of Array.from(fileList)) {
        if (!file.type.startsWith("image/")) {
          setError(t("imagesType"));
          continue;
        }
        const formData = new FormData();
        formData.set("file", file);
        const signedId = await uploadMessageImage(formData);
        next.push({
          key: `${file.name}-${file.size}-${file.lastModified}`,
          signedId,
          previewUrl: URL.createObjectURL(file),
          filename: file.name,
        });
      }
      if (next.length) setImages((current) => [...current, ...next]);
    } catch {
      setError(t("imagesFailed"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(key: string) {
    setImages((current) => {
      const target = current.find((image) => image.key === key);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((image) => image.key !== key);
    });
  }

  function handleSend() {
    if (!canSend) return;
    setError(null);
    startTransition(async () => {
      try {
        await sendMessageThreadReply(
          thread.id,
          trimmed,
          images.map((image) => image.signedId),
        );
        for (const image of images) URL.revokeObjectURL(image.previewUrl);
        setBody("");
        setImages([]);
        await markMessageThreadRead(thread.id);
        router.refresh();
      } catch {
        setError(t("sendFailed"));
      }
    });
  }

  const href = subjectHref();

  return (
    <div>
      <Link
        href={`${basePath}/account/messages`}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        {t("backToInbox")}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {thread.seller_name || t("sellerFallback")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {href ? (
              <Link href={href} className="underline-offset-2 hover:underline">
                {t(`subject_${thread.subject_type}`, {
                  defaultValue: thread.subject_type,
                })}
              </Link>
            ) : (
              t(`subject_${thread.subject_type}`, {
                defaultValue: thread.subject_type,
              })
            )}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setReportOpen(true)}
        >
          <Flag className="w-4 h-4" />
          {t("report.action")}
        </Button>
      </div>

      <ul className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 mb-4">
        {chronological.map((message) => {
          const isBuyer = message.sender_type === "customer";
          const isOperator = message.sender_type === "operator";
          return (
            <li
              key={message.id}
              className={
                isBuyer
                  ? "ml-8 rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm"
                  : isOperator
                    ? "mr-8 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm"
                    : "mr-8 rounded-lg border border-gray-200 p-3 text-sm"
              }
            >
              <p className="text-xs text-gray-500 mb-1">
                {isOperator
                  ? t("fromMarketplace", { name: marketplaceLabel })
                  : t(`sender_${message.sender_type}`, {
                      defaultValue: message.sender_type,
                    })}
              </p>
              {message.body ? (
                <p className="whitespace-pre-wrap text-gray-900">
                  {message.body}
                </p>
              ) : null}
              {message.images?.length ? (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {message.images.map((image) => (
                    <li key={`${message.id}-${image.url}`}>
                      <a href={image.url} target="_blank" rel="noreferrer">
                        <img
                          src={image.url}
                          alt={image.filename}
                          className="max-h-40 max-w-[10rem] rounded-md border object-cover"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>

      {thread.writable ? (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            placeholder={t("composerPlaceholder")}
            maxLength={10_000}
          />
          {images.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {images.map((image) => (
                <li key={image.key} className="relative">
                  <img
                    src={image.previewUrl}
                    alt={image.filename}
                    className="size-16 rounded-md border object-cover"
                  />
                  <button
                    type="button"
                    className="absolute -top-1.5 -right-1.5 rounded-full bg-white border p-0.5"
                    onClick={() => removeImage(image.key)}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex items-center justify-between gap-2">
            <div>
              <input
                ref={fileInputRef}
                id={fileInputId}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="sr-only"
                onChange={(event) => void handleAddImages(event.target.files)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading || pending}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="w-4 h-4" />
                {t("addPhotos")}
              </Button>
            </div>
            <Button type="button" disabled={!canSend} onClick={handleSend}>
              <Send className="w-4 h-4" />
              {t("send")}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">{t("closedNotice")}</p>
      )}

      {reportOpen ? (
        <MessageReportDialog
          threadId={thread.id}
          onClose={() => setReportOpen(false)}
        />
      ) : null}
    </div>
  );
}

function MessageReportDialog({
  threadId,
  onClose,
}: {
  threadId: string;
  onClose: () => void;
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

  function handleSubmit() {
    if (!body.trim() || pending) return;
    setError(null);
    startTransition(async () => {
      try {
        await reportMessageThread({
          threadId,
          body: body.trim(),
          reasonId: reasonId || undefined,
        });
        onClose();
      } catch {
        setError(t("report.failed"));
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {t("report.title")}
        </h2>
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
