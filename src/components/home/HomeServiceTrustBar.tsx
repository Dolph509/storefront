import { getTranslations } from "next-intl/server";
import { SpreeIcon } from "@/components/icons";
import { MarketplacePage } from "@/components/marketplace";

interface HomeServiceTrustBarProps {
  locale: string;
}

export async function HomeServiceTrustBar({
  locale,
}: HomeServiceTrustBarProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });

  const items = [
    {
      icon: "handmade" as const,
      title: t("serviceTrustHandmadeTitle"),
      body: t("serviceTrustHandmadeBody"),
    },
    {
      icon: "storefront" as const,
      title: t("serviceTrustCreatorsTitle"),
      body: t("serviceTrustCreatorsBody"),
    },
    {
      icon: "payment-card" as const,
      title: t("serviceTrustPaymentsTitle"),
      body: t("serviceTrustPaymentsBody"),
    },
    {
      icon: "secure-checkout" as const,
      title: t("serviceTrustProtectionTitle"),
      body: t("serviceTrustProtectionBody"),
    },
  ];

  return (
    <section
      className="border-y border-marketplace-border-subtle bg-marketplace-surface py-6"
      data-theme-section="trust"
    >
      <MarketplacePage>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-marketplace-border-subtle">
          {items.map((item) => (
            <li
              key={item.title}
              className="flex items-start gap-3 lg:px-5 lg:first:pl-0 lg:last:pr-0"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--marketplace-radius-sm)] bg-marketplace-surface-subtle text-marketplace-brand">
                <SpreeIcon name={item.icon} className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-marketplace-foreground">
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-marketplace-muted-foreground">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </MarketplacePage>
    </section>
  );
}
