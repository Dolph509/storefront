"use client";

import type { LucideIcon } from "lucide-react";
import {
  CreditCard,
  Gift,
  Heart,
  Home,
  LogOut,
  MapPin,
  MessageCircle,
  Search,
  ShieldBan,
  ShoppingBag,
  Star,
  Store,
  Tag,
  User,
  WandSparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { MessagesNavBadge } from "@/components/account/MessagesNavBadge";
import { MarketplacePage } from "@/components/marketplace";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { extractBasePath } from "@/lib/utils/path";

interface AccountNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: "messages";
}

interface AccountNavGroup {
  label: string;
  items: AccountNavItem[];
}

function getNavGroups(
  t: ReturnType<typeof useTranslations<"account">>,
): AccountNavGroup[] {
  return [
    {
      label: t("shoppingGroup"),
      items: [
        { href: "/account", label: t("overview"), icon: Home },
        { href: "/account/orders", label: t("orders"), icon: ShoppingBag },
        { href: "/account/favorites", label: t("favorites"), icon: Heart },
        {
          href: "/account/followed-shops",
          label: t("followedShops"),
          icon: Store,
        },
        {
          href: "/account/saved-searches",
          label: t("savedSearches"),
          icon: Search,
        },
      ],
    },
    {
      label: t("communicationGroup"),
      items: [
        {
          href: "/account/messages",
          label: t("messages"),
          icon: MessageCircle,
          badge: "messages",
        },
        { href: "/account/offers", label: t("offers"), icon: Tag },
        {
          href: "/account/custom-orders",
          label: t("customOrders"),
          icon: WandSparkles,
        },
      ],
    },
    {
      label: t("activityGroup"),
      items: [{ href: "/account/reviews", label: t("reviews"), icon: Star }],
    },
    {
      label: t("accountGroup"),
      items: [
        { href: "/account/profile", label: t("profile"), icon: User },
        { href: "/account/addresses", label: t("addresses"), icon: MapPin },
        {
          href: "/account/credit-cards",
          label: t("paymentMethods"),
          icon: CreditCard,
        },
        { href: "/account/gift-cards", label: t("giftCards"), icon: Gift },
      ],
    },
    {
      label: t("privacySafetyGroup"),
      items: [
        {
          href: "/account/blocked-shops",
          label: t("blockedShops"),
          icon: ShieldBan,
        },
      ],
    },
  ];
}

export function AccountShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("account");
  const pathname = usePathname();
  const router = useRouter();
  const basePath = extractBasePath(pathname);
  const { user, logout } = useAuth();
  const navGroups = getNavGroups(t);

  const handleLogout = async () => {
    await logout();
    router.replace(`${basePath}/account`);
  };

  return (
    <MarketplacePage className="py-6 pb-24 lg:py-10">
      <div className="mb-5 rounded-[var(--marketplace-radius-md)] border border-marketplace-border-subtle bg-marketplace-surface p-4 lg:hidden">
        <p className="font-medium text-marketplace-foreground">
          {getDisplayName(user, t("myAccount"))}
        </p>
        <p className="truncate text-sm text-marketplace-muted-foreground">
          {user?.email}
        </p>
        <details className="mt-3 border-t border-marketplace-border-subtle pt-3">
          <summary className="cursor-pointer text-sm font-semibold text-marketplace-brand">
            {t("accountMenu")}
          </summary>
          <AccountNavigation
            groups={navGroups}
            basePath={basePath}
            pathname={pathname}
            className="mt-4"
          />
        </details>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="overflow-hidden rounded-[var(--marketplace-radius-lg)] border border-marketplace-border-subtle bg-marketplace-surface shadow-[var(--marketplace-shadow-card)]">
            <div className="border-b border-marketplace-border-subtle p-4">
              <p className="font-medium text-marketplace-foreground">
                {getDisplayName(user, t("myAccount"))}
              </p>
              <p className="truncate text-sm text-marketplace-muted-foreground">
                {user?.email}
              </p>
            </div>
            <AccountNavigation
              groups={navGroups}
              basePath={basePath}
              pathname={pathname}
              className="p-3"
            />
            <div className="border-t border-marketplace-border-subtle p-3">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-marketplace-muted-foreground"
              >
                <LogOut className="size-5" />
                {t("signOut")}
              </Button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </MarketplacePage>
  );
}

function AccountNavigation({
  groups,
  basePath,
  pathname,
  className,
}: {
  groups: AccountNavGroup[];
  basePath: string;
  pathname: string;
  className?: string;
}) {
  return (
    <nav aria-label="Account" className={className}>
      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.label}>
            <h2 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-marketplace-muted-foreground">
              {group.label}
            </h2>
            <ul className="mt-1 space-y-0.5">
              {group.items.map((item) => {
                const href = `${basePath}${item.href}`;
                const isActive =
                  pathname === href ||
                  (item.href !== "/account" && pathname.startsWith(href));

                return (
                  <li key={item.href}>
                    <Link
                      href={href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-[var(--marketplace-radius-sm)] px-3 py-2 text-sm font-medium text-marketplace-muted-foreground transition-colors hover:bg-marketplace-muted hover:text-marketplace-foreground",
                        isActive &&
                          "bg-marketplace-surface-warm text-marketplace-brand",
                      )}
                    >
                      <item.icon className="size-5" aria-hidden="true" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge === "messages" ? <MessagesNavBadge /> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

function getDisplayName(
  user:
    | { first_name?: string | null; last_name?: string | null }
    | null
    | undefined,
  fallback: string,
) {
  return user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : fallback;
}
