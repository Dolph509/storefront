"use client";

import { ChatCircleDots } from "@phosphor-icons/react/dist/csr/ChatCircleDots";
import { Heart } from "@phosphor-icons/react/dist/csr/Heart";
import { House } from "@phosphor-icons/react/dist/csr/House";
import { User } from "@phosphor-icons/react/dist/csr/User";
import type { Category } from "@spree/sdk";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { MessagesNavBadge } from "@/components/account/MessagesNavBadge";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { useStoreThemeSettings } from "@/contexts/ThemeSettingsContext";
import { themeSettingEnabled } from "@/lib/theme/setting-value";
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
  // The theme builder serves the storefront through a same-origin proxy. The
  // proxy prefix is present in the browser pathname but not in the route that
  // Next renders on the server, so strip it before calculating active links.
  const storefrontPathname =
    pathname.replace(/^\/storefront-embed(?=\/|$)/, "") || "/";
  const { general } = useStoreThemeSettings();
  const showWishlist = themeSettingEnabled(general?.enable_wishlist, true);
  const wishlistHref =
    typeof general?.wishlist_page_slug === "string" &&
    general.wishlist_page_slug
      ? `${basePath}/pages/${encodeURIComponent(general.wishlist_page_slug)}`
      : `${basePath}/account/favorites`;
  const items = [
    { href: basePath || "/", label: t("home"), icon: House, exact: true },
    ...(showWishlist
      ? [
          {
            href: wishlistHref,
            label: t("favorites"),
            icon: Heart,
          },
        ]
      : []),
    {
      href: `${basePath}/account/messages`,
      label: t("messages"),
      icon: ChatCircleDots,
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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-marketplace-border bg-marketplace-surface/98 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden"
    >
      <div
        className={`grid h-16 ${showWishlist ? "grid-cols-5" : "grid-cols-4"}`}
      >
        <BottomNavLink {...items[0]} pathname={storefrontPathname} />
        <MobileMenu
          rootCategories={rootCategories}
          basePath={basePath}
          wholesaleEnabled={wholesaleEnabled}
          triggerVariant="bottom-nav"
        />
        {items.slice(1).map((item) => (
          <BottomNavLink
            key={item.href}
            {...item}
            pathname={storefrontPathname}
          />
        ))}
      </div>
    </nav>
  );
}

interface BottomNavLinkProps {
  href: string;
  label: string;
  icon: typeof House;
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
        "relative flex min-w-0 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium text-marketplace-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketplace-brand",
        current && "text-marketplace-brand",
      )}
    >
      <span className="relative">
        <Icon className="size-[1.375rem]" weight="regular" aria-hidden="true" />
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
