import {
  WandSparkles as CustomOrder,
  Heart,
  ChartNoAxesCombined as Sales,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ContactShopButton } from "@/components/shops/ContactShopButton";
import { ReportShopButton } from "@/components/shops/ReportShopButton";
import { ShopFollowersButton } from "@/components/shops/ShopFollowersButton";
import { Button } from "@/components/ui/button";
import type { SellerShopSection } from "@/lib/data/seller-storefront-types";
import { sellerShopPath } from "@/lib/utils/seller-storefront";
import { SellerShopStat } from "./SellerShopStat";

interface SellerShopSidebarProps {
  slug: string;
  basePath: string;
  sections: SellerShopSection[];
  activeSection?: string;
  totalItemCount: number;
  salesCount?: number;
  followersCount?: number;
  customOrderHref?: string;
  shopPath: string;
  sellerId: string;
  sellerSlug: string;
  marketplaceName: string;
}

export async function SellerShopSidebar({
  slug,
  basePath,
  sections,
  activeSection,
  totalItemCount,
  salesCount = 0,
  followersCount = 0,
  customOrderHref,
  shopPath,
  sellerId,
  sellerSlug,
  marketplaceName,
}: SellerShopSidebarProps) {
  const t = await getTranslations("sellers");
  const productsPath = sellerShopPath(basePath, slug, "products");

  const linkClass = (active: boolean) =>
    `flex items-center justify-between gap-2 py-1 text-sm ${
      active ? "font-semibold text-[#222]" : "text-[#595959] hover:text-[#222]"
    }`;

  return (
    <aside className="border-b border-[#e8e3df] pb-6 md:sticky md:top-4 md:self-start md:border-b-0 md:border-r md:pr-6">
      <nav aria-label={t("shopCategoriesLabel")} className="mb-5">
        <ul className="space-y-1">
          <li>
            <a
              href={productsPath}
              className={linkClass(!activeSection)}
              aria-current={!activeSection ? "page" : undefined}
            >
              <span>{t("allSections")}</span>
              <span className="tabular-nums text-[#757575]">
                ({totalItemCount.toLocaleString()})
              </span>
            </a>
          </li>
          {sections.map((item) => {
            const href = sellerShopPath(basePath, slug, "products", {
              section: item.slug,
            });
            const active = activeSection === item.slug;
            const count = item.products_count;
            return (
              <li key={item.id}>
                <a
                  href={href}
                  className={linkClass(active)}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="min-w-0 truncate pr-2">{item.name}</span>
                  {count != null ? (
                    <span className="shrink-0 tabular-nums text-[#757575]">
                      ({count.toLocaleString()})
                    </span>
                  ) : null}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-2 border-t border-[#e8e3df] pt-5">
        <ContactShopButton
          basePath={basePath}
          sellerSlug={sellerSlug}
          returnTo={shopPath}
          block
          label="owner"
        />
        {customOrderHref ? (
          <Button
            variant="outline"
            className="w-full justify-center border-[#222] bg-white text-[#222]"
            asChild
          >
            <a
              href={customOrderHref}
              className="inline-flex items-center gap-2"
            >
              <CustomOrder className="size-4" aria-hidden />
              {t("requestCustomOrder")}
            </a>
          </Button>
        ) : null}
      </div>

      <dl className="mt-5 space-y-2 border-t border-[#e8e3df] pt-5 text-sm text-[#595959]">
        <div className="flex justify-between gap-2">
          <dt>
            <SellerShopStat icon={Sales}>{t("sidebarSales")}</SellerShopStat>
          </dt>
          <dd className="font-medium tabular-nums text-[#222]">
            {salesCount.toLocaleString()}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>
            <SellerShopStat icon={Heart}>
              {t("sidebarFollowers")}
            </SellerShopStat>
          </dt>
          <dd>
            <ShopFollowersButton
              sellerIdOrSlug={sellerSlug}
              followersCount={followersCount}
              variant="sidebar"
            />
          </dd>
        </div>
      </dl>

      <div className="mt-6 border-t border-[#e8e3df] pt-4">
        <ReportShopButton
          sellerId={sellerId}
          marketplaceName={marketplaceName}
          variant="sidebar"
        />
      </div>
    </aside>
  );
}
