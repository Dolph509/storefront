"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { type ComponentProps, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useBuyerSellerChat } from "@/contexts/BuyerSellerChatContext";
import { getMessageThread } from "@/lib/data/messages";
import { buyerChatSessionFromThread } from "@/lib/messaging/buyer-chat-session";

type OpenMessageThreadInDockButtonProps = Omit<
  ComponentProps<typeof Button>,
  "onClick"
> & {
  threadId: string;
  children: ReactNode;
};

export function OpenMessageThreadInDockButton({
  threadId,
  children,
  disabled: disabledProp,
  ...buttonProps
}: OpenMessageThreadInDockButtonProps) {
  const t = useTranslations("messages");
  const { openChat } = useBuyerSellerChat();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleOpen() {
    setError(null);
    startTransition(async () => {
      try {
        const thread = await getMessageThread(threadId);
        if (!thread) throw new Error("missing_thread");
        openChat(buyerChatSessionFromThread(thread, t("sellerFallback")));
      } catch {
        setError(t("openFailed"));
      }
    });
  }

  return (
    <div className="space-y-1">
      <Button
        type="button"
        {...buttonProps}
        disabled={pending || disabledProp}
        onClick={handleOpen}
      >
        {children}
      </Button>
      {error ? (
        <p className="text-center text-xs text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
