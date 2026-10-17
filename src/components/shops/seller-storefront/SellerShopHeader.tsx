import type { Seller } from "@spree/sdk";
import { Star, Plane as VacationMode, WandSparkles } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";
import { ContactShopButton } from "@/components/shops/ContactShopButton";
import { FollowShopButton } from "@/components/shops/FollowShopButton";
import { buttonVariants } from "@/components/ui/button";
import type { SellerShopBannerPayload } from "@/lib/data/seller-storefront-types";
import { cn } from "@/lib/utils";
import { sellerShopShellClass } from "@/lib/utils/seller-storefront";
import { SellerShopBanner } from "./SellerShopBanner";
import { SellerShopEditorThemeBridge } from "./SellerShopEditorThemeBridge";
import { ShopEditorAction } from "./ShopEditorAction";

type SellerProfile = Seller & {
  tagline?: string | null;
  on_vacation?: boolean;
  sellable?: boolean;
  vacation_announcement?: string | null;
  vacation_announcement_html?: string | null;
  accepts_custom_orders?: boolean;
  shop_accent_color?: string | null;
};

interface SellerShopHeaderProps {
  seller: SellerProfile;
  basePath: string;
  following: boolean;
  messagingAvailable?: boolean;
  shopPath: string;
  customOrderHref?: string;
  shopBanner?: SellerShopBannerPayload | null;
  marketplaceName?: string;
  editorPreview?: boolean;
}

export async function SellerShopHeader({
  seller,
  basePath,
  following,
  messagingAvailable = true,
  shopPath,
  customOrderHref,
  shopBanner,
  editorPreview = false,
}: SellerShopHeaderProps) {
  const t = await getTranslations("sellers");
  const locale = await getLocale();
  const logo = seller.square_logo_url || seller.logo_url;
  const cover = seller.cover_photo_url;
  const onVacation = seller.on_vacation === true;
  const hasReviews =
    seller.average_rating != null && (seller.reviews_count ?? 0) > 0;
  const starSellerBadge = seller.badges?.find(
    (badge) => badge.key === "star_seller",
  );
  const sellerStartedAt = seller.seller_since
    ? Date.parse(seller.seller_since)
    : Number.NaN;
  const sellerTenure = Number.isFinite(sellerStartedAt)
    ? Math.max(
        0,
        Math.floor(
          ((Date.now() - sellerStartedAt) / (365.2425 * 24 * 60 * 60 * 1000)) *
            10,
        ) / 10,
      )
    : null;
  const salesCount = new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  })
    .format(seller.sales_count)
    .replace(/K$/, "k");
  const accentColor = seller.shop_accent_color?.trim() || null;
  const lightAccent = accentColor ? isLightAccent(accentColor) : null;
  const accentText = accentColor ? (lightAccent ? "#222222" : "#ffffff") : null;
  const actionBackground = accentColor ? "#ffffff" : "#243b36";
  const actionBorder = accentColor
    ? lightAccent
      ? accentColor
      : "#ffffff"
    : "#243b36";
  const actionText = accentColor
    ? lightAccent
      ? "#222222"
      : accentColor
    : "#ffffff";
  const accentMuted =
    accentText === "#222222" ? "rgb(34 34 34 / 72%)" : "rgb(255 255 255 / 82%)";
  const sellerStyle = accentColor
    ? ({
        "--marketplace-seller-accent": accentColor,
        "--marketplace-seller-accent-text": accentText,
        "--marketplace-seller-accent-muted": accentMuted,
        "--marketplace-seller-action-bg": actionBackground,
        "--marketplace-seller-action-border": actionBorder,
        "--marketplace-seller-action-text": actionText,
        "--marketplace-seller-rating-star": isLightAccent(accentColor)
          ? "#5a3c12"
          : "#ffffff",
        "--marketplace-seller-rating-empty": isLightAccent(accentColor)
          ? "var(--marketplace-border)"
          : "rgb(255 255 255 / 55%)",
      } as CSSProperties)
    : ({
        "--marketplace-seller-action-bg": actionBackground,
        "--marketplace-seller-action-border": actionBorder,
        "--marketplace-seller-action-text": actionText,
      } as CSSProperties);

  return (
    <header
      className="bg-marketplace-surface"
      data-theme-seller-banner
      data-theme-seller-identity
      style={sellerStyle}
    >
      <SellerShopEditorThemeBridge enabled={editorPreview} />
      {shopBanner?.slides.length ? (
        <SellerShopBanner
          banner={shopBanner}
          basePath={basePath}
          editorPreview={editorPreview}
        />
      ) : cover ? (
        <div className="relative h-[var(--marketplace-seller-cover-height-mobile)] w-full overflow-hidden bg-marketplace-surface-warm md:h-[var(--marketplace-seller-cover-height-desktop)]">
          {/* biome-ignore lint/performance/noImgElement: remote seller cover URLs */}
          <img src={cover} alt="" className="h-full w-full object-cover" />
          {editorPreview ? (
            <>
              <div className="absolute left-3 top-3 z-10">
                <ShopEditorAction
                  action="banner-layout"
                  label="Change layout"
                  showLabel
                  className="inline-flex h-8 items-center gap-2 rounded-full bg-white px-3 text-xs font-semibold text-[#222] shadow hover:bg-white/90"
                />
              </div>
              <ShopEditorAction
                action="banner"
                label="Edit banner"
                className="absolute bottom-3 right-3 z-10 inline-flex size-9 items-center justify-center rounded-full bg-white text-[#222] shadow hover:bg-white/90"
              />
            </>
          ) : null}
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="h-12 w-full bg-marketplace-surface-warm sm:h-16"
        />
      )}

      <div
        className={
          accentColor
            ? "bg-[var(--marketplace-seller-accent)]"
            : "bg-marketplace-surface"
        }
      >
        <div
          className={`${sellerShopShellClass} border-b border-marketplace-border/50`}
        >
          <div className="flex flex-col gap-3 pb-4 pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:pt-6">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={cn(
                  "size-[76px] shrink-0 overflow-hidden rounded-lg border border-marketplace-border-subtle bg-marketplace-surface shadow-[var(--marketplace-shadow-card)]",
                )}
              >
                {logo ? (
                  // biome-ignore lint/performance/noImgElement: remote seller logo URLs
                  <img
                    src={logo}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center bg-marketplace-surface-subtle text-xl font-semibold text-marketplace-foreground"
                    aria-hidden
                  >
                    {seller.name.slice(0, 1)}
                  </div>
                )}
              </div>
              <div className="min-w-0 py-1">
                <div className="flex min-w-0 items-center gap-2">
                  <h1 className="truncate font-display text-lg font-semibold text-[var(--marketplace-seller-accent-text,var(--marketplace-foreground))] sm:text-xl">
                    {seller.name}
                  </h1>
                  {starSellerBadge ? (
                    <span
                      role="img"
                      title={starSellerBadge.label}
                      aria-label={starSellerBadge.label}
                      className="inline-flex size-5 shrink-0 items-center justify-center"
                    >
                      {/* biome-ignore lint/performance/noImgElement: Preserve the existing seller badge artwork. */}
                      <img
                        src="/seller-badges/star-seller.svg"
                        alt=""
                        width={20}
                        height={20}
                        className="size-5 object-contain"
                        aria-hidden="true"
                      />
                    </span>
                  ) : null}
                </div>
                {seller.ships_from ? (
                  <p className="mt-0.5 text-sm leading-5 text-[var(--marketplace-seller-accent-muted,var(--marketplace-muted-foreground))]">
                    {seller.ships_from}
                  </p>
                ) : null}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm leading-5 text-[var(--marketplace-seller-accent-text,var(--marketplace-foreground))]">
                  {hasReviews ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Star
                        aria-hidden="true"
                        className="size-[18px] fill-amber-400 text-amber-400"
                      />
                      <span className="font-semibold">
                        {seller.average_rating!.toFixed(1)}
                      </span>
                      <span>
                        ({seller.reviews_count!.toLocaleString(locale)})
                      </span>
                    </span>
                  ) : null}
                  {seller.sales_count > 0 ? (
                    <span className="border-l border-[var(--marketplace-seller-accent-muted,var(--marketplace-border))] pl-4">
                      {t("salesCountCompact", { count: salesCount })}
                    </span>
                  ) : null}
                  {sellerTenure !== null ? (
                    <span className="border-l border-[var(--marketplace-seller-accent-muted,var(--marketplace-border))] pl-4">
                      {t("sellerTenure", { years: sellerTenure })}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
              <FollowShopButton
                sellerId={seller.id}
                sellerSlug={seller.slug}
                initialFollowing={following}
                prominent
              />
              <ContactShopButton
                basePath={basePath}
                sellerSlug={seller.slug}
                returnTo={shopPath}
                messagingAvailable={messagingAvailable}
                prominent
                label="contact"
              />
              {customOrderHref ? (
                <Link
                  href={customOrderHref}
                  style={
                    {
                      backgroundColor:
                        "var(--marketplace-seller-action-bg, #243b36)",
                      borderColor:
                        "var(--marketplace-seller-action-border, #243b36)",
                      color: "var(--marketplace-seller-action-text, #fff)",
                    } as CSSProperties
                  }
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "h-9 rounded-full px-4 hover:brightness-95",
                  )}
                >
                  <WandSparkles className="mr-1.5 size-4" aria-hidden />
                  {t("requestCustomOrder")}
                </Link>
              ) : null}
            </div>
          </div>

          {onVacation ? (
            <div
              role="status"
              className="mb-4 rounded-[var(--marketplace-radius-sm)] border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950"
            >
              <p className="flex items-center gap-2 font-medium">
                <VacationMode className="size-4 shrink-0" aria-hidden />
                {t("vacationTitle")}
              </p>
              {seller.vacation_announcement_html ||
              seller.vacation_announcement ? (
                <div
                  className="prose prose-sm mt-1 max-w-none text-amber-900"
                  dangerouslySetInnerHTML={{
                    __html:
                      seller.vacation_announcement_html ||
                      seller.vacation_announcement ||
                      "",
                  }}
                />
              ) : (
                <p className="mt-1 text-amber-900/90">{t("vacationDefault")}</p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function isLightAccent(hex: string): boolean {
  const normalized = hex.trim().replace(/^#/, "");
  if (!/^(?:[\da-f]{3}|[\da-f]{6})$/i.test(normalized)) return true;
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => character + character)
          .join("")
      : normalized;
  const value = Number.parseInt(expanded, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
}
