import type { Policy, Seller } from "@spree/sdk";
import { getTranslations } from "next-intl/server";
import { sellerShopShellClass } from "@/lib/utils/seller-storefront";
import { ShopEditorAction } from "./ShopEditorAction";

type ShopSeller = Seller & {
  preferred_accepts_cancellations?: boolean;
  preferred_cancellation_window_hours?: number | null;
  default_accepts_returns?: boolean | null;
  default_accepts_exchanges?: boolean | null;
  default_return_window_days?: number | null;
  default_return_shipping_payer?: string | null;
};

interface SellerStorefrontPoliciesProps {
  policies: Policy[];
  marketplaceName: string;
  seller?: ShopSeller;
  editorPreview?: boolean;
}

export async function SellerStorefrontPolicies({
  policies,
  marketplaceName,
  seller,
  editorPreview = false,
}: SellerStorefrontPoliciesProps) {
  const t = await getTranslations("sellers");
  const visible = policies.filter((p) => p.body || p.body_html);
  const hasReturnSummary =
    seller?.default_accepts_returns != null ||
    seller?.default_accepts_exchanges != null;
  const hasCancellationSummary =
    seller?.preferred_accepts_cancellations != null;
  const hasStructured = hasReturnSummary || hasCancellationSummary;
  const hasAny = hasStructured || visible.length > 0;

  return (
    <section className="border-t border-[#e3ddd8] bg-[#faf9f7]">
      <div className={`${sellerShopShellClass} py-7 md:py-8`}>
        {hasAny ? (
          <div className="space-y-0">
            <div className="grid gap-6 border-b border-[#e8e3df] pb-5 lg:grid-cols-[minmax(11rem,14rem)_minmax(0,1fr)] lg:gap-x-14">
              <div className="flex items-center justify-between gap-2 lg:block">
                <h2 className="text-sm font-semibold text-[#222]">
                  {t("tab_policies")}
                </h2>
                {editorPreview ? (
                  <ShopEditorAction
                    action="policies"
                    label="Edit shop policies"
                    className="inline-flex size-8 items-center justify-center rounded-sm text-marketplace-muted-foreground hover:bg-marketplace-surface-subtle hover:text-marketplace-foreground"
                  />
                ) : null}
              </div>
              <p className="text-sm leading-relaxed text-[#595959]">
                {t("policiesIntro", { marketplaceName })}
              </p>
            </div>

            {hasReturnSummary ? (
              <div className="grid gap-3 border-b border-[#e8e3df] py-5 lg:grid-cols-[minmax(11rem,14rem)_minmax(0,1fr)] lg:gap-x-14">
                <h3 className="text-base font-semibold text-[#222]">
                  {t("returnsPolicyTitle")}
                </h3>
                <div className="space-y-2 text-sm leading-relaxed text-[#222]">
                  <p>
                    {seller?.default_accepts_returns
                      ? t("returnsAccepted", {
                          days: seller.default_return_window_days ?? 30,
                        })
                      : t("returnsNotAccepted")}
                  </p>
                  <p>
                    {seller?.default_accepts_exchanges
                      ? t("exchangesAccepted")
                      : t("exchangesNotAccepted")}
                  </p>
                  {(seller?.default_accepts_returns ||
                    seller?.default_accepts_exchanges) && (
                    <p>
                      {seller.default_return_shipping_payer === "seller"
                        ? t("returnShippingSeller")
                        : t("returnShippingBuyer")}
                    </p>
                  )}
                  <p className="text-[#595959]">{t("returnsListingNote")}</p>
                </div>
              </div>
            ) : null}

            {hasCancellationSummary ? (
              <div className="grid gap-3 border-b border-[#e8e3df] py-5 lg:grid-cols-[minmax(11rem,14rem)_minmax(0,1fr)] lg:gap-x-14">
                <h3 className="text-base font-semibold text-[#222]">
                  {t("cancellationsPolicyTitle")}
                </h3>
                <p className="text-sm leading-relaxed text-[#222]">
                  {seller?.preferred_accepts_cancellations
                    ? t("cancellationsAccepted", {
                        hours: seller.preferred_cancellation_window_hours ?? 24,
                      })
                    : t("cancellationsNotAccepted")}
                </p>
              </div>
            ) : null}

            {visible.map((policy) => (
              <div
                key={policy.id || policy.slug}
                className="grid gap-3 border-b border-[#e8e3df] py-4 last:border-b-0 lg:grid-cols-[minmax(11rem,14rem)_minmax(0,1fr)] lg:gap-x-14"
              >
                <h3 className="text-base font-semibold text-[#222]">
                  {policy.name}
                </h3>
                <div
                  className="prose prose-sm max-w-3xl prose-p:text-[#222] prose-headings:text-[#222] prose-li:text-[#222] prose-a:text-[#222] prose-a:underline"
                  dangerouslySetInnerHTML={{
                    __html: policy.body_html || policy.body || "",
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(11rem,14rem)_minmax(0,1fr)] lg:gap-x-14">
            <div className="flex items-center justify-between gap-2 lg:block">
              <h2 className="text-base font-semibold text-[#222]">
                {t("tab_policies")}
              </h2>
              {editorPreview ? (
                <ShopEditorAction
                  action="policies"
                  label="Edit shop policies"
                  className="inline-flex size-8 items-center justify-center rounded-sm text-marketplace-muted-foreground hover:bg-marketplace-surface-subtle hover:text-marketplace-foreground"
                />
              ) : null}
            </div>
            <p className="text-sm text-[#595959]">{t("noPolicies")}</p>
          </div>
        )}

        <p className="mt-5 max-w-3xl text-xs leading-relaxed text-[#595959] lg:ml-[calc(11rem+3.5rem)] lg:max-w-none">
          {t("marketplaceProtectionNote", { marketplaceName })}
        </p>
      </div>
    </section>
  );
}
