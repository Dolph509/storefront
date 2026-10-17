import type { Metadata } from "next";
import { Suspense } from "react";
import { HomePageLoadingFallback } from "@/components/home/HomePageLoadingFallback";
import { generateHomeMetadata } from "@/lib/metadata/home";
import { HomePageContent } from "./HomePageContent";

interface HomePageProps {
  params: Promise<{
    country: string;
    locale: string;
  }>;
  searchParams?: Promise<{ preview_persona?: string }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { country, locale } = await params;
  return generateHomeMetadata({ country, locale });
}

export default async function HomePage({
  params,
  searchParams,
}: HomePageProps) {
  const { country, locale } = await params;
  const query = searchParams ? await searchParams : {};
  const basePath = `/${country}/${locale}`;
  return (
    <Suspense fallback={<HomePageLoadingFallback />}>
      <HomePageContent
        country={country}
        locale={locale}
        basePath={basePath}
        previewPersona={query.preview_persona}
      />
    </Suspense>
  );
}
