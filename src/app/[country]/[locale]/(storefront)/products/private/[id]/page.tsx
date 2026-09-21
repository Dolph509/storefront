import { notFound, redirect } from "next/navigation";
import { getPrivateListing } from "@/lib/data/sellers";
import { getAccessToken } from "@/lib/spree";
import { ProductDetails } from "../../[slug]/ProductDetails";

export const metadata = {
  robots: { index: false, follow: false },
};

interface PrivateListingPageProps {
  params: Promise<{
    country: string;
    locale: string;
    id: string;
  }>;
}

export default async function PrivateListingPage({
  params,
}: PrivateListingPageProps) {
  const { country, locale, id } = await params;
  const basePath = `/${country}/${locale}`;
  const token = await getAccessToken();
  if (!token) {
    redirect(
      `${basePath}/account?returnTo=${encodeURIComponent(`${basePath}/products/private/${id}`)}`,
    );
  }

  let product;
  try {
    product = await getPrivateListing(id);
  } catch {
    notFound();
  }

  return <ProductDetails product={product} basePath={basePath} fixedQuantity />;
}
