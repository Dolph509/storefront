import type { StoreMerchandisingPlacement } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MerchandisingImpression } from "@/components/home/MerchandisingTracker";
import { Button } from "@/components/ui/button";

interface MerchandisingHeroProps {
  placement: StoreMerchandisingPlacement;
  basePath: string;
}

export async function MerchandisingHero({
  placement,
  basePath,
}: MerchandisingHeroProps) {
  const t = await getTranslations("home");
  const heading =
    placement.heading || placement.title || placement.campaign_title;
  const body = placement.body;
  const ctaLabel = placement.cta_label || t("shopNow");
  const ctaHref = placement.cta_url
    ? placement.cta_url.startsWith("http")
      ? placement.cta_url
      : `${basePath}${placement.cta_url}`
    : `${basePath}/products`;
  const image = placement.image_url;
  const mobileImage = placement.mobile_image_url || image;

  return (
    <section className="relative overflow-hidden border-b border-gray-200">
      <MerchandisingImpression
        event="campaign_impression"
        payload={{
          campaign_id: placement.campaign_id,
          placement_id: placement.id,
        }}
      />
      {image ? (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mobileImage ?? image}
            alt=""
            className="h-full w-full object-cover md:hidden"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            className="hidden h-full w-full object-cover md:block"
          />
          <div className="absolute inset-0 bg-black/35" />
        </div>
      ) : null}
      <div className="relative container mx-auto px-4 py-16 sm:px-6 lg:px-8 md:py-24">
        <div className={`max-w-2xl ${image ? "text-white" : "text-gray-900"}`}>
          {heading ? (
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              {heading}
            </h1>
          ) : null}
          {body ? <p className="mt-4 text-lg opacity-90">{body}</p> : null}
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link
                href={ctaHref}
                data-campaign-id={placement.campaign_id}
                data-placement-id={placement.id}
              >
                {ctaLabel}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
