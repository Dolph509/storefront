"use client";

import { HelpCircle, ImagePlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useId, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  sendMessageThreadReply,
  uploadMessageImage,
} from "@/lib/data/messages";
import { createOrderHelpRequest } from "@/lib/data/order-help";

const REASON_KEYS = [
  "not_arrived",
  "damaged",
  "not_as_described",
  "wrong_item",
  "shipping",
  "refund",
  "replacement",
  "other",
] as const;

const RESOLUTION_KEYS = [
  "replacement",
  "refund",
  "return",
  "seller_assistance",
  "other",
] as const;

type PendingImage = {
  key: string;
  signedId: string;
  previewUrl: string;
  filename: string;
};

interface GetHelpButtonProps {
  orderId: string;
  basePath: string;
  disabled?: boolean;
}

export function GetHelpButton({
  orderId,
  basePath,
  disabled = false,
}: GetHelpButtonProps) {
  const t = useTranslations("orderHelp");
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <HelpCircle className="w-4 h-4" />
        {t("getHelp")}
      </Button>
      {disabled ? (
        <p className="text-sm text-gray-500">{t("alreadyOpen")}</p>
      ) : null}
      {open ? (
        <GetHelpDialog
          orderId={orderId}
          basePath={basePath}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}

function GetHelpDialog({
  orderId,
  basePath,
  onClose,
}: {
  orderId: string;
  basePath: string;
  onClose: () => void;
}) {
  const t = useTranslations("orderHelp");
  const router = useRouter();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"reason" | "resolution" | "message">(
    "reason",
  );
  const [reasonKey, setReasonKey] = useState<(typeof REASON_KEYS)[number] | "">(
    "",
  );
  const [resolutionKey, setResolutionKey] = useState<
    (typeof RESOLUTION_KEYS)[number] | ""
  >("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<PendingImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

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

  function handleSubmit() {
    if (!reasonKey || pending || uploading) return;
    setError(null);
    startTransition(async () => {
      try {
        const reason = t(`reasons.${reasonKey}`);
        const requested_resolution = resolutionKey
          ? t(`resolutions.${resolutionKey}`)
          : undefined;
        const help = await createOrderHelpRequest(orderId, {
          reason,
          requested_resolution,
        });
        const threadId = help.message_thread_id;
        const trimmed = body.trim();
        if (threadId && (trimmed || images.length > 0)) {
          await sendMessageThreadReply(
            threadId,
            trimmed,
            images.map((image) => image.signedId),
          );
        }
        for (const image of images) URL.revokeObjectURL(image.previewUrl);
        if (threadId) {
          router.push(`${basePath}/account/messages/${threadId}`);
        } else {
          router.refresh();
          onClose();
        }
      } catch {
        setError(t("failed"));
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">{t("title")}</h2>

        {step === "reason" ? (
          <>
            <p className="text-sm text-gray-600">{t("stepReason")}</p>
            <ul className="space-y-2">
              {REASON_KEYS.map((key) => (
                <li key={key}>
                  <button
                    type="button"
                    className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                      reasonKey === key
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => setReasonKey(key)}
                  >
                    {t(`reasons.${key}`)}
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {t("cancel")}
              </Button>
              <Button
                type="button"
                disabled={!reasonKey}
                onClick={() => setStep("resolution")}
              >
                {t("continue")}
              </Button>
            </div>
          </>
        ) : null}

        {step === "resolution" ? (
          <>
            <p className="text-sm text-gray-600">{t("stepResolution")}</p>
            <ul className="space-y-2">
              {RESOLUTION_KEYS.map((key) => (
                <li key={key}>
                  <button
                    type="button"
                    className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                      resolutionKey === key
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => setResolutionKey(key)}
                  >
                    {t(`resolutions.${key}`)}
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("reason")}
              >
                {t("back")}
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setResolutionKey("");
                    setStep("message");
                  }}
                >
                  {t("skipResolution")}
                </Button>
                <Button type="button" onClick={() => setStep("message")}>
                  {t("continue")}
                </Button>
              </div>
            </div>
          </>
        ) : null}

        {step === "message" ? (
          <>
            <p className="text-sm text-gray-600">{t("stepMessage")}</p>
            <Textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={4}
              placeholder={t("messagePlaceholder")}
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
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="flex justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("resolution")}
              >
                {t("back")}
              </Button>
              <Button
                type="button"
                disabled={pending || uploading}
                onClick={handleSubmit}
              >
                {t("submit")}
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
