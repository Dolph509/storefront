import type { Seller } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { EmptyStateIllustration } from "@/components/empty-states/EmptyStateIllustration";
import { ShopCard } from "@/components/shops/ShopCard";
import { Button } from "@/components/ui/button";
import { listFollowedShops } from "@/lib/data/follows";

interface FollowedShopsPageProps {
  params: Promise<{ country: string; locale: string }>;
}

export default async function FollowedShopsPage({
  params,
}: FollowedShopsPageProps) {
  const { country, locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "account",
  });
  const basePath = `/${country}/${locale}`;
  const result = await listFollowedShops();
  const rows = result.success ? result.data.data : [];
  const sellers = rows
    .map((row) => (row as { seller?: Seller }).seller)
    .filter(Boolean) as Seller[];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {t("followedShops")}
      </h1>
      {!sellers.length ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <EmptyStateIllustration
            name="no-followed-shops"
            className="mx-auto mb-4 text-gray-600"
          />
          <p className="font-medium text-gray-900">{t("followedShopsEmpty")}</p>
          <Button className="mt-6" asChild>
            <Link href={`${basePath}/shops`}>{t("browseShops")}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sellers.map((seller) => (
            <ShopCard
              key={seller.id}
              seller={seller}
              basePath={basePath}
              locale={locale}
              variant="rich"
            />
          ))}
        </div>
      )}
    </div>
  );
}
