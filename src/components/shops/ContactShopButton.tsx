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

interface ContactShopButtonProps {
  basePath: string;
  sellerSlug: string;
  returnTo?: string;
  prominent?: boolean;
  block?: boolean;
  /** Header pill vs sidebar owner CTA. */
  label?: "contact" | "owner";
  messagingAvailable?: boolean;
}

export function ContactShopButton({
  basePath,
  sellerSlug,
  returnTo,
  prominent = false,
  block = false,
  label = "contact",
  messagingAvailable = true,
}: ContactShopButtonProps) {
  const t = useTranslations("sellers");
  const tMessages = useTranslations("messages");
  const copy = label === "owner" ? t("contactShopOwner") : t("contactShop");
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const shopReturn = returnTo ?? pathname;
  const [open, setOpen] = useState(false);

  const blockClass = block
    ? "h-10 w-full justify-center border-[#222] bg-white text-[#222] rounded-md"
    : "";
  const headerClass = prominent
    ? "rounded-full border-[#222] bg-white text-[#222] hover:bg-[#faf8f7]"
    : "rounded-full";
  const buttonClass = block ? blockClass : headerClass;

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
        asChild
      >
        <Link href={loginHref} className="inline-flex items-center gap-1.5">
          <MessageCircle className="size-4" aria-hidden />
          {copy}
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
          disabled
        >
          <MessageCircle className="size-4" aria-hidden />
          {copy}
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
        onClick={() => setOpen(true)}
      >
        <MessageCircle className="size-4" aria-hidden />
        {copy}
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
