import { getTranslations } from "next-intl/server";
import { SpreeIcon } from "@/components/icons";

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
    <section className="bg-marketplace-background py-8 md:py-10">
      <div className="mx-auto max-w-[1360px] border-y border-marketplace-border-subtle bg-marketplace-surface px-4 py-4 sm:px-6 lg:px-0">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <li
              key={item.title}
              className="flex items-center gap-3 lg:justify-center"
            >
              <SpreeIcon
                name={item.icon}
                className="size-5 shrink-0 text-marketplace-brand"
                aria-hidden
              />
              <div>
                <p className="text-xs font-semibold text-marketplace-foreground">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[10px] text-marketplace-muted-foreground">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
