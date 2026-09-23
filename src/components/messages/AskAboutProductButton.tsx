"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { MessagingUnavailableNotice } from "@/components/messages/MessagingUnavailableNotice";
import { PrePurchaseMessageComposer } from "@/components/messages/PrePurchaseMessageComposer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { buildAccountLoginHref } from "@/lib/utils/account-redirect";
import { extractBasePath } from "@/lib/utils/path";

interface AskAboutProductButtonProps {
  basePath: string;
  productId: string;
  productName: string;
  messagingAvailable?: boolean;
}

export function AskAboutProductButton({
  basePath,
  productId,
  productName,
  messagingAvailable = true,
}: AskAboutProductButtonProps) {
  const t = useTranslations("messages");
  const tProducts = useTranslations("products");
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) {
    const loginHref = buildAccountLoginHref(
      extractBasePath(pathname),
      pathname,
    );
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-center"
        asChild
      >
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
          className="w-full justify-center"
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
        className="w-full justify-center"
        onClick={() => setOpen(true)}
      >
        <MessageCircle className="size-4" aria-hidden />
        {tProducts("askAboutItem")}
      </Button>
      {open ? (
        <PrePurchaseMessageComposer
          basePath={basePath}
          productId={productId}
          productName={productName}
          title={tProducts("askAboutItem")}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
