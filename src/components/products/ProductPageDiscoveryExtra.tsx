import type { Product } from "@spree/sdk";
import { Suspense } from "react";
import {
  PdpRelatedDiscoveryChipsAsync,
  PdpRelatedDiscoveryExploreAsync,
} from "@/components/products/PdpRelatedDiscoveryAsync";
import { ProductPageDiscoveryRails } from "@/components/products/ProductPageDiscoveryRails";
import { ProductPageSellerShowcase } from "@/components/products/ProductPageSellerShowcase";
import type { ProductPageDiscoverySkip } from "@/lib/theme/product-discovery-skip";

type ProductPageDiscoveryExtraProps = {
  product: Product;
  basePath: string;
  locale: string;
  currency?: string;
  skip?: ProductPageDiscoverySkip;
  productCount?: number;
};

export function ProductPageDiscoveryExtra(
  props: ProductPageDiscoveryExtraProps,
) {
  const { product, basePath, locale } = props;

  return (
    <div className="pb-10 pt-2" data-pdp-discovery>
      {product.seller ? (
        <ProductPageSellerShowcase
          seller={product.seller}
          products={[]}
          basePath={basePath}
          currency={props.currency}
          excludeProductId={product.id}
        />
      ) : null}

      <Suspense fallback={null}>
        <PdpRelatedDiscoveryChipsAsync product={product} basePath={basePath} />
      </Suspense>

      <Suspense fallback={null}>
        <ProductPageDiscoveryRails {...props} />
      </Suspense>

      <Suspense fallback={null}>
        <PdpRelatedDiscoveryExploreAsync
          product={product}
          basePath={basePath}
          locale={locale}
        />
      </Suspense>
    </div>
  );
}
