"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { followSeller, unfollowSeller } from "@/lib/data/follows";

interface FollowShopButtonProps {
  sellerId: string;
  initialFollowing?: boolean;
}

export function FollowShopButton({
  sellerId,
  initialFollowing = false,
}: FollowShopButtonProps) {
  const t = useTranslations("sellers");
  const { isAuthenticated } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();

  if (!isAuthenticated) {
    return (
      <Button type="button" variant="outline" size="sm" disabled>
        {t("followSignIn")}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={following ? "secondary" : "outline"}
      size="sm"
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
      {following ? t("following") : t("follow")}
    </Button>
  );
}
