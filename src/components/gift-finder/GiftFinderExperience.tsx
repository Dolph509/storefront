"use client";

import type {
  GiftFinderMatch,
  GiftFinderOptions,
  GiftFinderRequirementLevel,
  GiftFinderSearch,
  GiftFinderSponsoredResult,
} from "@spree/sdk";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Gift,
  SlidersHorizontal,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { SponsoredProductCard } from "@/components/ads/SponsoredProductCard";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductImage } from "@/components/ui/product-image";
import { mergeOrganicWithSponsored } from "@/lib/ads/merge-sponsored-listing";
import { giftCatalogIdeas } from "@/lib/data/gift-finder-catalog";
import { giftFinderStates } from "@/lib/data/gift-finder-states";
import {
  applyRelaxation,
  emptyAnswers,
  type GiftAnswers,
  toSearchParams,
} from "@/lib/gift-finder/answers";
import { getOrCreateTrafficSessionToken } from "@/lib/traffic/tokens";
import styles from "./gift-finder.module.css";

const sections = ["person", "taste", "details"] as const;
type CatalogIdea = { label: string; image: string | null };
const requirementKeys = new Set([
  "budget",
  "ship_to",
  "deadline",
  "personalization",
  "local_makers",
]);

type GiftFinderExperienceProps = {
  catalogIdeas: CatalogIdea[];
  options: GiftFinderOptions;
  countries: Array<{ iso: string }>;
  country: string;
  locale: string;
  currency: string;
  basePath: string;
};

export function GiftFinderExperience({
  catalogIdeas,
  options,
  countries,
  country,
  locale,
  currency,
  basePath,
}: GiftFinderExperienceProps) {
  const t = useTranslations("giftFinder");
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"questions" | "results">("questions");
  const [answers, setAnswers] = useState<GiftAnswers>(() =>
    emptyAnswers(country),
  );
  const [states, setStates] = useState<Array<{ abbr: string; name: string }>>(
    [],
  );
  const [search, setSearch] = useState<GiftFinderSearch | null>(null);
  const [organic, setOrganic] = useState<GiftFinderMatch[]>([]);
  const [broader, setBroader] = useState<GiftFinderMatch[]>([]);
  const [sponsored, setSponsored] = useState<GiftFinderSponsoredResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestRef = useRef(0);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const panelRef = useRef<HTMLFieldSetElement>(null);
  useEffect(() => {
    if (phase === "results") titleRef.current?.focus();
  }, [phase]);

  useEffect(() => {
    let cancelled = false;
    void giftFinderStates(answers.shipToCountry).then((next) => {
      if (!cancelled) setStates(next);
    });
    return () => {
      cancelled = true;
    };
  }, [answers.shipToCountry]);

  const money = (amount: number) => {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return String(amount);
    }
  };

  const labelFor = (key?: string) => {
    if (!key) return "";
    const concepts = [
      ...options.recipients,
      ...options.occasions,
      ...options.interests,
      ...options.styles,
      ...options.age_ranges,
    ];
    return concepts.find((concept) => concept.key === key)?.label ?? key;
  };

  async function runSearch(
    nextAnswers: GiftAnswers,
    page = 1,
    parentId?: string | null,
  ) {
    if (
      !nextAnswers.recipient &&
      !nextAnswers.occasion &&
      !nextAnswers.interests.length &&
      !nextAnswers.customInterests.length
    ) {
      setStep(0);
      setError(t("chooseFirst"));
      return;
    }
    const requestId = ++requestRef.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/gift-finder/searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          ...toSearchParams(nextAnswers, {
            concepts: options.interests,
            maxInterests: options.max_interests,
            page,
            parentSearchId: page === 1 ? parentId : search?.id,
            sessionToken: getOrCreateTrafficSessionToken(),
          }),
          market_country: country,
          market_locale: locale,
          market_currency: currency,
        }),
      });
      const payload = (await response.json()) as GiftFinderSearch & {
        message?: string;
      };
      if (requestId !== requestRef.current) return;
      if (!response.ok) {
        setError(payload.message || t("errorTitle"));
        return;
      }
      setSearch(payload);
      setOrganic((current) =>
        page > 1 ? [...current, ...payload.results] : payload.results,
      );
      setBroader(payload.broader_results);
      if (page === 1) setSponsored(payload.sponsored);
      setPhase("results");
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError")
        return;
      if (requestId === requestRef.current) setError(t("errorTitle"));
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }

  function toggle(list: string[], key: string, limit?: number) {
    if (list.includes(key)) return list.filter((item) => item !== key);
    if (limit && list.length >= limit) return list;
    return [...list, key];
  }

  const budgetLabel =
    answers.budgetPreset === "open"
      ? t("openBudget")
      : answers.budgetPreset === "custom"
        ? [answers.budgetMin, answers.budgetMax]
            .filter(Boolean)
            .map((value) => money(Number(value)))
            .join(" – ") || t("openBudget")
        : t("under", { amount: money(Number(answers.budgetPreset)) });
  const heading = [labelFor(answers.recipient), labelFor(answers.occasion)]
    .filter(Boolean)
    .join(" · ");

  const pages = search ? Math.ceil(search.total_count / search.per_page) : 0;
  const cells = mergeOrganicWithSponsored(
    organic.map((match) => match.product),
    sponsored.map((row) => ({ product: row.match.product, ad: row.ad })),
  );
  const matchByProduct = new Map(
    organic.map((match) => [match.product.id, match]),
  );
  const sponsoredByProduct = new Map(
    sponsored.map((row) => [row.match.product.id, row.match]),
  );

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header
          className={phase === "questions" ? styles.hero : styles.resultHero}
        >
          <div>
            <p className={styles.eyebrow}>
              <Gift size={17} aria-hidden />
              {t("nav")}
            </p>
            <h1 ref={titleRef} tabIndex={-1} className={styles.title}>
              {phase === "questions" ? t("headline") : t("selectionTitle")}
            </h1>
            {phase === "questions" ? (
              <p className={styles.intro}>{t("guideIntro")}</p>
            ) : (
              <div className={styles.criteriaRow}>
                <ul aria-label={t("yourAnswers")} className={styles.criteria}>
                  {[
                    heading,
                    ...answers.interests.map(labelFor),
                    ...answers.customInterests,
                    ...answers.styles.map(labelFor),
                    labelFor(answers.ageRange),
                    budgetLabel,
                    regionName(answers.shipToCountry, locale),
                    answers.deliverBy,
                  ]
                    .filter(Boolean)
                    .map((label, i) => (
                      <li key={i}>{label}</li>
                    ))}
                </ul>
                <button
                  type="button"
                  className={styles.refine}
                  disabled={loading}
                  onClick={() => {
                    setStep(0);
                    setPhase("questions");
                    setError(null);
                    requestAnimationFrame(() => panelRef.current?.focus());
                  }}
                >
                  <SlidersHorizontal size={16} aria-hidden />
                  {t("refine")}
                </button>
              </div>
            )}
            {phase === "questions" && (
              <button
                className={styles.compose}
                type="button"
                onClick={() => panelRef.current?.focus()}
              >
                {t("buildGift")} <ArrowRight size={17} aria-hidden />
              </button>
            )}
          </div>
          {phase === "questions" && catalogIdeas.length > 0 && (
            <div className={styles.edits}>
              <h2>{t("browseEdits")}</h2>
              <div className={styles.editGrid}>
                {catalogIdeas.map((edit) => (
                  <button
                    key={edit.label}
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      const phrase = edit.label.slice(
                        0,
                        options.max_custom_interest_length,
                      );
                      const customInterests = answers.customInterests.includes(
                        phrase,
                      )
                        ? answers.customInterests
                        : [...answers.customInterests, phrase];
                      if (
                        customInterests.length > options.max_custom_interests
                      ) {
                        setStep(1);
                        setError(
                          t("interestsHint", {
                            max: options.max_custom_interests,
                          }),
                        );
                        panelRef.current?.focus();
                        return;
                      }
                      const next = { ...answers, customInterests };
                      setAnswers(next);
                      setStep(sections.length - 1);
                      setError(null);
                      requestAnimationFrame(() => panelRef.current?.focus());
                    }}
                  >
                    {edit.image && (
                      <ProductImage
                        unoptimized
                        src={edit.image}
                        alt=""
                        width={220}
                        height={270}
                        sizes="(min-width: 761px) 14vw, 28vw"
                      />
                    )}
                    <span>
                      {edit.label} <ArrowRight size={14} aria-hidden />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>
        {phase === "questions" ? (
          <div className={styles.workspace}>
            <aside className={styles.rail}>
              <nav aria-label={t("yourAnswers")}>
                {sections.map((name, index) => (
                  <button
                    type="button"
                    key={name}
                    aria-current={step === index ? "step" : undefined}
                    disabled={loading}
                    onClick={() => setStep(index)}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {t(name)}
                  </button>
                ))}
              </nav>
              <div className={styles.summary}>
                <h2>{t("yourAnswers")}</h2>
                <p>
                  {[
                    heading,
                    ...answers.interests.map(labelFor),
                    ...answers.customInterests,
                    budgetLabel,
                    regionName(answers.shipToCountry, locale),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </aside>
            <p className={styles.mobileAnswers} aria-live="polite">
              {[
                heading,
                ...answers.interests.map(labelFor),
                ...answers.customInterests,
                budgetLabel,
                regionName(answers.shipToCountry, locale),
              ]
                .filter(Boolean)
                .join(" · ") || t("guideIntro")}
            </p>
            <fieldset
              ref={panelRef}
              tabIndex={-1}
              disabled={loading}
              className={styles.panel}
              aria-label={t(sections[step])}
            >
              {step === 0 ? (
                <ChoiceStep
                  title={t("stepRecipient")}
                  choices={options.recipients}
                  clearLabel={t("any")}
                  selected={answers.recipient}
                  onSelect={(key) =>
                    setAnswers({
                      ...answers,
                      recipient: answers.recipient === key ? undefined : key,
                    })
                  }
                />
              ) : null}
              {step === 0 ? (
                <ChoiceStep
                  title={t("stepOccasion")}
                  choices={options.occasions}
                  selected={answers.occasion}
                  onSelect={(key) =>
                    setAnswers({
                      ...answers,
                      occasion: answers.occasion === key ? undefined : key,
                    })
                  }
                />
              ) : null}
              {step === 1 ? (
                <fieldset>
                  <legend className={styles.question}>
                    {t("stepInterests")}
                  </legend>
                  <p className={styles.hint}>
                    {t("interestsHint", { max: options.max_interests })}
                  </p>
                  <div className={styles.chips}>
                    {options.interests.map((concept) => (
                      <button
                        key={concept.key}
                        type="button"
                        className={styles.chip}
                        aria-pressed={answers.interests.includes(concept.key)}
                        disabled={
                          !answers.interests.includes(concept.key) &&
                          answers.interests.length >= options.max_interests
                        }
                        onClick={() =>
                          setAnswers({
                            ...answers,
                            interests: toggle(
                              answers.interests,
                              concept.key,
                              options.max_interests,
                            ),
                          })
                        }
                      >
                        {concept.label}
                      </button>
                    ))}
                  </div>
                  <CustomInterests
                    answers={answers}
                    max={options.max_custom_interests}
                    maxLength={options.max_custom_interest_length}
                    onChange={setAnswers}
                  />
                </fieldset>
              ) : null}
              {step === 2 ? (
                <fieldset>
                  <legend className={styles.question}>{t("stepBudget")}</legend>
                  <div className={styles.chips} role="radiogroup">
                    {(
                      [
                        ["25", t("under", { amount: money(25) })],
                        ["50", t("under", { amount: money(50) })],
                        ["100", t("under", { amount: money(100) })],
                        ["open", t("openBudget")],
                        ["custom", t("customBudget")],
                      ] as const
                    ).map(([value, label]) => (
                      // biome-ignore lint/a11y/useSemanticElements: segmented preset control uses shared chip styling
                      <button
                        key={value}
                        type="button"
                        className={styles.chip}
                        role="radio"
                        aria-checked={answers.budgetPreset === value}
                        onClick={() =>
                          setAnswers({ ...answers, budgetPreset: value })
                        }
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {answers.budgetPreset === "custom" ? (
                    <div className={styles.fields}>
                      <label>
                        {t("min")}
                        <input
                          inputMode="decimal"
                          value={answers.budgetMin}
                          onChange={(event) =>
                            setAnswers({
                              ...answers,
                              budgetMin: event.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        {t("max")}
                        <input
                          inputMode="decimal"
                          value={answers.budgetMax}
                          onChange={(event) =>
                            setAnswers({
                              ...answers,
                              budgetMax: event.target.value,
                            })
                          }
                        />
                      </label>
                    </div>
                  ) : null}
                  <div className={styles.chips}>
                    <button
                      type="button"
                      className={styles.chip}
                      aria-pressed={answers.budgetFlexible}
                      onClick={() =>
                        setAnswers({
                          ...answers,
                          budgetFlexible: !answers.budgetFlexible,
                        })
                      }
                    >
                      {t("budgetFlexible")}
                    </button>
                  </div>
                </fieldset>
              ) : null}
              {step === 2 ? (
                <details className={styles.fold}>
                  <summary>
                    {t("stepPersonalization")} <ChevronDown size={16} />
                  </summary>
                  <LevelChoice
                    label={t("personalization")}
                    value={answers.personalization}
                    onChange={(personalization) =>
                      setAnswers({ ...answers, personalization })
                    }
                  />
                  <LevelChoice
                    label={t("localMakers")}
                    value={answers.localMakers}
                    onChange={(localMakers) =>
                      setAnswers({ ...answers, localMakers })
                    }
                  />
                </details>
              ) : null}
              {step === 2 ? (
                <fieldset>
                  <legend className={styles.question}>
                    {t("stepDelivery")}
                  </legend>
                  <div className={styles.fields}>
                    <label>
                      {t("shipTo")}
                      <select
                        value={answers.shipToCountry}
                        onChange={(event) =>
                          setAnswers({
                            ...answers,
                            shipToCountry: event.target.value,
                            shipToState: "",
                          })
                        }
                      >
                        {countries.map((item) => (
                          <option key={item.iso} value={item.iso}>
                            {regionName(item.iso, locale)}
                          </option>
                        ))}
                      </select>
                    </label>
                    {states.length ? (
                      <label>
                        {t("state")}
                        <select
                          value={answers.shipToState}
                          onChange={(event) =>
                            setAnswers({
                              ...answers,
                              shipToState: event.target.value,
                            })
                          }
                        >
                          <option value="">{t("anyState")}</option>
                          {states.map((state) => (
                            <option key={state.abbr} value={state.abbr}>
                              {state.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                    <label>
                      {t("deadline")}
                      <input
                        type="date"
                        value={answers.deliverBy}
                        onChange={(event) =>
                          setAnswers({
                            ...answers,
                            deliverBy: event.target.value,
                          })
                        }
                      />
                    </label>
                  </div>
                  <div className={styles.chips}>
                    <button
                      type="button"
                      className={styles.chip}
                      aria-pressed={answers.deadlineFlexible}
                      onClick={() =>
                        setAnswers({
                          ...answers,
                          deadlineFlexible: !answers.deadlineFlexible,
                        })
                      }
                    >
                      {t("deadlineFlexible")}
                    </button>
                  </div>
                </fieldset>
              ) : null}
              {step === 1 ? (
                <details className={styles.fold}>
                  <summary>
                    {t("morePreferences")} <ChevronDown size={16} />
                  </summary>
                  <p className={styles.hint}>{t("styles")}</p>
                  <div className={styles.chips}>
                    {options.styles.map((concept) => (
                      <button
                        key={concept.key}
                        type="button"
                        className={styles.chip}
                        aria-pressed={answers.styles.includes(concept.key)}
                        onClick={() =>
                          setAnswers({
                            ...answers,
                            styles: toggle(answers.styles, concept.key),
                          })
                        }
                      >
                        {concept.label}
                      </button>
                    ))}
                  </div>
                  <p className={styles.hint}>{t("age")}</p>
                  <div className={styles.chips}>
                    {options.age_ranges.map((concept) => (
                      <button
                        key={concept.key}
                        type="button"
                        className={styles.chip}
                        aria-pressed={answers.ageRange === concept.key}
                        onClick={() =>
                          setAnswers({
                            ...answers,
                            ageRange:
                              answers.ageRange === concept.key
                                ? undefined
                                : concept.key,
                          })
                        }
                      >
                        {concept.label}
                      </button>
                    ))}
                  </div>
                </details>
              ) : null}
              {error && (
                <p className={styles.banner} role="alert">
                  {error}
                </p>
              )}
              <div className={styles.actions}>
                {step > 0 ? (
                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={() => setStep(step - 1)}
                  >
                    {t("back")}
                  </button>
                ) : (
                  <span className={styles.actionsLead} aria-hidden />
                )}
                {step < sections.length - 1 ? (
                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={() => setStep(step + 1)}
                  >
                    {t(sections[step + 1])} <ArrowRight size={16} aria-hidden />
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.primary}
                    disabled={loading}
                    onClick={() => void runSearch(answers, 1, search?.id)}
                  >
                    {loading ? t("searching") : t("seeGifts")}{" "}
                    <ArrowRight size={16} aria-hidden />
                  </button>
                )}
              </div>
            </fieldset>
          </div>
        ) : (
          <div className={styles.results}>
            {search?.hard_requirements?.length ? (
              <p className={styles.hint}>
                {t("keptFirm", {
                  items: search.hard_requirements
                    .map((key) =>
                      requirementKeys.has(key) ? t(`requirements.${key}`) : key,
                    )
                    .join(", "),
                })}
              </p>
            ) : null}
            <div>
              <div className={styles.collectionHead}>
                <h2>{t("matches")}</h2>
                <span>
                  {t("resultsCount", {
                    count: search?.total_count ?? organic.length,
                  })}
                </span>
                {broader.length > 0 && (
                  <a href="#broader-gifts">{t("broaderTitle")} ↓</a>
                )}
              </div>
              {error ? (
                <div className={styles.banner} role="alert">
                  <p>{error}</p>
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={() => void runSearch(answers, 1, search?.id)}
                  >
                    {t("retry")}
                  </button>
                </div>
              ) : null}
              {loading && organic.length === 0 ? (
                <div className={styles.grid} aria-busy="true">
                  {Array.from({ length: 6 }, (_, index) => (
                    <div key={index} className={styles.skeleton} />
                  ))}
                </div>
              ) : null}
              {!loading && organic.length === 0 && !error ? (
                <div className={styles.card}>
                  <h3 className={styles.question}>{t("emptyTitle")}</h3>
                  <p className={styles.hint}>{t("emptyBody")}</p>
                  <div className={styles.relax}>
                    {search?.relaxations.map((item) => (
                      <button
                        key={item.change}
                        type="button"
                        className={styles.chip}
                        onClick={() => {
                          const next = applyRelaxation(
                            answers,
                            item.change,
                            item.value,
                          );
                          setAnswers(next);
                          void runSearch(next, 1, search?.id);
                        }}
                      >
                        {t(`relax.${item.change}`, {
                          count: item.additional_results,
                        })}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className={styles.grid} aria-busy={loading}>
                {cells.map((cell, index) => {
                  const match =
                    cell.kind === "sponsored"
                      ? sponsoredByProduct.get(cell.row.product.id)
                      : matchByProduct.get(cell.product.id);
                  const product =
                    cell.kind === "sponsored" ? cell.row.product : cell.product;
                  return (
                    <article key={`${cell.kind}-${product.id}`}>
                      {cell.kind === "sponsored" ? (
                        <SponsoredProductCard
                          row={cell.row}
                          basePath={basePath}
                          currency={currency}
                          index={index}
                        />
                      ) : (
                        <ProductCard
                          product={product}
                          basePath={basePath}
                          currency={currency}
                          index={index}
                          listId="gift-finder"
                          listName={t("title")}
                          suppressRelevanceReason
                        />
                      )}
                      {match ? (
                        <MatchNotes
                          match={match}
                          askedForDelivery={Boolean(answers.deliverBy)}
                          locale={locale}
                        />
                      ) : null}
                    </article>
                  );
                })}
              </div>
              {search && search.page < pages ? (
                <div className={styles.actions}>
                  <span />
                  <button
                    type="button"
                    className={styles.secondary}
                    disabled={loading}
                    onClick={() =>
                      void runSearch(answers, search.page + 1, search.id)
                    }
                  >
                    {loading ? t("searching") : t("loadMore")}
                  </button>
                </div>
              ) : null}
              {broader.length ? (
                <section id="broader-gifts" className={styles.broader}>
                  <h2 className={styles.question}>{t("broaderTitle")}</h2>
                  <div className={styles.grid}>
                    {broader.map((match) => (
                      <article key={match.product.id}>
                        <ProductCard
                          product={match.product}
                          basePath={basePath}
                          currency={currency}
                          listId="gift-finder-broader"
                          listName={t("broaderTitle")}
                          suppressRelevanceReason
                        />
                        <MatchNotes
                          match={match}
                          askedForDelivery={Boolean(answers.deliverBy)}
                          locale={locale}
                        />
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChoiceStep({
  title,
  choices,
  clearLabel,
  selected,
  onSelect,
}: {
  title: string;
  choices: GiftFinderOptions["recipients"];
  clearLabel?: string;
  selected?: string;
  onSelect: (key?: string) => void;
}) {
  return (
    <fieldset>
      <legend className={styles.question}>{title}</legend>
      <div className={styles.chips}>
        {clearLabel && (
          <button
            type="button"
            className={styles.chip}
            aria-pressed={!selected}
            onClick={() => onSelect()}
          >
            {!selected && <Check size={15} aria-hidden />} {clearLabel}
          </button>
        )}
        {choices.map((concept) => (
          <button
            key={concept.key}
            type="button"
            className={styles.chip}
            aria-pressed={selected === concept.key}
            onClick={() => onSelect(concept.key)}
          >
            {selected === concept.key && <Check size={15} aria-hidden />}{" "}
            {concept.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function LevelChoice({
  label,
  value,
  onChange,
}: {
  label: string;
  value: GiftFinderRequirementLevel;
  onChange: (value: GiftFinderRequirementLevel) => void;
}) {
  const t = useTranslations("giftFinder");
  const levels: GiftFinderRequirementLevel[] = ["any", "preferred", "required"];
  return (
    <div>
      <p className={styles.hint}>{label}</p>
      <div className={styles.chips} role="radiogroup" aria-label={label}>
        {levels.map((level) => (
          // biome-ignore lint/a11y/useSemanticElements: segmented level control uses shared chip styling
          <button
            key={level}
            type="button"
            className={styles.chip}
            role="radio"
            aria-checked={value === level}
            onClick={() => onChange(level)}
          >
            {t(level)}
          </button>
        ))}
      </div>
    </div>
  );
}

function CustomInterests({
  answers,
  max,
  maxLength,
  onChange,
}: {
  answers: GiftAnswers;
  max: number;
  maxLength: number;
  onChange: (answers: GiftAnswers) => void;
}) {
  const t = useTranslations("giftFinder");
  const [draft, setDraft] = useState("");
  const [suggestions, setSuggestions] = useState<CatalogIdea[]>([]);
  useEffect(() => {
    let active = true;
    setSuggestions([]);
    if (draft.trim().length < 2) return;
    const timer = setTimeout(() => {
      void giftCatalogIdeas(draft)
        .then((items) => {
          if (active) setSuggestions(items);
        })
        .catch(() => {});
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [draft]);
  function add(value: string) {
    const phrase = value.trim().slice(0, maxLength);
    if (
      !phrase ||
      answers.customInterests.includes(phrase) ||
      answers.customInterests.length >= max
    )
      return;
    onChange({
      ...answers,
      customInterests: [...answers.customInterests, phrase],
    });
    setDraft("");
  }
  return (
    <form
      className={styles.fields}
      onSubmit={(event) => {
        event.preventDefault();
        add(draft);
      }}
    >
      {answers.customInterests.length ? (
        <div className={styles.chips}>
          {answers.customInterests.map((phrase) => (
            <button
              key={phrase}
              type="button"
              className={styles.chip}
              aria-pressed="true"
              onClick={() =>
                onChange({
                  ...answers,
                  customInterests: answers.customInterests.filter(
                    (item) => item !== phrase,
                  ),
                })
              }
            >
              {phrase}
            </button>
          ))}
        </div>
      ) : null}
      <label>
        {t("customInterest")}
        <input
          value={draft}
          maxLength={maxLength}
          onChange={(event) => setDraft(event.target.value)}
        />
      </label>
      <button type="submit" className={styles.secondary}>
        {t("customInterestAdd")}
      </button>
      {suggestions.length > 0 && (
        <div className={styles.catalogSuggestions}>
          <strong>{t("catalogSuggestions")}</strong>
          <div className={styles.chips}>
            {suggestions.map((item) => (
              <button
                type="button"
                className={styles.chip}
                key={item.label}
                disabled={answers.customInterests.length >= max}
                onClick={() => add(item.label)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}

function MatchNotes({
  match,
  askedForDelivery,
  locale,
}: {
  match: GiftFinderMatch;
  askedForDelivery: boolean;
  locale: string;
}) {
  const t = useTranslations("giftFinder");
  const delivery = match.estimated_delivery_by
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
        new Date(match.estimated_delivery_by),
      )
    : null;
  return (
    <>
      <details className={styles.matchDetails}>
        <summary>
          {t("whyMatch")} <ChevronDown size={14} aria-hidden />
        </summary>
        <p>{match.explanation}</p>
      </details>
      {match.personalizable ? (
        <p className={styles.meta}>{t("personalizationAvailable")}</p>
      ) : null}
      {delivery ? (
        <p className={styles.meta}>{t("deliveryBy", { date: delivery })}</p>
      ) : null}
      {!delivery && askedForDelivery ? (
        <p className={styles.meta}>{t("deliveryNotPromised")}</p>
      ) : null}
      {match.exploration ? (
        <p className={styles.meta}>{t("exploration")}</p>
      ) : null}
    </>
  );
}

function regionName(iso: string, locale: string) {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(iso) ?? iso;
  } catch {
    return iso;
  }
}
