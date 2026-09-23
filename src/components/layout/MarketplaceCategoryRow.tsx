import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Gift } from "@/components/icons";

interface MarketplaceCategoryRowProps {
  basePath: string;
  locale: Locale;
}

export async function MarketplaceCategoryRow({
  basePath,
  locale,
}: MarketplaceCategoryRowProps) {
  const t = await getTranslations({ locale, namespace: "header" });

  const etsyStyleLinks = [
    { name: "Gifts", href: `${basePath}/products?q=gifts`, icon: true },
    { name: "Fresh Finds for Fall", href: `${basePath}/products?q=fall` },
    { name: "Home Favorites", href: `${basePath}/products?q=home` },
    { name: "Fashion Finds", href: `${basePath}/products?q=fashion` },
    { name: "Vintage", href: `${basePath}/products?q=vintage` },
    { name: "Wedding Guide", href: `${basePath}/products?q=wedding` },
    { name: "Gift Cards", href: `${basePath}/products?q=gift%20cards` },
  ];

  return (
    <nav
      aria-label={t("categoryNavigation")}
      className="mx-auto flex h-10 max-w-[960px] items-center justify-between gap-7 overflow-x-auto text-sm font-semibold text-[#3d3840]"
    >
      {etsyStyleLinks.map((link) => (
        <Link
          key={link.name}
          href={link.href}
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap hover:underline"
        >
          {link.icon ? (
            <Gift className="size-4 fill-current" aria-hidden />
          ) : null}
          {link.name}
        </Link>
      ))}
    </nav>
  );
}
