"use client";

import { useStoreThemeSettings } from "@/contexts/ThemeSettingsContext";
import { themeSettingEnabled } from "@/lib/theme/setting-value";
import { SocialPlatformIcon } from "./SocialPlatformIcon";

const NETWORKS = [
  "instagram",
  "facebook",
  "pinterest",
  "tiktok",
  "youtube",
] as const;

export function GlobalSocialLinks({ compact = false }: { compact?: boolean }) {
  const { social } = useStoreThemeSettings();
  if (!themeSettingEnabled(social?.show_social_links, true)) return null;
  const links = NETWORKS.flatMap((network) => {
    const href =
      typeof social?.[network] === "string" ? String(social[network]) : "";
    return /^https:\/\//i.test(href) ? [{ network, href }] : [];
  });
  if (!links.length) return null;
  return (
    <nav
      aria-label="Social media"
      data-theme-global-social-accounts
      className={compact ? "" : "mt-8 border-t border-marketplace-border pt-5"}
    >
      {!compact ? <h2 className="text-sm font-semibold">Follow us</h2> : null}
      <ul
        className={
          compact
            ? "flex flex-wrap items-center gap-1"
            : "mt-3 flex flex-wrap items-center gap-4"
        }
      >
        {links.map(({ network, href }) => (
          <li key={network}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={network[0].toUpperCase() + network.slice(1)}
              className={
                compact
                  ? "inline-flex size-9 items-center justify-center rounded-full text-marketplace-muted-foreground transition-colors duration-200 hover:bg-marketplace-accent hover:text-marketplace-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketplace-brand"
                  : "inline-flex text-marketplace-muted-foreground transition-colors hover:text-marketplace-foreground"
              }
            >
              <SocialPlatformIcon network={network} size={compact ? 18 : 20} />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
