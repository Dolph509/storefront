import { WishlistFeatureGate } from "@/components/account/WishlistFeatureGate";
import { WishlistPageContent } from "@/components/account/WishlistPageContent";

interface FavoritesPageProps {
  params: Promise<{ country: string; locale: string }>;
}

export default async function FavoritesPage({ params }: FavoritesPageProps) {
  const { country, locale } = await params;
  const basePath = `/${country}/${locale}`;

  return (
    <WishlistFeatureGate basePath={basePath}>
      <WishlistPageContent country={country} locale={locale} />
    </WishlistFeatureGate>
  );
}
