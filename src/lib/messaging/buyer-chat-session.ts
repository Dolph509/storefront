import type { MessageThread } from "@spree/sdk";
import type { BuyerSellerChatSession } from "@/contexts/BuyerSellerChatContext";

export function buyerChatSessionFromThread(
  thread: MessageThread,
  sellerFallback: string,
): BuyerSellerChatSession {
  return {
    threadId: thread.id,
    threadSnapshot: thread,
    sellerSlug: thread.seller_slug ?? "",
    sellerName: thread.seller_name?.trim() || sellerFallback,
    productName: thread.last_message_product_name ?? undefined,
  };
}
