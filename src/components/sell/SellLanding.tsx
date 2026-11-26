import {
  ArrowRight,
  BadgeCheck,
  HandHeart,
  MessagesSquare,
  Plus,
  Store,
  Truck,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import styles from "./sell-landing.module.css";

interface SellLandingProps {
  basePath: string;
  storeName: string;
  applicationsEmail: string;
}

const BENEFITS = [
  { key: "buyers", icon: UsersRound },
  { key: "shopPage", icon: Store },
  { key: "review", icon: BadgeCheck },
  { key: "tools", icon: MessagesSquare },
  { key: "customOrders", icon: HandHeart },
  { key: "wholesale", icon: Truck },
] as const;

const STEPS = ["apply", "review", "invite", "setup", "sell"] as const;

const FEATURE_POINTS = ["one", "two", "three"] as const;

const FEATURE_ROWS = ["shop", "messages", "orders", "reviews"] as const;

const CATEGORIES = [
  { key: "art", image: "/marketplace/category-art.png" },
  { key: "home", image: "/marketplace/category-home.png" },
  { key: "jewelry", image: "/marketplace/category-jewelry.png" },
  { key: "textiles", image: "/marketplace/category-knitwear.png" },
  { key: "personalized", image: "/marketplace/category-personalized.png" },
  { key: "wedding", image: "/marketplace/category-wedding.png" },
] as const;

const FAQ = [
  "who",
  "account",
  "review",
  "cost",
  "after",
  "changes",
  "again",
] as const;

export async function SellLanding({
  basePath,
  storeName,
  applicationsEmail,
}: SellLandingProps) {
  const t = await getTranslations("sell.landing");
  const applyHref = `${basePath}/sell/apply`;

  return (
    <div data-sell-landing className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            {t("hero.eyebrow", { marketplace: storeName })}
          </p>
          <h1 className={styles.heroTitle}>{t("hero.title")}</h1>
          <p className={styles.heroIntro}>
            {t("hero.intro", { marketplace: storeName })}
          </p>
          <div className={styles.heroActions}>
            <Link href={applyHref} className={styles.primary}>
              {t("cta.apply")} <ArrowRight className="size-4" aria-hidden />
            </Link>
            <a href="#how-it-works" className={styles.secondary}>
              {t("hero.howItWorks")} <ArrowRight size={15} aria-hidden />
            </a>
          </div>
          <ul className={styles.heroPoints}>
            {(
              [
                { key: "people", icon: UsersRound },
                { key: "handmade", icon: HandHeart },
                { key: "yours", icon: Store },
              ] as const
            ).map(({ key, icon: Icon }) => (
              <li key={key}>
                <Icon size={20} strokeWidth={1.5} aria-hidden />
                {t(`hero.points.${key}`)}
              </li>
            ))}
          </ul>
          <p className={styles.trackLink}>
            {t("hero.alreadyApplied")}{" "}
            <Link href={`${basePath}/sell/application`}>{t("hero.track")}</Link>
          </p>
        </div>
        <div className={styles.heroMedia}>
          <Image
            src="/marketplace/elena-marin-pottery.png"
            alt={t("hero.imageAlt")}
            width={641}
            height={531}
            unoptimized
            priority
            sizes="(min-width: 1300px) 600px, (min-width: 761px) 48vw, 90vw"
          />
          <div className={styles.profileSlot}>
            <figure className={styles.profileCard}>
              <span className={styles.profilePortrait} aria-hidden="true" />
              <figcaption>
                <strong>Elena Marin</strong>
                <small>{t("hero.craftLocation")}</small>
                <p className={styles.profileRating}>
                  <span className="sr-only">{t("hero.rating")}</span>
                  <span aria-hidden="true">★★★★★</span> 4.9
                </p>
              </figcaption>
              <span className={styles.profileBadge}>
                <BadgeCheck size={12} aria-hidden /> {t("hero.verified")}
              </span>
            </figure>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className={styles.section}
        aria-labelledby="sell-steps-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{t("process.eyebrow")}</p>
          <h2 id="sell-steps-title">{t("process.title")}</h2>
          <p>{t("process.intro")}</p>
        </div>
        <ol className={styles.steps}>
          {STEPS.map((key, index) => (
            <li key={key}>
              <span className={styles.stepNumber} aria-hidden>
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{t(`steps.${key}.title`)}</h3>
              <p>{t(`steps.${key}.body`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="sell-benefits-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{t("benefits.eyebrow")}</p>
          <h2 id="sell-benefits-title">
            {t("benefits.title", { marketplace: storeName })}
          </h2>
        </div>
        <ul className={styles.benefits}>
          {BENEFITS.map(({ key, icon: Icon }) => (
            <li key={key} className={styles.benefit}>
              <span className={styles.benefitIcon}>
                <Icon className="size-5" aria-hidden />
              </span>
              <h3>{t(`benefits.items.${key}.title`)}</h3>
              <p>{t(`benefits.items.${key}.body`)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.editorial}>
        <div className={styles.editorialMedia}>
          <Image
            src="/marketplace/maker-story.png"
            alt={t("editorial.imageAlt")}
            fill
            sizes="(min-width: 900px) 45vw, 100vw"
          />
        </div>
        <div className={styles.editorialCopy}>
          <p className={styles.eyebrow}>{t("editorial.eyebrow")}</p>
          <h2>{t("editorial.title")}</h2>
          <p>{t("editorial.body", { marketplace: storeName })}</p>
          <Link
            href={`${basePath}/handmade-standards`}
            className={styles.textLink}
          >
            {t("editorial.link")} <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="sell-features-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{t("features.eyebrow")}</p>
          <h2 id="sell-features-title">{t("features.title")}</h2>
          <p>{t("features.intro")}</p>
        </div>
        <div className={styles.toolGuide}>
          {FEATURE_ROWS.map((key) => (
            <details key={key} open={key === "shop"}>
              <summary>
                {t(`features.items.${key}.title`)}{" "}
                <Plus size={18} aria-hidden />
              </summary>
              <p>{t(`features.items.${key}.body`)}</p>
              <ul>
                {FEATURE_POINTS.map((point) => (
                  <li key={point}>
                    {t(`features.items.${key}.points.${point}`)}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </section>

      <section
        className={styles.section}
        aria-labelledby="sell-categories-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>{t("categories.eyebrow")}</p>
          <h2 id="sell-categories-title">{t("categories.title")}</h2>
        </div>
        <ul className={styles.categories}>
          {CATEGORIES.map(({ key, image }) => (
            <li key={key} className={styles.category}>
              <Image
                src={image}
                alt=""
                fill
                sizes="(min-width: 900px) 30vw, 50vw"
              />
              <span>{t(`categories.items.${key}`)}</span>
            </li>
          ))}
        </ul>
      </section>

      <Suspense fallback={null}>
        <SellShopVoices storeName={storeName} />
      </Suspense>

      <section className={styles.faq} aria-labelledby="sell-faq-title">
        <div>
          <p className={styles.eyebrow}>{t("faq.eyebrow")}</p>
          <h2 id="sell-faq-title">{t("faq.title")}</h2>
          <p className={styles.faqHelp}>
            {t("faq.help")}{" "}
            <a href={`mailto:${applicationsEmail}`}>{applicationsEmail}</a>
          </p>
        </div>
        <div>
          {FAQ.map((key) => (
            <details key={key}>
              <summary>
                {t(`faq.items.${key}.question`, { marketplace: storeName })}
                <Plus className="size-4" aria-hidden />
              </summary>
              <p>{t(`faq.items.${key}.answer`, { marketplace: storeName })}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.closing}>
        <h2>{t("closing.title")}</h2>
        <p>{t("closing.body")}</p>
        <div className={styles.closingActions}>
          <Link href={applyHref} className={styles.closingCta}>
            {t("cta.apply")} <ArrowRight className="size-4" aria-hidden />
          </Link>
          <a
            href={`mailto:${applicationsEmail}`}
            className={styles.closingSecondary}
          >
            {t("closing.talk")}
          </a>
        </div>
      </section>
    </div>
  );
}

async function SellShopVoices({ storeName }: { storeName: string }) {
  const t = await getTranslations("sell.landing");
  const shops = [
    {
      name: "Maya Chen",
      craft: "Ceramic artist",
      quote:
        "I can share the story behind every piece and connect with people who value handmade work.",
    },
    {
      name: "Jordan Ellis",
      craft: "Textile maker",
      quote:
        "Having my shop, messages, and orders together makes it easier to focus on creating.",
    },
    {
      name: "Amara Brooks",
      craft: "Jewelry designer",
      quote:
        "The application helped me explain how my work is made and what makes it personal.",
    },
  ];

  return (
    <section className={styles.section} aria-labelledby="sell-shops-title">
      <div className={styles.sectionHeading}>
        <p className={styles.eyebrow}>{t("shops.eyebrow")}</p>
        <h2 id="sell-shops-title">
          {t("shops.title", { marketplace: storeName })}
        </h2>
      </div>
      <ul className={styles.shops}>
        {shops.map((shop) => (
          <li key={shop.name} className={styles.shopCard}>
            <blockquote>“{shop.quote}”</blockquote>
            <div className={styles.shopMeta}>
              <span className={styles.shopLogo} aria-hidden="true">
                {shop.name.slice(0, 1)}
              </span>
              <span>
                <strong>{shop.name}</strong>
                <small>{shop.craft}</small>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
