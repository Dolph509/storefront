"use client";

import { ArrowRight, ImagePlus, LockKeyhole, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import {
  createCustomOrderRequest,
  uploadCustomOrderAttachment,
} from "@/lib/data/sellers";
import { buildAccountLoginHref } from "@/lib/utils/account-redirect";

export function RequestCustomOrderForm({
  sellerId,
  basePath,
  sourceProductId,
  sourceProductName,
  returnTo,
  initialOpen = false,
  ctaLabel,
  messagingAvailable = true,
}: {
  sellerId: string;
  basePath: string;
  sourceProductId?: string;
  sourceProductName?: string;
  returnTo?: string;
  initialOpen?: boolean;
  ctaLabel?: string;
  messagingAvailable?: boolean;
}) {
  const t = useTranslations("customOrders");
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(initialOpen);
  const [description, setDescription] = useState("");
  const [wantedByOn, setWantedByOn] = useState("");
  const [attachments, setAttachments] = useState<
    { file: File; previewUrl: string }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const previewUrls = useRef(new Set<string>());

  useEffect(
    () => () => {
      for (const url of previewUrls.current) {
        URL.revokeObjectURL(url);
      }
      previewUrls.current.clear();
    },
    [],
  );

  function addAttachments(files: File[]) {
    const remaining = Math.max(5 - attachments.length, 0);
    const added = files.slice(0, remaining).map((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrls.current.add(previewUrl);
      return { file, previewUrl };
    });
    setAttachments((current) => [...current, ...added]);
  }

  function removeAttachment(previewUrl: string) {
    URL.revokeObjectURL(previewUrl);
    previewUrls.current.delete(previewUrl);
    setAttachments((current) =>
      current.filter((attachment) => attachment.previewUrl !== previewUrl),
    );
  }

  if (!messagingAvailable) {
    return <p className="text-sm text-gray-500">{t("messagingUnavailable")}</p>;
  }

  if (loading) return null;

  if (!isAuthenticated) {
    const loginHref = buildAccountLoginHref(basePath, returnTo);

    return (
      <section className="w-full rounded-md border border-border bg-card p-6 sm:p-8">
        <div className="mx-auto flex max-w-lg flex-col items-center text-center">
          <span className="mb-4 flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <LockKeyhole aria-hidden="true" className="size-5" />
          </span>
          <h2 className="text-lg font-semibold">{t("signInTitle")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("signInRequired")}
          </p>
          <Button asChild className="mt-5">
            <Link href={loginHref}>
              {t("signInButton")}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        {ctaLabel ?? t("requestButton")}
      </Button>
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!description.trim()) {
      toast.error(t("descriptionRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const uploaded = await Promise.all(
        attachments.map(async ({ file }) => {
          const formData = new FormData();
          formData.set("file", file);
          return uploadCustomOrderAttachment(formData);
        }),
      );
      const request = await createCustomOrderRequest(sellerId, {
        description: description.trim(),
        wanted_by_on: wantedByOn || undefined,
        source_product_id: sourceProductId,
        attachments: uploaded.map((file) => file.signedId),
      });
      toast.success(t("submitted"));
      router.push(`${basePath}/account/custom-orders/${request.id}`);
    } catch {
      toast.error(t("submitFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full overflow-hidden rounded-md border border-border bg-card shadow-sm"
    >
      <header className="border-b border-border px-5 py-5 sm:px-7">
        <h2 className="text-lg font-semibold">{t("formTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("formHelp")}</p>
        {sourceProductName ? (
          <p className="mt-3 inline-flex max-w-full rounded-sm bg-muted px-3 py-1.5 text-sm">
            <span className="mr-1 shrink-0 font-medium">
              {t("sourceProductLabel")}:
            </span>
            <span className="truncate">{sourceProductName}</span>
          </p>
        ) : null}
      </header>
      <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.62fr)]">
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium"
            htmlFor="custom-order-description"
          >
            {t("descriptionLabel")}
          </label>
          <Textarea
            id="custom-order-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t("descriptionPlaceholder")}
            rows={8}
            className="min-h-44 resize-y"
            required
          />
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="wanted-by-on">
              {t("wantedByLabel")}
            </label>
            <Input
              id="wanted-by-on"
              type="date"
              value={wantedByOn}
              onChange={(event) => setWantedByOn(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium"
              htmlFor="custom-order-attachments"
            >
              {t("attachmentsLabel")}
            </label>
            <label
              htmlFor="custom-order-attachments"
              className={`flex min-h-28 flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/40 px-4 py-5 text-center transition-colors hover:bg-muted ${attachments.length < 5 ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
            >
              <ImagePlus
                aria-hidden="true"
                className="mb-2 size-5 text-muted-foreground"
              />
              <span className="text-sm font-medium">
                {t("attachmentsChoose")}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                {t("attachmentsCount", { count: attachments.length })}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                {t("attachmentsHelp")}
              </span>
            </label>
            <Input
              id="custom-order-attachments"
              type="file"
              aria-label={t("attachmentsLabel")}
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="sr-only"
              disabled={attachments.length >= 5}
              onChange={(event) => {
                addAttachments(Array.from(event.target.files ?? []));
                event.target.value = "";
              }}
            />
            {attachments.length > 0 ? (
              <ul
                className="grid grid-cols-3 gap-2 pt-1 sm:grid-cols-4"
                aria-label={t("attachmentsPreviewLabel")}
                aria-live="polite"
              >
                {attachments.map(({ file, previewUrl }) => (
                  <li
                    key={previewUrl}
                    className="relative aspect-square overflow-hidden rounded-sm border border-border bg-muted"
                  >
                    <Image
                      src={previewUrl}
                      alt={file.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-sm"
                      className="absolute right-1 top-1 shadow-sm"
                      aria-label={t("removeAttachment", { name: file.name })}
                      title={t("removeAttachment", { name: file.name })}
                      onClick={() => removeAttachment(previewUrl)}
                    >
                      <X aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
      <footer className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={submitting || !description.trim()}>
          {submitting ? t("submitting") : t("submit")}
        </Button>
      </footer>
    </form>
  );
}
