"use client";

import { Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SellerShopShareButtonProps {
  url: string;
  label: string;
}

export function SellerShopShareButton({
  url,
  label,
}: SellerShopShareButtonProps) {
  const t = useTranslations("sellers");
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const absolute =
      typeof window !== "undefined" && url.startsWith("/")
        ? `${window.location.origin}${url}`
        : url;
    try {
      if (navigator.share) {
        await navigator.share({ url: absolute, title: document.title });
        return;
      }
      await navigator.clipboard.writeText(absolute);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user dismissed share sheet */
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleShare}
      aria-label={label}
    >
      <Share2 className="size-4" aria-hidden />
      {copied ? t("linkCopied") : label}
    </Button>
  );
}
