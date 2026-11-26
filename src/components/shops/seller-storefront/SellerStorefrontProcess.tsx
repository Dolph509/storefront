import { getTranslations } from "next-intl/server";
import type { SellerShopPagePayload } from "@/lib/data/seller-storefront-types";
import { buildSellerProcessSteps } from "@/lib/shops/seller-process-steps";
import { sellerShopShellClass } from "@/lib/utils/seller-storefront";

interface SellerStorefrontProcessProps {
  shopName: string;
  shopPage?: SellerShopPagePayload | null;
}

export async function SellerStorefrontProcess({
  shopName,
  shopPage,
}: SellerStorefrontProcessProps) {
  const t = await getTranslations("sellers");
  const steps = buildSellerProcessSteps(shopPage?.photos);
  if (steps.length < 2) return null;

  return (
    <section
      id="shop-process"
      className="border-t border-[#e8e3da] bg-[#faf8f5]"
      data-seller-process
    >
      <div className={`${sellerShopShellClass} py-10 md:py-14`}>
        <h2 className="font-display text-2xl font-medium tracking-tight text-[#1a1916] md:text-3xl">
          {t("processHeading", { name: shopName })}
        </h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {steps.map((step, index) => (
            <li key={`${step.title}-${index}`} className="min-w-0">
              <div className="relative overflow-hidden rounded-xl bg-[#eee9ef] aspect-square">
                {/* biome-ignore lint/performance/noImgElement: seller story photos are remote CDN URLs */}
                <img
                  src={step.imageUrl}
                  alt=""
                  className="size-full object-cover"
                />
                <span className="absolute left-3 top-3 inline-flex size-8 items-center justify-center rounded-full bg-[#452c4f] text-sm font-semibold text-white">
                  {index + 1}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-[#1a1916]">
                {step.title}
              </h3>
              {step.body ? (
                <p className="mt-1.5 text-sm leading-relaxed text-[#59544e]">
                  {step.body}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
