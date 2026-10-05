"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { RegionPreferences } from "@/components/layout/RegionPreferences";
import { extractBasePath } from "@/lib/utils/path";

export function CartFooter() {
  const pathname = usePathname();
  const basePath = extractBasePath(pathname);
  const t = useTranslations("cart");
  const tp = useTranslations("policies");

  return (
    <footer className="border-t border-marketplace-border bg-marketplace-canvas">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <div className="shrink-0">
          <RegionPreferences variant="menu" showCountryName />
        </div>
        <nav
          aria-label={t("footerNavLabel")}
          className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-marketplace-muted-foreground"
        >
          <Link
            href={`${basePath}/policies/terms-of-service`}
            className="hover:text-marketplace-foreground hover:underline"
          >
            {t("footerTerms")}
          </Link>
          <Link
            href={`${basePath}/policies/privacy-policy`}
            className="hover:text-marketplace-foreground hover:underline"
          >
            {tp("privacyPolicy")}
          </Link>
          <Link
            href={`${basePath}/account/orders`}
            className="hover:text-marketplace-foreground hover:underline"
          >
            {t("footerHelp")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
