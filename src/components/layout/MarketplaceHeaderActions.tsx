"use client";

import { ChatCircleDots } from "@phosphor-icons/react/dist/csr/ChatCircleDots";
import { Heart } from "@phosphor-icons/react/dist/csr/Heart";
import { User } from "@phosphor-icons/react/dist/csr/User";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { MessagesNavBadge } from "@/components/account/MessagesNavBadge";
import { CartButton } from "@/components/layout/CartButton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useStoreThemeSettings } from "@/contexts/ThemeSettingsContext";
import { themeSettingEnabled } from "@/lib/theme/setting-value";

interface MarketplaceHeaderActionsProps {
  basePath: string;
  sellHref?: string;
  sellLabel: string;
  variant?: "marketplace" | "compact" | "etsy";
  showAccount?: boolean;
}

export function MarketplaceHeaderActions({
  basePath,
  sellHref,
  sellLabel,
  variant = "marketplace",
  showAccount = true,
}: MarketplaceHeaderActionsProps) {
  const t = useTranslations("header");
  const { isAuthenticated } = useAuth();
  const { general } = useStoreThemeSettings();
  const showWishlist = themeSettingEnabled(general?.enable_wishlist, true);
  const wishlistHref =
    typeof general?.wishlist_page_slug === "string" &&
    general.wishlist_page_slug
      ? `${basePath}/pages/${encodeURIComponent(general.wishlist_page_slug)}`
      : `${basePath}/account/favorites`;

  if (variant === "compact") {
    return (
      <div className="flex shrink-0 items-center gap-4 text-sm font-medium text-[#2f2933]">
        {showAccount && (
          <Link
            data-theme-header-account="true"
            href={`${basePath}/account`}
            className="whitespace-nowrap hover:underline"
          >
            {isAuthenticated ? t("myAccount") : t("signIn")}
          </Link>
        )}
        <CartButton compact />
      </div>
    );
  }

  if (variant === "etsy") {
    return (
      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
        <Link
          data-theme-header-account="true"
          href={`${basePath}/account`}
          className="hidden whitespace-nowrap px-2 py-2 text-sm font-medium text-[#2f2933] hover:underline md:inline"
          style={showAccount ? undefined : { display: "none" }}
        >
          {isAuthenticated ? t("myAccount") : t("signIn")}
        </Link>
        {showWishlist && (
          <HeaderIconLink
            href={wishlistHref}
            label={t("favorites")}
            icon={<Heart className="size-6" weight="regular" />}
            className="!text-[#2f2933] [&_span]:text-[#2f2933]"
          />
        )}
        <HeaderIconLink
          href={`${basePath}/account/messages`}
          label={t("messages")}
          icon={<ChatCircleDots className="size-6" weight="regular" />}
          badge={<MessagesNavBadge />}
          className="!text-[#2f2933] [&_span]:text-[#2f2933]"
        />
        <CartButton compact />
        {showAccount && (
          <HeaderIconLink
            href={`${basePath}/account`}
            label={isAuthenticated ? t("myAccount") : t("signIn")}
            icon={<User className="size-6" weight="regular" />}
            className="!text-[#2f2933] md:hidden [&_span]:text-[#2f2933]"
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
      {showWishlist && (
        <HeaderIconLink
          href={wishlistHref}
          label={t("favorites")}
          icon={<Heart className="size-[1.35rem] sm:size-6" weight="regular" />}
        />
      )}
      <HeaderIconLink
        href={`${basePath}/account/messages`}
        label={t("messages")}
        icon={
          <ChatCircleDots
            className="size-[1.35rem] sm:size-6"
            weight="regular"
          />
        }
        badge={<MessagesNavBadge />}
      />
      <CartButton />
      {showAccount && (
        <Link
          data-theme-header-account="true"
          href={`${basePath}/account`}
          className="hidden whitespace-nowrap px-2 text-sm font-medium text-marketplace-brand hover:underline lg:inline"
        >
          {isAuthenticated ? t("myAccount") : t("signIn")}
        </Link>
      )}
      {sellHref ? (
        <Button
          asChild
          size="sm"
          className="hidden h-9 rounded-lg bg-marketplace-brand px-4 text-xs font-semibold text-marketplace-brand-foreground hover:bg-marketplace-brand/90 lg:inline-flex"
        >
          <a href={sellHref}>{sellLabel}</a>
        </Button>
      ) : null}
      {showAccount && (
        <HeaderIconLink
          account
          href={`${basePath}/account`}
          label={isAuthenticated ? t("myAccount") : t("signIn")}
          icon={<User className="size-[1.35rem]" weight="regular" />}
          className="lg:hidden"
        />
      )}
    </div>
  );
}

function HeaderIconLink({
  href,
  label,
  icon,
  badge,
  className,
  account = false,
  variant = "default",
}: {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: ReactNode;
  className?: string;
  account?: boolean;
  variant?: "default" | "icon";
}) {
  const iconOnly =
    variant === "icon"
      ? "relative flex size-10 items-center justify-center rounded-full text-marketplace-foreground transition-colors duration-200 ease-out hover:bg-marketplace-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketplace-brand motion-reduce:transition-none"
      : "";
  const stacked =
    variant === "default"
      ? "flex min-w-[3.25rem] flex-col items-center gap-1 px-0.5 py-0.5 text-[10px] font-medium text-marketplace-brand hover:text-marketplace-foreground sm:min-w-[3.75rem] sm:text-[11px]"
      : "";

  return (
    <Link
      href={href}
      data-theme-header-account={account ? "true" : undefined}
      aria-label={label}
      className={`${stacked} ${iconOnly} ${className ?? ""}`}
    >
      <span className="relative flex items-center text-inherit">
        {icon}
        {badge ? (
          <span className="absolute -right-1.5 -top-1">{badge}</span>
        ) : null}
      </span>
      {variant === "default" ? (
        <span className="hidden leading-none sm:inline">{label}</span>
      ) : null}
    </Link>
  );
}
