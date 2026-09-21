"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cancelCustomOrderRequest } from "@/lib/data/custom-orders";

export function CancelCustomOrderButton({ id }: { id: string }) {
  const t = useTranslations("customOrders");
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          await cancelCustomOrderRequest(id);
          toast.success(t("cancelled"));
          router.refresh();
        } catch {
          toast.error(t("cancelFailed"));
        } finally {
          setPending(false);
        }
      }}
    >
      {pending ? t("cancelling") : t("cancelRequest")}
    </Button>
  );
}
