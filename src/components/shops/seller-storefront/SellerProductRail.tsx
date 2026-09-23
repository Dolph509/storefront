import type { Product } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ProductCarousel } from "@/components/products/ProductCarousel";
import { Button } from "@/components/ui/button";
import type { SellerShopListId } from "@/lib/discovery-context";

interface SellerProductRailProps {
  title: string;
  products: Product[];
  basePath: string;
  sellerId: string;
  listId: SellerShopListId;
  moreHref?: string;
}

export async function SellerProductRail({
  title,
  products,
  basePath,
  sellerId,
  listId,
  moreHref,
}: SellerProductRailProps) {
  if (!products.length) return null;

  const t = await getTranslations("sellers");

  return (
    <section className="py-10 border-b border-gray-100 last:border-0">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          {title}
        </h2>
        {moreHref ? (
          <Button variant="link" className="shrink-0 px-0" asChild>
            <Link href={moreHref}>{t("viewAll")}</Link>
          </Button>
        ) : null}
      </div>
      <ProductCarousel
        products={products}
        basePath={basePath}
        listId={listId}
        listName={title}
        sellerShopDiscovery={{ sellerId, listId }}
      />
    </section>
  );
}
