import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MarketplacePage, MarketplaceSection } from "@/components/marketplace";

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
  ] as const;

  return (
    <MarketplaceSection
      surface="none"
      className="hidden border-t border-marketplace-border-subtle bg-[#faf8f5] py-14 md:block md:py-20"
      data-theme-section="home_trust"
    >
      <MarketplacePage>
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-marketplace-brand-accent">
            {t("serviceTrustProtectionTitle")}
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.75rem,1.4rem+1.2vw,2.5rem)] font-normal leading-[1.12] tracking-[-0.03em] text-marketplace-foreground text-balance">
            {t("trustTitle")}
          </h2>
          <p className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-marketplace-muted-foreground">
            {t("trustDescription")}
          </p>
        </div>

        <ol className="mt-12 grid gap-0 border-t border-marketplace-border-subtle sm:grid-cols-3">
          {pillars.map((pillar, index) => (
            <li
              key={pillar.index}
              className={`group flex flex-col pt-8 sm:px-6 sm:pt-9 ${
                index === 0
                  ? "sm:ps-0"
                  : "sm:border-l sm:border-marketplace-border-subtle"
              } ${index === pillars.length - 1 ? "sm:pe-0" : ""}`}
            >
              <span
                aria-hidden="true"
                className="font-display text-[2rem] font-normal leading-none tracking-[-0.04em] text-marketplace-brand-accent/55 transition-colors duration-200 ease-out group-hover:text-marketplace-brand-accent"
              >
                {pillar.index}
              </span>
              <h3 className="mt-5 font-display text-[1.25rem] font-normal leading-snug tracking-[-0.02em] text-marketplace-foreground md:text-[1.375rem]">
                {pillar.title}
              </h3>
              <p className="mt-2.5 max-w-[28ch] text-sm leading-relaxed text-marketplace-muted-foreground md:max-w-none">
                {pillar.body}
              </p>
              {"href" in pillar && pillar.href && pillar.linkLabel ? (
                <Link
                  href={pillar.href}
                  className="mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-marketplace-brand transition-colors duration-150 ease-out hover:text-marketplace-brand-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketplace-brand"
                >
                  {pillar.linkLabel}
                  <ArrowRight
                    className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </Link>
              ) : (
                <span
                  className="mt-6 hidden sm:block sm:min-h-5"
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
      </MarketplacePage>
    </MarketplaceSection>
  );
}
