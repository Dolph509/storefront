"use client";

import type { ProductReview, ReviewablePurchase } from "@spree/sdk";
import { ImagePlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useId, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createProductReview,
  updateProductReview,
  uploadReviewImage,
} from "@/lib/data/reviews";
import { StarRatingInput } from "./StarRating";

type PendingImage = {
  key: string;
  signedId: string;
  previewUrl: string;
  filename: string;
};

export type ReviewFormTarget =
  | { mode: "create"; purchase: ReviewablePurchase }
  | { mode: "edit"; review: ProductReview };

interface ReviewFormDialogProps {
  target: ReviewFormTarget;
  onClose: () => void;
}

export function ReviewFormDialog({ target, onClose }: ReviewFormDialogProps) {
  const t = useTranslations("reviews");
  const router = useRouter();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialRating = target.mode === "edit" ? target.review.rating : 0;
  const [rating, setRating] = useState(initialRating);
  const [title, setTitle] = useState(
    target.mode === "edit" ? (target.review.title ?? "") : "",
  );
  const [body, setBody] = useState(
    target.mode === "edit" ? (target.review.body ?? "") : "",
  );
  const [images, setImages] = useState<PendingImage[]>([]);

  const productLabel =
    target.mode === "create"
      ? target.purchase.product_name
      : target.review.product_name;

  const canSubmit =
    rating >= 1 &&
    rating <= 5 &&
    !pending &&
    !uploading &&
    (body.trim().length > 0 || title.trim().length > 0);

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
        const signedId = await uploadReviewImage(formData);
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
      const targetImage = current.find((image) => image.key === key);
      if (targetImage) URL.revokeObjectURL(targetImage.previewUrl);
      return current.filter((image) => image.key !== key);
    });
  }

  function handleSubmit() {
    if (!canSubmit) return;
    setError(null);
    startTransition(async () => {
      try {
        const imageIds = images.map((image) => image.signedId);
        if (target.mode === "create") {
          await createProductReview({
            line_item_id: target.purchase.line_item_id,
            rating,
            title: title.trim() || undefined,
            body: body.trim() || undefined,
            images: imageIds.length ? imageIds : undefined,
          });
        } else {
          await updateProductReview(target.review.id, {
            rating,
            title: title.trim() || undefined,
            body: body.trim() || undefined,
            images: imageIds.length ? imageIds : undefined,
          });
        }
        for (const image of images) URL.revokeObjectURL(image.previewUrl);
        router.refresh();
        onClose();
      } catch {
        setError(t("submitFailed"));
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-form-title"
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="review-form-title"
              className="text-lg font-semibold text-gray-900"
            >
              {target.mode === "create" ? t("writeReview") : t("editReview")}
            </h2>
            {productLabel ? (
              <p className="text-sm text-gray-500 mt-1">{productLabel}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
            onClick={onClose}
            aria-label={t("cancel")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div>
          <p className="text-sm font-medium text-gray-900 mb-2">
            {t("ratingLabel")}
          </p>
          <StarRatingInput
            value={rating}
            onChange={setRating}
            disabled={pending || uploading}
          />
        </div>

        <div>
          <label
            htmlFor="review-title"
            className="text-sm font-medium text-gray-900"
          >
            {t("titleOptional")}
          </label>
          <Input
            id="review-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            className="mt-1"
          />
        </div>

        <div>
          <label
            htmlFor="review-body"
            className="text-sm font-medium text-gray-900"
          >
            {t("bodyLabel")}
          </label>
          <Textarea
            id="review-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={5}
            maxLength={10_000}
            className="mt-1"
          />
        </div>

        {target.mode === "edit" && target.review.images?.length ? (
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">
              {t("existingPhotos")}
            </p>
            <ul className="flex flex-wrap gap-2">
              {target.review.images.map((image) => (
                <li key={image.id}>
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="size-16 rounded-md border object-cover"
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

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

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <div>
            <input
              ref={fileInputRef}
              id={fileInputId}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="sr-only"
              onChange={(event) => handleAddImages(event.target.files)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending || uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="w-4 h-4" />
              {t("addPhotos")}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
              {pending ? t("submitting") : t("submit")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
