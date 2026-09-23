"use client";

import type { Category } from "@spree/sdk";
import { Heart, Home, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { MessagesNavBadge } from "@/components/account/MessagesNavBadge";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { cn } from "@/lib/utils";

interface MarketplaceBottomNavProps {
  rootCategories: Category[];
  basePath: string;
  wholesaleEnabled: boolean;
}

export function MarketplaceBottomNav({
  rootCategories,
  basePath,
  wholesaleEnabled,
}: MarketplaceBottomNavProps) {
  const t = useTranslations("header");
  const pathname = usePathname();
  const items = [
    { href: basePath || "/", label: t("home"), icon: Home, exact: true },
    {
      href: `${basePath}/account/favorites`,
      label: t("favorites"),
      icon: Heart,
    },
    {
      href: `${basePath}/account/messages`,
      label: t("messages"),
      icon: MessageCircle,
      badge: true,
    },
    {
      href: `${basePath}/account`,
      label: t("account"),
      icon: User,
    },
  ];

  return (
    <nav
      aria-label={t("marketplaceNavigation")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-marketplace-border bg-marketplace-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <div className="grid h-16 grid-cols-5">
        <BottomNavLink {...items[0]} pathname={pathname} />
        <MobileMenu
          rootCategories={rootCategories}
          basePath={basePath}
          wholesaleEnabled={wholesaleEnabled}
          triggerVariant="bottom-nav"
        />
        {items.slice(1).map((item) => (
          <BottomNavLink key={item.href} {...item} pathname={pathname} />
        ))}
      </div>
    </nav>
  );
}

interface BottomNavLinkProps {
  href: string;
  label: string;
  icon: typeof Home;
  pathname: string;
  exact?: boolean;
  badge?: boolean;
}

function BottomNavLink({
  href,
  label,
  icon: Icon,
  pathname,
  exact = false,
  badge = false,
}: BottomNavLinkProps) {
  const current = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={cn(
        "relative flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium text-marketplace-muted-foreground focus-visible:outline-2 focus-visible:outline-marketplace-brand",
        current && "text-marketplace-brand",
      )}
    >
      <span className="relative">
        <Icon className="size-5" aria-hidden="true" />
        {badge ? (
          <span className="absolute -right-3 -top-2">
            <MessagesNavBadge />
          </span>
        ) : null}
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}
