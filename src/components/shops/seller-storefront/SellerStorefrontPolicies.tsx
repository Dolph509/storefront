import type { Policy } from "@spree/sdk";
import { getTranslations } from "next-intl/server";
import { sellerShopShellClass } from "@/lib/utils/seller-storefront";

interface SellerStorefrontPoliciesProps {
  policies: Policy[];
  marketplaceName: string;
}

export async function SellerStorefrontPolicies({
  policies,
  marketplaceName,
}: SellerStorefrontPoliciesProps) {
  const t = await getTranslations("sellers");
  const visible = policies.filter((p) => p.body || p.body_html);

  return (
    <section className="bg-white">
      <div className={`${sellerShopShellClass} py-10 md:py-12`}>
        {visible.length ? (
          <div className="space-y-0">
            <div className="grid gap-6 border-b border-[#e8e3df] pb-10 lg:grid-cols-[minmax(11rem,14rem)_minmax(0,1fr)] lg:gap-x-14">
              <h2 className="text-base font-semibold text-[#222]">
                {t("tab_policies")}
              </h2>
              <p className="text-sm leading-relaxed text-[#222]">
                {t("policiesIntro", { marketplaceName })}
              </p>
            </div>

            {visible.map((policy) => (
              <div
                key={policy.id || policy.slug}
                className="grid gap-4 border-b border-[#e8e3df] py-10 last:border-b-0 lg:grid-cols-[minmax(11rem,14rem)_minmax(0,1fr)] lg:gap-x-14"
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
            <h2 className="text-base font-semibold text-[#222]">
              {t("tab_policies")}
            </h2>
            <p className="text-sm text-[#595959]">{t("noPolicies")}</p>
          </div>
        )}

        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-[#595959] lg:ml-[calc(11rem+3.5rem)] lg:max-w-none">
          {t("marketplaceProtectionNote", { marketplaceName })}
        </p>
      </div>
    </section>
  );
}
