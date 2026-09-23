"use client";

import type { Message, MessageThread } from "@spree/sdk";
import {
  ChevronLeft,
  Flag,
  ImagePlus,
  MoreVertical,
  Send,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useId, useMemo, useRef, useState, useTransition } from "react";
import { MessageProductContextCard } from "@/components/messages/MessageProductContextCard";
import { MessageReportDialog } from "@/components/messages/MessageReportDialog";
import { MessagingUnavailableNotice } from "@/components/messages/MessagingUnavailableNotice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { blockSeller, unblockSeller } from "@/lib/data/communication-blocks";
import {
  markMessageThreadRead,
  sendMessageThreadReply,
  uploadMessageImage,
} from "@/lib/data/messages";

type ThreadWithBlock = MessageThread & {
  communication_block_id?: string | null;
};

interface MessageThreadDetailProps {
  thread: ThreadWithBlock;
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
  const [reportSubject, setReportSubject] = useState<
    | { kind: "thread"; threadId: string }
    | { kind: "message"; messageId: string }
    | null
  >(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  const chronological = useMemo(() => [...messages].reverse(), [messages]);
  const trimmed = body.trim();
  const canSend =
    (trimmed.length > 0 || images.length > 0) && !pending && !uploading;
  const marketplaceLabel = storeName?.trim() || t("marketplaceFallback");
  const buyerBlockId = thread.communication_block_id ?? null;
  const isGeneral = thread.subject_type === "general";

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

  function handleBlock() {
    if (
      !window.confirm(
        `${t("block.confirmTitle")}\n\n${t("block.confirmDescription")}`,
      )
    ) {
      return;
    }
    setMenuOpen(false);
    startTransition(async () => {
      try {
        await blockSeller(thread.seller_id);
        router.refresh();
      } catch {
        setError(t("block.failed"));
      }
    });
  }

  function handleUnblock() {
    if (!buyerBlockId) return;
    setMenuOpen(false);
    startTransition(async () => {
      try {
        await unblockSeller(buyerBlockId);
        router.refresh();
      } catch {
        setError(t("unblock.failed"));
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
        <div className="relative flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setReportSubject({ kind: "thread", threadId: thread.id })
            }
          >
            <Flag className="w-4 h-4" />
            {t("report.action")}
          </Button>
          {isGeneral ? (
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
              {menuOpen ? (
                <div className="absolute right-0 z-10 mt-1 min-w-44 rounded-md border border-gray-200 bg-white py-1 shadow-md">
                  {buyerBlockId ? (
                    <button
                      type="button"
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                      onClick={handleUnblock}
                    >
                      {t("unblock.action")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="block w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-gray-50"
                      onClick={handleBlock}
                    >
                      {t("block.action")}
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
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
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-xs text-gray-500">
                  {isOperator
                    ? t("fromMarketplace", { name: marketplaceLabel })
                    : t(`sender_${message.sender_type}`, {
                        defaultValue: message.sender_type,
                      })}
                </p>
                {!isBuyer && message.sender_type === "seller" ? (
                  <button
                    type="button"
                    className="text-xs text-gray-500 underline-offset-2 hover:underline"
                    onClick={() =>
                      setReportSubject({
                        kind: "message",
                        messageId: message.id,
                      })
                    }
                  >
                    {t("reportMessage")}
                  </button>
                ) : null}
              </div>
              <MessageProductContextCard
                message={message}
                basePath={basePath}
              />
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
        <MessagingUnavailableNotice />
      )}

      {reportSubject ? (
        <MessageReportDialog
          subject={reportSubject}
          onClose={() => setReportSubject(null)}
        />
      ) : null}
    </div>
  );
}
