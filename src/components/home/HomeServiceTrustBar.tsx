import { BadgeCheck, HandHeart, ShieldCheck, Store } from "lucide-react";
import { getTranslations } from "next-intl/server";
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
      icon: HandHeart,
      title: t("serviceTrustHandmadeTitle"),
      body: t("serviceTrustHandmadeBody"),
    },
    {
      icon: Store,
      title: t("serviceTrustCreatorsTitle"),
      body: t("serviceTrustCreatorsBody"),
    },
    {
      icon: ShieldCheck,
      title: t("serviceTrustPaymentsTitle"),
      body: t("serviceTrustPaymentsBody"),
    },
    {
      icon: BadgeCheck,
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
        <ul className="grid grid-cols-2 gap-x-4 gap-y-5 sm:gap-5 lg:grid-cols-4 lg:divide-x lg:divide-marketplace-border-subtle">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.title}
                className="flex items-start gap-3 lg:px-5 lg:first:pl-0 lg:last:pr-0"
              >
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center text-marketplace-brand">
                  <Icon
                    className="size-[1.15rem]"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium tracking-[-0.01em] text-marketplace-foreground sm:text-sm">
                    {item.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-marketplace-muted-foreground sm:text-xs">
                    {item.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </MarketplacePage>
    </section>
  );
}
