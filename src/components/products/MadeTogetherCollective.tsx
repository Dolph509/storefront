"use client";

import { ChevronDown, MapPin, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { MadeTogetherMakerAvatar } from "@/components/products/MadeTogetherMakerAvatar";
import type {
  MadeTogetherMaker,
  MadeTogetherPresentation,
} from "@/lib/made-together/types";

function roleBadgeLabel(
  maker: MadeTogetherMaker,
  index: number,
  t: ReturnType<typeof useTranslations>,
): { label: string; primary: boolean } {
  const isLead = maker.isSellerOfRecord ?? index === 0;
  if (isLead || maker.role === "lead_seller" || maker.role === "coordinator") {
    return { label: t("leadShopShipsOrder"), primary: true };
  }
  if (maker.role === "creative_contributor") {
    return { label: t("creativeContributor"), primary: false };
  }
  return { label: t("collaboratingMaker"), primary: false };
}

export function MadeTogetherCollective({
  presentation,
}: {
  presentation: MadeTogetherPresentation;
}) {
  const t = useTranslations("products");
  const { makers } = presentation;

  return (
    <details
      open
      data-made-together
      id="made-together-collective"
      className="group border-b border-[#eae7e2] py-3.5 scroll-mt-24"
    >
      <summary className="cursor-pointer list-none text-[15.5px] font-semibold leading-snug text-[#1a1a1a] marker:hidden [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-baseline gap-2">
            <span>{t("meetTheCollective")}</span>
            <span className="text-[13px] font-normal text-[#6f6c68]">
              · {t("makersCount", { count: makers.length })}
            </span>
          </span>
          <ChevronDown
            aria-hidden
            className="size-5 shrink-0 text-[#222222] transition-transform duration-150 group-open:rotate-180"
          />
        </span>
      </summary>

      <div className="mt-4">
        <ul className="divide-y divide-[#f0ede8]">
          {makers.map((maker, index) => {
            const role = roleBadgeLabel(maker, index, t);
            const hasRating =
              maker.averageRating != null &&
              Number.isFinite(maker.averageRating) &&
              maker.reviewsCount > 0;

            return (
              <li
                key={maker.key}
                className="flex items-start gap-3.5 py-4 first:pt-1 last:pb-3"
              >
                <MadeTogetherMakerAvatar
                  name={maker.name}
                  logoUrl={maker.logoUrl}
                  href={maker.href}
                  variantIndex={index}
                  className="mt-0.5 size-11 shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {maker.href ? (
                        <Link
                          href={maker.href}
                          className="block truncate text-[15px] font-semibold leading-snug text-[#1a1a1a] underline-offset-4 hover:underline"
                        >
                          {maker.name}
                        </Link>
                      ) : (
                        <span className="block truncate text-[15px] font-semibold leading-snug text-[#1a1a1a]">
                          {maker.name}
                        </span>
                      )}

                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12.5px]">
                        <span
                          className={`inline-flex items-center gap-1.5 font-medium ${
                            role.primary ? "text-[#1b4332]" : "text-[#595652]"
                          }`}
                        >
                          {role.primary ? (
                            <span
                              className="size-1.5 shrink-0 rounded-full bg-[#1b4332]"
                              aria-hidden
                            />
                          ) : null}
                          {role.label}
                        </span>

                        {hasRating ? (
                          <>
                            <span aria-hidden className="text-[#cbc7c1]">
                              ·
                            </span>
                            <span className="inline-flex items-center gap-1 font-medium text-[#1a1a1a]">
                              <Star
                                className="size-3 fill-[#1b4332] text-[#1b4332]"
                                aria-hidden
                              />
                              <span>{maker.averageRating!.toFixed(1)}</span>
                              <span className="font-normal text-[#6f6c68]">
                                ({maker.reviewsCount})
                              </span>
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    {maker.href ? (
                      <Link
                        href={maker.href}
                        className="inline-flex h-8 shrink-0 items-center rounded-full border border-[#d4d1cc] bg-white px-3.5 text-[12.5px] font-medium text-[#1a1a1a] transition-colors hover:border-[#1a1a1a] hover:bg-marketplace-accent"
                      >
                        {t("makerVisitShop")}
                      </Link>
                    ) : null}
                  </div>

                  {maker.shipsFrom || maker.tagline ? (
                    <p className="mt-1.5 flex items-center gap-1 text-[13px] text-[#6f6c68]">
                      {maker.shipsFrom ? (
                        <>
                          <MapPin className="size-3 shrink-0" aria-hidden />
                          <span>{maker.shipsFrom}</span>
                        </>
                      ) : (
                        <span className="line-clamp-1">{maker.tagline}</span>
                      )}
                    </p>
                  ) : null}

                  {maker.craftContribution ? (
                    <p className="mt-2.5 border-l-2 border-[#1b4332]/35 pl-2.5 text-[13.5px] leading-snug text-[#2b2a29]">
                      {maker.craftContribution}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mt-2 flex items-start gap-2 border-t border-[#f0ede8] pt-3 text-[12.5px] leading-relaxed text-[#6f6c68]">
          <ShieldCheck
            className="mt-0.5 size-4 shrink-0 text-[#595652]"
            aria-hidden
          />
          <span>{t("madeTogetherLead")}</span>
        </p>
      </div>
    </details>
  );
}
