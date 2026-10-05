import type { Metadata } from "next";
import { Suspense } from "react";
import { generateHomeMetadata } from "@/lib/metadata/home";
import { HomePageContent } from "./HomePageContent";

interface HomePageProps {
  params: Promise<{
    country: string;
    locale: string;
  }>;
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
    <Suspense fallback={null}>
      <HomePageContent country={country} locale={locale} basePath={basePath} />
    </Suspense>
  );
}
