"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import {
  createCustomOrderRequest,
  uploadCustomOrderAttachment,
} from "@/lib/data/sellers";

export function RequestCustomOrderForm({
  sellerId,
  basePath,
  sourceProductId,
  sourceProductName,
  initialOpen = false,
  ctaLabel,
  messagingAvailable = true,
}: {
  sellerId: string;
  basePath: string;
  sourceProductId?: string;
  sourceProductName?: string;
  initialOpen?: boolean;
  ctaLabel?: string;
  messagingAvailable?: boolean;
}) {
  const t = useTranslations("customOrders");
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(initialOpen);
  const [description, setDescription] = useState("");
  const [wantedByOn, setWantedByOn] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  if (!messagingAvailable) {
    return <p className="text-sm text-gray-500">{t("messagingUnavailable")}</p>;
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
    if (!isAuthenticated) {
      router.push(
        `${basePath}/account?returnTo=${encodeURIComponent(
          sourceProductId
            ? `${basePath}/products/${sourceProductId}`
            : `${basePath}/sellers/`,
        )}`,
      );
      toast.error(t("signInRequired"));
      return;
    }
    if (!description.trim()) {
      toast.error(t("descriptionRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const uploaded = await Promise.all(
        attachments.map(async (file) => {
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
      className="flex w-full max-w-lg flex-col gap-3 rounded-lg border p-4"
    >
      <h2 className="text-lg font-semibold">{t("formTitle")}</h2>
      <p className="text-muted-foreground text-sm">{t("formHelp")}</p>
      {sourceProductName ? (
        <p className="text-sm">
          <span className="font-medium">{t("sourceProductLabel")}: </span>
          {sourceProductName}
        </p>
      ) : null}
      <Textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder={t("descriptionPlaceholder")}
        rows={5}
        required
      />
      <div className="flex flex-col gap-1.5">
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
      <div className="flex flex-col gap-1.5">
        <label
          className="text-sm font-medium"
          htmlFor="custom-order-attachments"
        >
          {t("attachmentsLabel")}
        </label>
        <Input
          id="custom-order-attachments"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={(event) =>
            setAttachments(Array.from(event.target.files ?? []).slice(0, 5))
          }
        />
        <p className="text-muted-foreground text-xs">{t("attachmentsHelp")}</p>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? t("submitting") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
