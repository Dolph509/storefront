"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { MessagingUnavailableNotice } from "@/components/messages/MessagingUnavailableNotice";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useBuyerSellerChat } from "@/contexts/BuyerSellerChatContext";
import { buildAccountLoginHref } from "@/lib/utils/account-redirect";
import { extractBasePath } from "@/lib/utils/path";

interface AskAboutProductButtonProps {
  basePath: string;
  productId: string;
  productName: string;
  productSlug?: string;
  productThumbnailUrl?: string | null;
  sellerSlug?: string;
  sellerName?: string;
  sellerLogoUrl?: string | null;
  messagingAvailable?: boolean;
  buttonClassName?: string;
}

export function AskAboutProductButton({
  basePath,
  productId,
  productName,
  productSlug,
  productThumbnailUrl,
  sellerSlug,
  sellerName,
  sellerLogoUrl,
  messagingAvailable = true,
  buttonClassName,
}: AskAboutProductButtonProps) {
  const actionClassName = buttonClassName ?? "w-full justify-center";
  const tProducts = useTranslations("products");
  const tMessages = useTranslations("messages");
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { openChat } = useBuyerSellerChat();

  if (!isAuthenticated) {
    const loginHref = buildAccountLoginHref(
      extractBasePath(pathname),
      pathname,
    );
    return (
      <Button variant="outline" size="sm" className={actionClassName} asChild>
        <Link href={loginHref} className="inline-flex items-center gap-2">
          <MessageCircle className="size-4" aria-hidden />
          {tProducts("askAboutItem")}
        </Link>
      </Button>
    );
  }

  if (!messagingAvailable) {
    return (
      <div className="space-y-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={actionClassName}
          disabled
        >
          <MessageCircle className="size-4" aria-hidden />
          {tProducts("askAboutItem")}
        </Button>
        <MessagingUnavailableNotice className="text-center text-xs text-gray-500" />
      </div>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={actionClassName}
        onClick={() =>
          openChat({
            sellerSlug: sellerSlug ?? "",
            sellerName: sellerName?.trim() || tMessages("sellerFallback"),
            sellerLogoUrl,
            productId,
            productName,
            productSlug,
            productThumbnailUrl,
          })
        }
      >
        <MessageCircle className="size-4" aria-hidden />
        {tProducts("askAboutItem")}
      </Button>
    </>
  );
}
