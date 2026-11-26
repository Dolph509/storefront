"use client";

import type { MessageThread } from "@spree/sdk";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { useBuyerSellerChat } from "@/contexts/BuyerSellerChatContext";
import { buyerChatSessionFromThread } from "@/lib/messaging/buyer-chat-session";

export function MessageThreadDockRedirect({
  thread,
  basePath,
}: {
  thread: MessageThread;
  basePath: string;
}) {
  const { openChat } = useBuyerSellerChat();
  const router = useRouter();
  const t = useTranslations("messages");
  const opened = useRef(false);

  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    openChat(buyerChatSessionFromThread(thread, t("sellerFallback")));
    router.replace(`${basePath}/account/messages`);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once per thread mount
  }, [thread.id, basePath]);

  return null;
}
