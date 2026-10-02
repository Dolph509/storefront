import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getEditorialStockImage } from "@/lib/marketplace-stock-images";
import { generateHomeMetadata } from "@/lib/metadata/home";
import { HomePageContent } from "./HomePageContent";

interface HomePageProps {
  params: Promise<{
    country: string;
    locale: string;
  }>;
}

function DefaultHomeHero({ basePath }: { basePath: string }) {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-4 sm:px-6 lg:px-8">
      <div className="grid min-h-[17rem] grid-cols-1 md:grid-cols-[minmax(0,1.6fr)_minmax(140px,0.65fr)_minmax(180px,1fr)]">
        <div className="flex flex-col items-center justify-center rounded-l-xl bg-[#f4a900] px-6 py-8 text-center md:px-8">
          <h1 className="max-w-[11em] font-serif text-[2.55rem] leading-[1.08] tracking-tight text-[#222] md:text-[3rem]">
            Find gifts made to mean more.
          </h1>
          <Link
            href={`${basePath}/products`}
            className="mt-5 inline-flex rounded-full bg-[#302536] px-5 py-3 text-sm font-semibold text-white"
          >
            Shop all
          </Link>
        </div>
        <div className="relative min-h-[17rem]">
          <img
            src={getEditorialStockImage("makers")}
            alt="Independent makers at work"
            className="absolute inset-0 size-full object-cover"
          />
        </div>
        <Link
          href={`${basePath}/products`}
          className="relative ml-0 min-h-[17rem] overflow-hidden rounded-xl md:ml-8"
        >
          <img
            src={getEditorialStockImage("gifts")}
            alt="Thoughtful gifts from independent creators"
            className="absolute inset-0 size-full object-cover"
          />
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-4 pb-4 pt-16 text-white">
            <span className="block text-xl font-semibold leading-tight">
              Discover independent creators
            </span>
            <span className="mt-0.5 block text-sm font-medium">Shop now</span>
          </span>
        </Link>
      </div>
    </section>
  );
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { country, locale } = await params;
  return generateHomeMetadata({ country, locale });
}

export default async function HomePage({ params }: HomePageProps) {
  const { country, locale } = await params;
  const basePath = `/${country}/${locale}`;
  return (
    <Suspense fallback={<DefaultHomeHero basePath={basePath} />}>
      <HomePageContent country={country} locale={locale} basePath={basePath} />
    </Suspense>
  );
}
