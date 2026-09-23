import type { Category } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { RegionPreferences } from "@/components/layout/RegionPreferences";
import { isWholesaleEnabled } from "@/lib/spree";
import {
  getSellerOnboardingUrl,
  getSellerPanelUrl,
  getStoreDescription,
  getStoreName,
} from "@/lib/store";
import { CurrentYear } from "./CurrentYear";

const storeName = getStoreName();
const storeDescription = getStoreDescription();

interface FooterProps {
  basePath: string;
  locale: Locale;
  categoryLinks: ReactNode;
}

interface FooterCategoryLinksProps {
  rootCategories: Category[];
  basePath: string;
}

const linkClass =
  "text-sm text-marketplace-muted-foreground transition-colors hover:text-marketplace-foreground";

export function FooterCategoryLinks({
  rootCategories,
  basePath,
}: FooterCategoryLinksProps) {
  return rootCategories.slice(0, 4).map((category) => (
    <li key={category.id}>
      <Link href={`${basePath}/c/${category.permalink}`} className={linkClass}>
        {category.name}
      </Link>
    </li>
  ));
}

export async function Footer({ basePath, locale, categoryLinks }: FooterProps) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const tp = await getTranslations({ locale, namespace: "policies" });
  const sellerOnboardingUrl = getSellerOnboardingUrl();
  const sellerPanelUrl = getSellerPanelUrl();
  const hasSellerLinks = sellerOnboardingUrl || sellerPanelUrl;

  return (
    <footer className="border-t border-marketplace-border-subtle bg-marketplace-surface-warm text-marketplace-foreground">
      <div className="mx-auto max-w-[1440px] px-4 pb-28 pt-12 sm:px-6 md:pb-12 lg:px-8 lg:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <span className="text-xl font-semibold">{storeName}</span>
            <p className="mt-3 max-w-sm text-sm leading-6 text-marketplace-muted-foreground">
              {storeDescription}
            </p>
            <div className="mt-5">
              <RegionPreferences variant="menu" />
            </div>
          </div>

          <FooterGroup title={t("shop")}>
            <li>
              <Link href={`${basePath}/products`} className={linkClass}>
                {t("allProducts")}
              </Link>
            </li>
            <li>
              <Link href={`${basePath}/shops`} className={linkClass}>
                {t("shops")}
              </Link>
            </li>
            {categoryLinks}
            {isWholesaleEnabled() ? (
              <li>
                <Link href={`${basePath}/wholesale`} className={linkClass}>
                  {t("wholesale")}
                </Link>
              </li>
            ) : null}
          </FooterGroup>

          {hasSellerLinks ? (
            <FooterGroup title={t("sell")}>
              {sellerOnboardingUrl ? (
                <li>
                  <Link href={sellerOnboardingUrl} className={linkClass}>
                    {t("sellOnMarketplace", { marketplace: storeName })}
                  </Link>
                </li>
              ) : null}
              {sellerPanelUrl ? (
                <li>
                  <Link href={sellerPanelUrl} className={linkClass}>
                    {t("sellerSignIn")}
                  </Link>
                </li>
              ) : null}
            </FooterGroup>
          ) : null}

          <FooterGroup title={t("help")}>
            <li>
              <Link href={`${basePath}/account/orders`} className={linkClass}>
                {t("ordersAndHelp")}
              </Link>
            </li>
            <li>
              <Link
                href={`${basePath}/policies/shipping-policy`}
                className={linkClass}
              >
                {tp("shippingPolicy")}
              </Link>
            </li>
            <li>
              <Link
                href={`${basePath}/policies/returns-policy`}
                className={linkClass}
              >
                {tp("returnsPolicy")}
              </Link>
            </li>
          </FooterGroup>

          <FooterGroup title={t("marketplace")}>
            <li>
              <Link
                href={`${basePath}/policies/privacy-policy`}
                className={linkClass}
              >
                {tp("privacyPolicy")}
              </Link>
            </li>
            <li>
              <Link
                href={`${basePath}/policies/terms-of-service`}
                className={linkClass}
              >
                {tp("termsOfService")}
              </Link>
            </li>
          </FooterGroup>
        </div>

        <div className="mt-10 border-t border-marketplace-border pt-6 text-xs text-marketplace-muted-foreground">
          <p>
            &copy; <CurrentYear /> {storeName}. {t("rightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3">{children}</ul>
    </div>
  );
}
