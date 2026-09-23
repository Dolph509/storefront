"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { followSeller, unfollowSeller } from "@/lib/data/follows";
import { buildAccountLoginHref } from "@/lib/utils/account-redirect";
import { extractBasePath } from "@/lib/utils/path";

interface FollowShopButtonProps {
  sellerId: string;
  initialFollowing?: boolean;
  returnTo?: string;
  /** Etsy-style solid follow on shop pages. */
  prominent?: boolean;
  /** Heart-only control for featured shop cards. */
  iconOnly?: boolean;
}

export function FollowShopButton({
  sellerId,
  initialFollowing = false,
  returnTo,
  prominent = false,
  iconOnly = false,
}: FollowShopButtonProps) {
  const t = useTranslations("sellers");
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();

  if (!isAuthenticated) {
    const loginHref = buildAccountLoginHref(
      extractBasePath(pathname),
      returnTo ?? pathname,
    );
    if (iconOnly) {
      return (
        <Button
          variant="outline"
          size="icon"
          className="size-9 rounded-full border-0 bg-white text-[#222] shadow-sm hover:bg-white"
          asChild
        >
          <Link href={loginHref} aria-label={t("follow")}>
            <Heart className="size-4" aria-hidden />
          </Link>
        </Button>
      );
    }

    return (
      <Button
        variant={prominent ? "default" : "outline"}
        size="sm"
        className={
          prominent
            ? "rounded-full border-[#222] bg-white text-[#222] hover:bg-[#faf8f7]"
            : "rounded-full"
        }
        asChild
      >
        <Link href={loginHref} className="inline-flex items-center gap-1.5">
          <Heart className="size-4" aria-hidden />
          {t("follow")}
        </Link>
      </Button>
    );
  }

  const variant = prominent ? "outline" : following ? "secondary" : "outline";

  if (iconOnly) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-9 rounded-full border-0 bg-white text-[#222] shadow-sm hover:bg-white"
        disabled={pending}
        aria-pressed={following}
        aria-label={following ? t("following") : t("follow")}
        onClick={() => {
          const next = !following;
          setFollowing(next);
          startTransition(async () => {
            try {
              const result = next
                ? await followSeller(sellerId)
                : await unfollowSeller(sellerId);
              if (!result.success) setFollowing(!next);
            } catch {
              setFollowing(!next);
            }
          });
        }}
      >
        <Heart
          className={`size-4 ${following ? "fill-current" : ""}`}
          aria-hidden
        />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      className={`inline-flex items-center gap-1.5 ${
        prominent
          ? "rounded-full border-[#222] bg-white text-[#222] hover:bg-[#faf8f7]"
          : "rounded-full"
      }`}
      disabled={pending}
      aria-pressed={following}
      onClick={() => {
        const next = !following;
        setFollowing(next);
        startTransition(async () => {
          try {
            const result = next
              ? await followSeller(sellerId)
              : await unfollowSeller(sellerId);
            if (!result.success) setFollowing(!next);
          } catch {
            setFollowing(!next);
          }
        });
      }}
    >
      <Heart
        className={`size-4 ${following ? "fill-current" : ""}`}
        aria-hidden
      />
      {following ? t("following") : t("follow")}
    </Button>
  );
}
