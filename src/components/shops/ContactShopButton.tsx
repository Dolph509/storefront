"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { useState } from "react";
import { MessagingUnavailableNotice } from "@/components/messages/MessagingUnavailableNotice";
import { PrePurchaseMessageComposer } from "@/components/messages/PrePurchaseMessageComposer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { buildAccountLoginHref } from "@/lib/utils/account-redirect";
import { extractBasePath } from "@/lib/utils/path";

interface ContactShopButtonProps {
  basePath: string;
  sellerSlug: string;
  returnTo?: string;
  prominent?: boolean;
  block?: boolean;
  /** Header pill vs sidebar owner CTA. */
  label?: "contact" | "owner";
  messagingAvailable?: boolean;
  className?: string;
}

export function ContactShopButton({
  basePath,
  sellerSlug,
  returnTo,
  prominent = false,
  block = false,
  label = "contact",
  messagingAvailable = true,
  className,
}: ContactShopButtonProps) {
  const t = useTranslations("sellers");
  const tMessages = useTranslations("messages");
  const copy = label === "owner" ? t("contactShopOwner") : t("contactShop");
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const shopReturn = returnTo ?? pathname;
  const [open, setOpen] = useState(false);

  const blockClass = block
    ? "h-11 w-full justify-center rounded-lg border-[#243b36] bg-[#243b36] px-4 font-semibold text-white shadow-sm transition-colors hover:border-[#1d302c] hover:bg-[#1d302c] hover:text-white focus-visible:ring-2 focus-visible:ring-[#243b36] focus-visible:ring-offset-2"
    : "";
  const headerClass = prominent
    ? "h-9 rounded-full px-4 font-medium shadow-sm transition hover:brightness-95 focus-visible:ring-2 focus-visible:ring-offset-2"
    : "rounded-[var(--marketplace-radius-sm)]";
  const buttonClass = cn(block ? blockClass : headerClass, className);
  const buttonStyle = prominent && !block ? sellerActionStyle : undefined;

  if (!isAuthenticated) {
    const loginHref = buildAccountLoginHref(
      extractBasePath(pathname),
      shopReturn,
    );
    return (
      <Button
        variant="outline"
        size={block ? "default" : "sm"}
        className={buttonClass}
        style={buttonStyle}
        asChild
      >
        <Link
          href={loginHref}
          className="inline-flex items-center justify-center gap-2"
        >
          <MessageCircle className="size-[18px]" aria-hidden />
          <span>{copy}</span>
        </Link>
      </Button>
    );
  }

  if (!messagingAvailable) {
    return (
      <div className={block ? "w-full space-y-1" : "space-y-1"}>
        <Button
          type="button"
          variant="outline"
          size={block ? "default" : "sm"}
          className={buttonClass}
          style={buttonStyle}
          disabled
        >
          <MessageCircle className="size-[18px]" aria-hidden />
          <span>{copy}</span>
        </Button>
        <MessagingUnavailableNotice />
      </div>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size={block ? "default" : "sm"}
        className={buttonClass}
        style={buttonStyle}
        onClick={() => setOpen(true)}
      >
        <MessageCircle className="size-[18px]" aria-hidden />
        <span>{copy}</span>
      </Button>
      {open ? (
        <PrePurchaseMessageComposer
          basePath={basePath}
          sellerSlug={sellerSlug}
          title={tMessages("contactSellerTitle")}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

const sellerActionStyle = {
  backgroundColor: "var(--marketplace-seller-action-bg, #243b36)",
  borderColor: "var(--marketplace-seller-action-border, #243b36)",
  color: "var(--marketplace-seller-action-text, #fff)",
} as CSSProperties;
