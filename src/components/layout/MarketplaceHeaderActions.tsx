"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { MessagesNavBadge } from "@/components/account/MessagesNavBadge";
import { Heart, MessageCircle, User } from "@/components/icons";
import { CartButton } from "@/components/layout/CartButton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface MarketplaceHeaderActionsProps {
  basePath: string;
  sellHref?: string;
  sellLabel: string;
  variant?: "marketplace" | "compact" | "etsy";
}

export function MarketplaceHeaderActions({
  basePath,
  sellHref,
  sellLabel,
  variant = "marketplace",
}: MarketplaceHeaderActionsProps) {
  const t = useTranslations("header");
  const { isAuthenticated } = useAuth();

  if (variant === "compact") {
    return (
      <div className="flex shrink-0 items-center gap-4 text-sm font-medium text-[#2f2933]">
        <Link
          href={`${basePath}/account`}
          className="whitespace-nowrap hover:underline"
        >
          {isAuthenticated ? t("myAccount") : t("signIn")}
        </Link>
        <CartButton compact />
      </div>
    );
  }

  if (variant === "etsy") {
    return (
      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
        <Link
          href={`${basePath}/account`}
          className="hidden whitespace-nowrap px-2 py-2 text-sm font-medium text-[#2f2933] hover:underline md:inline"
        >
          {isAuthenticated ? t("myAccount") : t("signIn")}
        </Link>
        <HeaderIconLink
          href={`${basePath}/account/favorites`}
          label={t("favorites")}
          icon={<Heart className="size-6 stroke-[1.5]" />}
          className="!text-[#2f2933] [&_span]:text-[#2f2933]"
        />
        <HeaderIconLink
          href={`${basePath}/account/messages`}
          label={t("messages")}
          icon={<MessageCircle className="size-6 stroke-[1.5]" />}
          badge={<MessagesNavBadge />}
          className="!text-[#2f2933] [&_span]:text-[#2f2933]"
        />
        <CartButton compact />
        <HeaderIconLink
          href={`${basePath}/account`}
          label={isAuthenticated ? t("myAccount") : t("signIn")}
          icon={<User className="size-6 stroke-[1.5]" />}
          className="!text-[#2f2933] md:hidden [&_span]:text-[#2f2933]"
        />
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
      <HeaderIconLink
        href={`${basePath}/account/favorites`}
        label={t("favorites")}
        icon={<Heart className="size-[1.35rem] sm:size-6" />}
      />
      <HeaderIconLink
        href={`${basePath}/account/messages`}
        label={t("messages")}
        icon={<MessageCircle className="size-[1.35rem] sm:size-6" />}
        badge={<MessagesNavBadge />}
      />
      <CartButton />
      <Link
        href={`${basePath}/account`}
        className="hidden whitespace-nowrap px-2 text-sm font-medium text-marketplace-brand hover:underline lg:inline"
      >
        {isAuthenticated ? t("myAccount") : t("signIn")}
      </Link>
      {sellHref ? (
        <Button
          asChild
          size="sm"
          className="hidden h-9 rounded-lg bg-marketplace-brand px-4 text-xs font-semibold text-marketplace-brand-foreground hover:bg-marketplace-brand/90 lg:inline-flex"
        >
          <a href={sellHref}>{sellLabel}</a>
        </Button>
      ) : null}
      <HeaderIconLink
        href={`${basePath}/account`}
        label={isAuthenticated ? t("myAccount") : t("signIn")}
        icon={<User className="size-[1.35rem]" />}
        className="lg:hidden"
      />
    </div>
  );
}

function HeaderIconLink({
  href,
  label,
  icon,
  badge,
  className,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`flex min-w-[3.25rem] flex-col items-center gap-1 px-0.5 py-0.5 text-[10px] font-medium text-marketplace-brand hover:text-marketplace-foreground sm:min-w-[3.75rem] sm:text-[11px] ${className ?? ""}`}
    >
      <span className="relative flex items-center text-marketplace-brand">
        {icon}
        {badge ? (
          <span className="absolute -right-2 -top-1">{badge}</span>
        ) : null}
      </span>
      <span className="hidden leading-none sm:inline">{label}</span>
    </Link>
  );
}
