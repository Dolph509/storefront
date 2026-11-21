import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  MarketplacePage,
  MarketplaceSection,
  MarketplaceSectionHeader,
} from "@/components/marketplace";

interface HomeTrustSectionProps {
  basePath: string;
  locale: string;
}

export async function HomeTrustSection({
  basePath,
  locale,
}: HomeTrustSectionProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });

  const pillars = [
    {
      index: "01",
      title: t("trustIndependentTitle"),
      body: t("trustIndependentBody"),
    },
    {
      index: "02",
      title: t("trustPersonalizedTitle"),
      body: t("trustPersonalizedBody"),
    },
    {
      index: "03",
      title: t("trustConnectTitle"),
      body: t("trustConnectBody"),
      href: `${basePath}/policies/terms-of-service`,
      linkLabel: t("trustPoliciesLink"),
    },
  ];

  return (
    <MarketplaceSection
      surface="warm"
      className="border-t border-marketplace-border-subtle py-12 md:py-16"
    >
      <MarketplacePage>
        <MarketplaceSectionHeader
          eyebrow={t("serviceTrustProtectionTitle")}
          title={t("trustTitle")}
          description={t("trustDescription")}
          density="home"
        />
        <ul className="grid gap-5 sm:grid-cols-3">
          {pillars.map((pillar) => (
            <li
              key={pillar.index}
              className="flex flex-col justify-between rounded-[var(--marketplace-radius-md)] border border-marketplace-border bg-marketplace-surface p-6"
            >
              <div>
                <span className="font-display text-2xl font-normal text-marketplace-brand-accent/80">
                  {pillar.index}
                </span>
                <h3 className="mt-3 font-display text-xl font-normal text-marketplace-foreground">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-marketplace-muted-foreground">
                  {pillar.body}
                </p>
              </div>
              {pillar.href && pillar.linkLabel ? (
                <Link
                  href={pillar.href}
                  className="mt-5 inline-flex w-fit items-center gap-1 text-sm font-medium text-marketplace-brand transition-colors hover:text-marketplace-brand-accent"
                >
                  {pillar.linkLabel}
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </MarketplacePage>
    </MarketplaceSection>
  );
}
