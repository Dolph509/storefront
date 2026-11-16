import { SpreeError } from "@spree/sdk";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MarketplacePage } from "@/components/marketplace";
import { getPublicProfile } from "@/lib/data/public-profile";

type Props = {
  params: Promise<{ country: string; locale: string; id: string }>;
};

async function loadProfile(id: string) {
  try {
    return await getPublicProfile(id);
  } catch (error) {
    if (error instanceof SpreeError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, country, locale } = await params;
  const profile = await loadProfile(id);
  return {
    title: profile.name,
    description: profile.bio.slice(0, 160),
    alternates: { canonical: `/${country}/${locale}/members/${profile.id}` },
  };
}

export default async function MemberProfilePage({ params }: Props) {
  const { id } = await params;
  const [profile, t] = await Promise.all([
    loadProfile(id),
    getTranslations("profile"),
  ]);

  return (
    <MarketplacePage className="py-8 sm:py-12">
      <main className="mx-auto max-w-3xl space-y-8">
        <header className="flex flex-wrap items-center gap-5 border-b border-marketplace-border-subtle pb-8">
          <span className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-marketplace-surface-warm text-2xl font-semibold text-marketplace-brand">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt=""
                width={96}
                height={96}
                unoptimized
                className="size-full object-cover"
              />
            ) : (
              profile.name[0]?.toUpperCase() || "?"
            )}
          </span>
          <div>
            <p className="text-sm text-marketplace-muted-foreground">
              {t("publicProfile")}
            </p>
            <h1 className="font-display text-3xl font-semibold text-marketplace-foreground">
              {profile.name}
            </h1>
          </div>
        </header>
        {profile.bio && (
          <section aria-labelledby="member-bio">
            <h2
              id="member-bio"
              className="text-lg font-semibold text-marketplace-foreground"
            >
              {t("aboutYou")}
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-marketplace-foreground">
              {profile.bio}
            </p>
          </section>
        )}
        {profile.other_accounts && (
          <section aria-labelledby="member-accounts">
            <h2
              id="member-accounts"
              className="text-lg font-semibold text-marketplace-foreground"
            >
              {t("otherAccounts")}
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-marketplace-muted-foreground">
              {profile.other_accounts}
            </p>
          </section>
        )}
      </main>
    </MarketplacePage>
  );
}
