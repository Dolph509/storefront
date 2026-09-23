import { getTranslations } from "next-intl/server";
import { sellerShopShellClass } from "@/lib/utils/seller-storefront";
import { SellerAboutContent } from "./SellerAboutContent";

interface SellerStorefrontAboutProps {
  shopName: string;
  marketplaceName: string;
  tagline?: string | null;
  aboutHtml?: string | null;
  about?: string | null;
  salesCount?: number;
}

export async function SellerStorefrontAbout({
  shopName,
  marketplaceName,
  tagline,
  aboutHtml,
  about,
  salesCount = 0,
}: SellerStorefrontAboutProps) {
  const t = await getTranslations("sellers");
  const hasAbout = Boolean(aboutHtml?.trim() || about?.trim());

  if (!hasAbout) {
    return (
      <div className={`${sellerShopShellClass} py-12`}>
        <p className="text-[#595959]">{t("aboutEmpty")}</p>
      </div>
    );
  }

  const plainTextLength = aboutHtml
    ? aboutHtml.replace(/<[^>]+>/g, "").length
    : (about ?? "").length;
  const formattedSales =
    salesCount > 0 ? new Intl.NumberFormat().format(salesCount) : null;

  return (
    <section className="bg-[#f4e2d8]">
      <div className={`${sellerShopShellClass} py-10 md:py-12`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(11rem,15rem)_minmax(0,1fr)] lg:gap-x-16">
          <aside className="text-[#222]">
            <h1 className="text-xl font-semibold">
              {t("aboutShopHeading", { name: shopName })}
            </h1>
            <ul className="mt-6 space-y-4 text-sm">
              {formattedSales ? (
                <li>
                  <span className="font-semibold">{t("aboutSalesLabel")}</span>
                  <span className="mt-0.5 block tabular-nums text-[#45342e]">
                    {formattedSales}
                  </span>
                </li>
              ) : null}
              <li>
                <span className="font-semibold">
                  {t("aboutOnMarketplaceLabel", {
                    marketplace: marketplaceName,
                  })}
                </span>
              </li>
            </ul>
          </aside>

          <div className="min-w-0">
            {tagline ? (
              <p className="text-sm font-medium text-[#45342e]">{tagline}</p>
            ) : null}
            {aboutHtml ? (
              <SellerAboutContent
                html={aboutHtml}
                plainTextLength={plainTextLength}
                readMoreLabel={t("readMore")}
                readLessLabel={t("readLess")}
              />
            ) : (
              <p className="max-w-3xl text-sm leading-relaxed text-[#222] whitespace-pre-wrap">
                {about}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
