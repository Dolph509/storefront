"use client";

import type { MessageThread } from "@spree/sdk";
import { usePathname } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { BuyerSellerChatDock } from "@/components/messages/BuyerSellerChatDock";
import { extractBasePath } from "@/lib/utils/path";

export type BuyerSellerChatSession = {
  sellerSlug: string;
  sellerName: string;
  sellerLogoUrl?: string | null;
  productId?: string;
  productName?: string;
  productSlug?: string;
  productThumbnailUrl?: string | null;
  /** Skip lookup when the caller already knows the thread. */
  threadId?: string;
  /** Inbox or SSR thread row — opens the dock without a blocking load state. */
  threadSnapshot?: MessageThread;
};

type BuyerSellerChatContextValue = {
  session: BuyerSellerChatSession | null;
  openChat: (session: BuyerSellerChatSession) => void;
  closeChat: () => void;
};

const BuyerSellerChatContext =
  createContext<BuyerSellerChatContextValue | null>(null);

export function BuyerSellerChatProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const basePath = extractBasePath(pathname);
  const [session, setSession] = useState<BuyerSellerChatSession | null>(null);

  const openChat = useCallback((next: BuyerSellerChatSession) => {
    setSession(next);
  }, []);

  const closeChat = useCallback(() => {
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, openChat, closeChat }),
    [session, openChat, closeChat],
  );

  return (
    <BuyerSellerChatContext.Provider value={value}>
      {children}
      {session ? (
        <BuyerSellerChatDock
          basePath={basePath}
          session={session}
          onClose={closeChat}
        />
      ) : null}
    </BuyerSellerChatContext.Provider>
  );
}

export function useBuyerSellerChat() {
  const context = useContext(BuyerSellerChatContext);
  if (!context) {
    throw new Error(
      "useBuyerSellerChat must be used within BuyerSellerChatProvider",
    );
  }
  return context;
}
