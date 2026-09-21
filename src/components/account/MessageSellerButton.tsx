"use client";

import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { openMessageThread } from "@/lib/data/messages";

interface MessageSellerButtonProps {
  offerId: string;
  basePath: string;
}

export function MessageSellerButton({
  offerId,
  basePath,
}: MessageSellerButtonProps) {
  const t = useTranslations("offers");
  const tMessages = useTranslations("messages");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        const thread = await openMessageThread({
          subject_type: "buyer_offer",
          subject_id: offerId,
        });
        router.push(`${basePath}/account/messages/${thread.id}`);
      } catch {
        setError(tMessages("openFailed"));
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={handleClick}
      >
        <MessageCircle className="w-4 h-4" />
        {t("messageSeller")}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
