"use client";

import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { openMessageThread } from "@/lib/data/messages";

interface ContactSellerButtonProps {
  orderId: string;
  basePath: string;
}

export function ContactSellerButton({
  orderId,
  basePath,
}: ContactSellerButtonProps) {
  const t = useTranslations("messages");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        const thread = await openMessageThread({
          subject_type: "order",
          subject_id: orderId,
        });
        router.push(`${basePath}/account/messages/${thread.id}`);
      } catch {
        setError(t("openFailed"));
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={handleClick}
      >
        <MessageCircle className="w-4 h-4" />
        {t("contactSeller")}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
