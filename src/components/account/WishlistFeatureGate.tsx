"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useStoreThemeSettings } from "@/contexts/ThemeSettingsContext";
import { themeSettingEnabled } from "@/lib/theme/setting-value";

export function WishlistFeatureGate({
  basePath,
  children,
}: {
  basePath: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { general } = useStoreThemeSettings();
  const enabled = themeSettingEnabled(general?.enable_wishlist, true);

  useEffect(() => {
    if (!enabled) router.replace(`${basePath}/account`);
  }, [basePath, enabled, router]);

  return enabled ? children : null;
}
