import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { listFavorites } from "@/lib/data/favorites";

interface FavoritesPageProps {
  params: Promise<{ country: string; locale: string }>;
}

export default async function FavoritesPage({ params }: FavoritesPageProps) {
  const { country, locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "account",
  });
  const basePath = `/${country}/${locale}`;
  const result = await listFavorites();
  const items = result.success ? result.data : [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {t("favorites")}
      </h1>
      {!items.length ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-900 font-medium">{t("favoritesEmpty")}</p>
          <p className="mt-2 text-sm text-gray-500">
            {t("favoritesEmptyHelp")}
          </p>
          <Button className="mt-6" asChild>
            <Link href={`${basePath}/products`}>{t("browseMarketplace")}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) =>
            item.product ? (
              <ProductCard
                key={item.id}
                product={item.product}
                basePath={basePath}
                favorited
              />
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
