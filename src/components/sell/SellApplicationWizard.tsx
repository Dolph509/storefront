"use client";

import { Check, ImagePlus, Loader2, Lock, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  type ApplicationPayload,
  checkSellerShopNameAvailability,
  createSellerApplication,
  deleteSellerApplicationPhoto,
  type SellerApplicationMutationResult,
  type SellerApplicationRecord,
  submitSellerApplication,
  updateSellerApplication,
  uploadSellerApplicationPhoto,
} from "@/lib/data/seller-applications";
import { buildAccountLoginHref } from "@/lib/utils/account-redirect";
import styles from "./sell-application.module.css";
import {
  EDITABLE_STATUSES,
  useSellerApplication,
} from "./use-seller-application";

const STEPS = ["about", "shop", "products", "work", "review"] as const;
type StepName = (typeof STEPS)[number];

const STEP_FIELDS: Record<StepName, string[]> = {
  about: ["email", "identity_name", "seller_type", "city", "state", "country"],
  shop: [
    "shop_name",
    "shop_description",
    "maker_story",
    "website",
    "instagram",
  ],
  products: [
    "categories",
    "craft_type",
    "product_description",
    "production_notes",
    "materials",
    "made_by",
    "price_range",
    "fulfillment_time",
    "ships_to",
    "wholesale_interest",
  ],
  work: ["sample_photos", "years_experience", "supporting_information"],
  review: ["agreements_accepted_at"],
};

const CRAFT_OPTIONS = [
  { value: "Ceramics", key: "ceramics" },
  { value: "Jewelry", key: "jewelry" },
  { value: "Textiles", key: "textiles" },
  { value: "Woodwork", key: "woodwork" },
  { value: "Home décor", key: "homeDecor" },
  { value: "Art & prints", key: "art" },
  { value: "Other", key: "other" },
] as const;
const SELLER_TYPES = ["individual", "business"] as const;
const PRICE_RANGES = [
  "under_50",
  "50_150",
  "150_400",
  "400_plus",
  "mixed",
] as const;
const MADE_BY_OPTIONS = [
  "myself",
  "with_helpers",
  "small_studio",
  "workshop",
] as const;
const FULFILLMENT_TIMES = [
  "1_3_days",
  "4_7_days",
  "1_2_weeks",
  "made_to_order",
] as const;
const SHIPS_TO_OPTIONS = ["domestic", "international", "both"] as const;
const WHOLESALE_INTERESTS = ["yes", "later", "no"] as const;
const MAX_PHOTOS = 6;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function isStepName(value: string | null): value is StepName {
  return !!value && (STEPS as readonly string[]).includes(value);
}

function stepComplete(
  step: StepName,
  application: SellerApplicationRecord | null,
) {
  if (!application) return false;
  switch (step) {
    case "about":
      return Boolean(
        application.identity_name &&
          application.seller_type &&
          application.city &&
          application.state &&
          application.country,
      );
    case "shop":
      return Boolean(
        application.shop_name &&
          application.shop_description &&
          application.maker_story,
      );
    case "products":
      return Boolean(
        application.craft_type &&
          application.categories?.length &&
          application.product_description &&
          application.production_notes &&
          application.materials &&
          application.made_by &&
          application.price_range &&
          application.fulfillment_time &&
          application.ships_to &&
          application.wholesale_interest,
      );
    case "work":
      return Boolean(
        application.years_experience != null &&
          application.sample_photos?.length,
      );
    case "review":
      return false;
  }
}

function firstIncompleteStep(
  application: SellerApplicationRecord | null,
): StepName {
  return (
    STEPS.find(
      (step) => step !== "review" && !stepComplete(step, application),
    ) ?? "review"
  );
}

function text(data: FormData, name: string) {
  return String(data.get(name) ?? "").trim();
}

export function SellApplicationWizard({ basePath }: { basePath: string }) {
  const t = useTranslations("sell.apply");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { application, accessToken, loading, setApplication } =
    useSellerApplication();

  const [step, setStep] = useState<StepName | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errorAction, setErrorAction] = useState<ErrorAction | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [email, setEmail] = useState("");
  const [sellerType, setSellerType] = useState("");
  const [checkingShopName, setCheckingShopName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ");
  const statusPath = `${basePath}/sell/application`;
  const reviewReturnPath = `${basePath}/sell/apply?step=review`;
  const loginHref = buildAccountLoginHref(basePath, reviewReturnPath);
  const registerHref = `${basePath}/account/register?redirect=${encodeURIComponent(reviewReturnPath)}`;

  useEffect(() => {
    if (loading) return;
    if (application && !EDITABLE_STATUSES.includes(application.status)) {
      router.replace(statusPath);
      return;
    }
    if (step) return;
    const resume = firstIncompleteStep(application);
    const requested = searchParams.get("step");
    const allowed =
      isStepName(requested) && STEPS.indexOf(requested) <= STEPS.indexOf(resume)
        ? requested
        : resume;
    setStep(allowed);
    setSellerType(application?.seller_type ?? "");
  }, [loading, step, application, searchParams, router, statusPath]);

  useEffect(() => {
    if (!email && user?.email && !application) setEmail(user.email);
  }, [user?.email, email, application]);

  const previewsRef = useRef(previews);
  previewsRef.current = previews;
  useEffect(() => {
    return () => {
      for (const url of Object.values(previewsRef.current))
        URL.revokeObjectURL(url);
    };
  }, []);

  const resumeStep = firstIncompleteStep(application);

  function goTo(next: StepName) {
    setError("");
    setErrorAction(null);
    setFieldErrors({});
    setStep(next);
    router.replace(`${pathname}?step=${next}`, { scroll: false });
    requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
      headingRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function showFailure(
    result: Extract<SellerApplicationMutationResult, { ok: false }>,
    fallback: string,
  ) {
    const nextFieldErrors = { ...result.fieldErrors };
    if (
      nextFieldErrors.shop_name &&
      /taken|already|used/i.test(nextFieldErrors.shop_name)
    ) {
      nextFieldErrors.shop_name = t("errors.shopNameTaken");
    }
    setFieldErrors(nextFieldErrors);
    setError(result.message || fallback);
  }

  async function saveStep(payload: ApplicationPayload, next: StepName) {
    if (!application || !accessToken) {
      setError(t("errors.saveFailed"));
      return;
    }
    setBusy(true);
    setError("");
    setFieldErrors({});
    try {
      const result = await updateSellerApplication(
        application.id,
        payload,
        accessToken,
      );
      if (!result.ok) {
        showFailure(result, t("errors.saveFailed"));
        return;
      }
      setApplication(result.data);
      setSavedAt(new Date());
      goTo(next);
    } catch {
      setError(t("errors.saveFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function shopNameAvailable(rawName: string) {
    const shopName = rawName.trim();
    if (!shopName) return true;
    setCheckingShopName(true);
    try {
      const { available } = await checkSellerShopNameAvailability(
        shopName,
        application?.id,
      );
      setFieldErrors((current) => {
        const { shop_name: _ignored, ...rest } = current;
        return available
          ? rest
          : { ...rest, shop_name: t("errors.shopNameTaken") };
      });
      return available;
    } catch {
      return true;
    } finally {
      setCheckingShopName(false);
    }
  }

  async function handleAbout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sellerType) {
      setFieldErrors({ seller_type: t("errors.sellerTypeRequired") });
      return;
    }
    const data = new FormData(event.currentTarget);
    const payload: ApplicationPayload = {
      identity_name: text(data, "identity_name"),
      seller_type: sellerType,
      city: text(data, "city"),
      state: text(data, "state"),
      country: text(data, "country"),
    };
    if (application) {
      await saveStep(payload, "shop");
      return;
    }

    setBusy(true);
    setError("");
    setErrorAction(null);
    setFieldErrors({});
    try {
      const result = await createSellerApplication({
        ...payload,
        email: email.trim(),
      });
      if (!result.ok) {
        if (
          result.fieldErrors.email &&
          /already|taken|used/i.test(result.fieldErrors.email)
        ) {
          setFieldErrors({ email: t("errors.emailTaken") });
          setError(t("errors.emailTaken"));
          setErrorAction({
            label: t("errors.emailTakenAction"),
            href: statusPath,
          });
          return;
        }
        showFailure(result, t("errors.saveFailed"));
        return;
      }
      setApplication(result.data);
      setSavedAt(new Date());
      goTo("shop");
    } catch {
      setError(t("errors.saveFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function handleShop(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const shopName = text(data, "shop_name");
    if (!(await shopNameAvailable(shopName))) return;
    await saveStep(
      {
        shop_name: shopName,
        shop_description: text(data, "shop_description"),
        maker_story: text(data, "maker_story"),
        website: text(data, "website"),
        instagram: text(data, "instagram"),
      },
      "products",
    );
  }

  async function handleProducts(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await saveStep(
      {
        craft_type: text(data, "craft_type"),
        categories: text(data, "categories")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        product_description: text(data, "product_description"),
        production_notes: text(data, "production_notes"),
        materials: text(data, "materials"),
        made_by: text(data, "made_by"),
        price_range: text(data, "price_range"),
        fulfillment_time: text(data, "fulfillment_time"),
        ships_to: text(data, "ships_to"),
        wholesale_interest: text(data, "wholesale_interest"),
      },
      "work",
    );
  }

  async function handleWork(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!application?.sample_photos?.length) {
      setFieldErrors({ sample_photos: t("errors.photoRequired") });
      setError(t("errors.photoRequired"));
      return;
    }
    const data = new FormData(event.currentTarget);
    await saveStep(
      {
        years_experience: Number(text(data, "years_experience")),
        supporting_information: text(data, "supporting_information"),
      },
      "review",
    );
  }

  function photoProblem(file: File) {
    if (!ACCEPTED_PHOTO_TYPES.has(file.type))
      return t("errors.photoTypeInvalid", { name: file.name });
    if (file.size > MAX_PHOTO_BYTES)
      return t("errors.photoTooLarge", { name: file.name });
    return null;
  }

  async function uploadPhotos(files: FileList | File[] | null) {
    if (!files || !application || !accessToken) return;
    const selected = Array.from(files);
    if (!selected.length) return;
    setError("");
    setFieldErrors({});

    let current = application;
    const remaining = MAX_PHOTOS - (current.sample_photos?.length ?? 0);
    const problems: string[] = [];
    if (selected.length > remaining)
      problems.push(t("errors.photoLimit", { max: MAX_PHOTOS }));

    setUploading(true);
    try {
      for (const file of selected.slice(0, Math.max(remaining, 0))) {
        const problem = photoProblem(file);
        if (problem) {
          problems.push(problem);
          continue;
        }
        const body = new FormData();
        body.set("photo", file);
        const result = await uploadSellerApplicationPhoto(
          current.id,
          body,
          accessToken,
        );
        if (!result.ok) {
          const detail = result.fieldErrors.sample_photos || result.message;
          problems.push(
            /too large|413/i.test(detail)
              ? t("errors.photoTooLarge", { name: file.name })
              : t("errors.uploadFailed", { name: file.name, reason: detail }),
          );
          continue;
        }
        const knownIds = new Set(
          current.sample_photos.map((photo) => photo.id),
        );
        const added = result.data.sample_photos.find(
          (photo) => !knownIds.has(photo.id),
        );
        if (added) {
          const url = URL.createObjectURL(file);
          setPreviews((existing) => ({ ...existing, [added.id]: url }));
        }
        current = result.data;
        setApplication(result.data);
        setSavedAt(new Date());
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    if (problems.length) setError(problems.join(" "));
  }

  async function removePhoto(photoId: string) {
    if (!application || !accessToken) return;
    setUploading(true);
    setError("");
    try {
      const result = await deleteSellerApplicationPhoto(
        application.id,
        photoId,
        accessToken,
      );
      if (!result.ok) {
        setError(result.message || t("errors.saveFailed"));
        return;
      }
      setApplication(result.data);
      setPreviews((existing) => {
        const { [photoId]: removed, ...rest } = existing;
        if (removed) URL.revokeObjectURL(removed);
        return rest;
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!application || !accessToken) return;
    if (!agreed) {
      setFieldErrors({ agreement: t("review.agreementRequired") });
      return;
    }
    if (!isAuthenticated) {
      setError(t("errors.signInRequired"));
      return;
    }

    setBusy(true);
    setError("");
    setErrorAction(null);
    setFieldErrors({});
    try {
      const saved = await updateSellerApplication(
        application.id,
        { agreements_accepted: true },
        accessToken,
      );
      if (!saved.ok) {
        showFailure(saved, t("errors.saveFailed"));
        return;
      }
      setApplication(saved.data);

      const result = await submitSellerApplication(application.id, accessToken);
      if (result.ok) {
        setApplication(result.data);
        router.push(statusPath);
        return;
      }
      if (result.status === 401) {
        setError(t("errors.signInRequired"));
        return;
      }
      if (result.status === 403) {
        setError(t("errors.otherAccount"));
        return;
      }
      const brokenStep = STEPS.find((name) =>
        STEP_FIELDS[name].some((field) => result.fieldErrors[field]),
      );
      if (brokenStep && brokenStep !== "review") {
        setError(t("errors.incomplete"));
        setErrorAction({
          label: t("errors.fixStep", { step: t(`steps.${brokenStep}`) }),
          onClick: () => goTo(brokenStep),
        });
        return;
      }
      showFailure(result, t("errors.saveFailed"));
    } catch {
      setError(t("errors.saveFailed"));
    } finally {
      setBusy(false);
    }
  }

  const reviewSections = useMemo(() => {
    if (!application) return [];
    const option = (
      group:
        | "sellerTypes"
        | "fulfillmentTimes"
        | "shipsTo"
        | "wholesale"
        | "priceRanges"
        | "madeBy",
      value: string | null,
    ) =>
      value ? t(`options.${group}.${value}` as Parameters<typeof t>[0]) : null;
    const craft = CRAFT_OPTIONS.find(
      (item) => item.value === application.craft_type,
    );
    return [
      {
        step: "about" as const,
        rows: [
          [t("fields.email.label"), application.applicant_email],
          [t("fields.identity_name.label"), application.identity_name],
          [
            t("fields.seller_type.label"),
            option("sellerTypes", application.seller_type),
          ],
          [
            t("review.location"),
            [application.city, application.state, application.country]
              .filter(Boolean)
              .join(", "),
          ],
        ],
      },
      {
        step: "shop" as const,
        rows: [
          [t("fields.shop_name.label"), application.shop_name],
          [t("fields.shop_description.label"), application.shop_description],
          [t("fields.maker_story.label"), application.maker_story],
          [t("fields.website.label"), application.website],
          [t("fields.instagram.label"), application.instagram],
        ],
      },
      {
        step: "products" as const,
        rows: [
          [t("fields.categories.label"), application.categories?.join(", ")],
          [
            t("fields.craft_type.label"),
            craft ? t(`options.crafts.${craft.key}`) : application.craft_type,
          ],
          [
            t("fields.product_description.label"),
            application.product_description,
          ],
          [t("fields.production_notes.label"), application.production_notes],
          [t("fields.materials.label"), application.materials],
          [t("fields.made_by.label"), option("madeBy", application.made_by)],
          [
            t("fields.price_range.label"),
            option("priceRanges", application.price_range),
          ],
          [
            t("fields.fulfillment_time.label"),
            option("fulfillmentTimes", application.fulfillment_time),
          ],
          [t("fields.ships_to.label"), option("shipsTo", application.ships_to)],
          [
            t("fields.wholesale_interest.label"),
            option("wholesale", application.wholesale_interest),
          ],
        ],
      },
      {
        step: "work" as const,
        rows: [
          [
            t("photos.title"),
            application.sample_photos?.length
              ? t("photos.count", {
                  count: application.sample_photos.length,
                  max: MAX_PHOTOS,
                })
              : null,
          ],
          [
            t("fields.years_experience.label"),
            application.years_experience != null
              ? t("review.years", { count: application.years_experience })
              : null,
          ],
          [
            t("fields.supporting_information.label"),
            application.supporting_information,
          ],
        ],
      },
    ];
  }, [application, t]);

  if (
    loading ||
    !step ||
    (application && !EDITABLE_STATUSES.includes(application.status))
  ) {
    return (
      <div className={styles.loading} role="status">
        <Loader2 className="size-5 animate-spin" aria-hidden />
        {t("loading")}
      </div>
    );
  }

  const stepIndex = STEPS.indexOf(step);
  const resumeIndex = STEPS.indexOf(resumeStep);
  const craftValues = CRAFT_OPTIONS.map((item) => item.value as string);
  const photoCount = application?.sample_photos?.length ?? 0;

  return (
    <div className={styles.layout}>
      <nav className={styles.progress} aria-label={t("progressLabel")}>
        <p className={styles.progressCounter}>
          {t("stepCounter", { current: stepIndex + 1, total: STEPS.length })}
        </p>
        <div className={styles.progressBar} aria-hidden>
          <span
            style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <ol className={styles.progressList}>
          {STEPS.map((name, index) => {
            const done =
              index < resumeIndex ||
              (name !== "review" && stepComplete(name, application));
            const reachable = index <= resumeIndex;
            const current = name === step;
            return (
              <li key={name}>
                <button
                  type="button"
                  className={`${styles.progressItem} ${current ? styles.progressItemCurrent : ""}`}
                  disabled={!reachable || busy}
                  aria-current={current ? "step" : undefined}
                  onClick={() => goTo(name)}
                >
                  <span
                    className={`${styles.progressMark} ${done ? styles.progressMarkDone : ""}`}
                  >
                    {done ? (
                      <Check className="size-3.5" aria-hidden />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span>{t(`steps.${name}`)}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className={styles.progressNote}>
          {savedAt
            ? t("savedAt", {
                time: savedAt.toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                }),
              })
            : t("savedNote")}
        </p>
      </nav>

      <section className={styles.card} aria-labelledby="sell-apply-step-title">
        <h2
          id="sell-apply-step-title"
          ref={headingRef}
          tabIndex={-1}
          className={styles.stepTitle}
        >
          {t(`steps.${step}`)}
        </h2>
        <p className={styles.stepHelp}>{t(`stepHelp.${step}`)}</p>

        {application?.status === "changes_requested" ? (
          <div className={styles.notice}>
            <p className="font-semibold">{t("changesRequestedTitle")}</p>
            {application.decision_reason ? (
              <p className="mt-1">{application.decision_reason}</p>
            ) : null}
            <p className="mt-1 text-marketplace-muted-foreground">
              {t("changesRequestedBody")}
            </p>
          </div>
        ) : null}

        <div key={step} className={styles.panel}>
          {step === "about" ? (
            <form className={styles.form} onSubmit={handleAbout}>
              <div className={styles.grid2}>
                <Field
                  label={t("fields.email.label")}
                  hint={
                    application
                      ? t("fields.email.lockedHint")
                      : isAuthenticated
                        ? t("fields.email.hintSignedIn")
                        : t("fields.email.hint")
                  }
                  error={fieldErrors.email}
                >
                  <input
                    name="email"
                    type="email"
                    required
                    readOnly={!!application}
                    value={application?.applicant_email ?? email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={controlClass(fieldErrors.email)}
                    autoComplete="email"
                  />
                </Field>
                <Field
                  label={t("fields.identity_name.label")}
                  hint={t("fields.identity_name.hint")}
                  error={fieldErrors.identity_name}
                >
                  <input
                    key={application?.identity_name ? "saved" : profileName}
                    name="identity_name"
                    required
                    defaultValue={application?.identity_name || profileName}
                    className={controlClass(fieldErrors.identity_name)}
                    autoComplete="name"
                  />
                </Field>
              </div>
              <fieldset>
                <legend className={styles.fieldLabel}>
                  {t("fields.seller_type.label")}
                </legend>
                <div className={styles.choiceGrid}>
                  {SELLER_TYPES.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`${styles.choice} ${sellerType === value ? styles.choiceSelected : ""}`}
                      onClick={() => {
                        setSellerType(value);
                        setFieldErrors(
                          ({ seller_type: _ignored, ...rest }) => rest,
                        );
                      }}
                      aria-pressed={sellerType === value}
                    >
                      <span className={styles.choiceTitle}>
                        {t(`options.sellerTypes.${value}`)}
                      </span>
                      <span className={styles.choiceBody}>
                        {t(`options.sellerTypeHelp.${value}`)}
                      </span>
                    </button>
                  ))}
                </div>
                {fieldErrors.seller_type ? (
                  <span className={styles.fieldError}>
                    {fieldErrors.seller_type}
                  </span>
                ) : null}
              </fieldset>
              <div className={styles.grid3}>
                <Field label={t("fields.city.label")} error={fieldErrors.city}>
                  <input
                    name="city"
                    required
                    defaultValue={application?.city ?? ""}
                    className={controlClass(fieldErrors.city)}
                    autoComplete="address-level2"
                  />
                </Field>
                <Field
                  label={t("fields.state.label")}
                  error={fieldErrors.state}
                >
                  <input
                    name="state"
                    required
                    defaultValue={application?.state ?? ""}
                    className={controlClass(fieldErrors.state)}
                    autoComplete="address-level1"
                  />
                </Field>
                <Field
                  label={t("fields.country.label")}
                  error={fieldErrors.country}
                >
                  <input
                    name="country"
                    required
                    defaultValue={application?.country ?? ""}
                    className={controlClass(fieldErrors.country)}
                    autoComplete="country-name"
                  />
                </Field>
              </div>
              <StepActions
                error={error}
                errorAction={errorAction}
                busy={busy}
                continueLabel={t("continue")}
                savingLabel={t("saving")}
              />
            </form>
          ) : null}

          {step === "shop" ? (
            <form className={styles.form} onSubmit={handleShop}>
              <Field
                label={t("fields.shop_name.label")}
                hint={t("fields.shop_name.hint")}
                error={fieldErrors.shop_name}
              >
                <input
                  name="shop_name"
                  required
                  defaultValue={application?.shop_name ?? ""}
                  className={controlClass(fieldErrors.shop_name)}
                  aria-invalid={fieldErrors.shop_name ? true : undefined}
                  onBlur={(event) =>
                    void shopNameAvailable(event.currentTarget.value)
                  }
                />
                {checkingShopName ? (
                  <span className={styles.fieldHint}>
                    {t("fields.shop_name.checking")}
                  </span>
                ) : null}
              </Field>
              <Field
                label={t("fields.shop_description.label")}
                hint={t("fields.shop_description.hint")}
                error={fieldErrors.shop_description}
              >
                <textarea
                  name="shop_description"
                  required
                  rows={3}
                  defaultValue={application?.shop_description ?? ""}
                  className={`${controlClass(fieldErrors.shop_description)} ${styles.textarea}`}
                  aria-invalid={fieldErrors.shop_description ? true : undefined}
                />
              </Field>
              <Field
                label={t("fields.maker_story.label")}
                hint={t("fields.maker_story.hint")}
                error={fieldErrors.maker_story}
              >
                <textarea
                  name="maker_story"
                  required
                  rows={4}
                  defaultValue={application?.maker_story ?? ""}
                  className={`${controlClass(fieldErrors.maker_story)} ${styles.textarea}`}
                  aria-invalid={fieldErrors.maker_story ? true : undefined}
                />
              </Field>
              <div className={styles.grid2}>
                <Field
                  label={t("fields.website.label")}
                  hint={t("fields.website.hint")}
                  error={fieldErrors.website}
                >
                  <input
                    name="website"
                    type="url"
                    defaultValue={application?.website ?? ""}
                    placeholder="https://"
                    className={controlClass(fieldErrors.website)}
                  />
                </Field>
                <Field
                  label={t("fields.instagram.label")}
                  hint={t("fields.instagram.hint")}
                  error={fieldErrors.instagram}
                >
                  <input
                    name="instagram"
                    defaultValue={application?.instagram ?? ""}
                    placeholder={t("fields.instagram.placeholder")}
                    className={controlClass(fieldErrors.instagram)}
                  />
                </Field>
              </div>
              <StepActions
                error={error}
                errorAction={errorAction}
                busy={busy || checkingShopName}
                continueLabel={t("continue")}
                savingLabel={t("saving")}
                onBack={() => goTo("about")}
                backLabel={t("back")}
              />
            </form>
          ) : null}

          {step === "products" ? (
            <form className={styles.form} onSubmit={handleProducts}>
              <Field
                label={t("fields.craft_type.label")}
                error={fieldErrors.craft_type}
              >
                <select
                  name="craft_type"
                  required
                  defaultValue={application?.craft_type ?? ""}
                  className={controlClass(fieldErrors.craft_type)}
                >
                  <option value="">{t("select")}</option>
                  {CRAFT_OPTIONS.map((item) => (
                    <option key={item.key} value={item.value}>
                      {t(`options.crafts.${item.key}`)}
                    </option>
                  ))}
                  {application?.craft_type &&
                  !craftValues.includes(application.craft_type) ? (
                    <option value={application.craft_type}>
                      {application.craft_type}
                    </option>
                  ) : null}
                </select>
              </Field>
              <Field
                label={t("fields.categories.label")}
                hint={t("fields.categories.hint")}
                error={fieldErrors.categories}
              >
                <input
                  name="categories"
                  required
                  defaultValue={(application?.categories ?? []).join(", ")}
                  className={controlClass(fieldErrors.categories)}
                />
              </Field>
              <Field
                label={t("fields.product_description.label")}
                hint={t("fields.product_description.hint")}
                error={fieldErrors.product_description}
              >
                <textarea
                  name="product_description"
                  required
                  rows={4}
                  defaultValue={application?.product_description ?? ""}
                  className={`${controlClass(fieldErrors.product_description)} ${styles.textarea}`}
                />
              </Field>
              <Field
                label={t("fields.production_notes.label")}
                hint={t("fields.production_notes.hint")}
                error={fieldErrors.production_notes}
              >
                <textarea
                  name="production_notes"
                  required
                  rows={4}
                  defaultValue={application?.production_notes ?? ""}
                  className={`${controlClass(fieldErrors.production_notes)} ${styles.textarea}`}
                />
              </Field>
              <Field
                label={t("fields.materials.label")}
                hint={t("fields.materials.hint")}
                error={fieldErrors.materials}
              >
                <textarea
                  name="materials"
                  required
                  rows={3}
                  defaultValue={application?.materials ?? ""}
                  className={`${controlClass(fieldErrors.materials)} ${styles.textarea}`}
                />
              </Field>
              <div className={styles.grid2}>
                <SelectField
                  name="made_by"
                  label={t("fields.made_by.label")}
                  hint={t("fields.made_by.hint")}
                  placeholder={t("select")}
                  options={MADE_BY_OPTIONS.map((value) => ({
                    value,
                    label: t(`options.madeBy.${value}`),
                  }))}
                  value={application?.made_by}
                  error={fieldErrors.made_by}
                />
                <SelectField
                  name="price_range"
                  label={t("fields.price_range.label")}
                  hint={t("fields.price_range.hint")}
                  placeholder={t("select")}
                  options={PRICE_RANGES.map((value) => ({
                    value,
                    label: t(`options.priceRanges.${value}`),
                  }))}
                  value={application?.price_range}
                  error={fieldErrors.price_range}
                />
              </div>
              <div className={styles.grid2}>
                <SelectField
                  name="fulfillment_time"
                  label={t("fields.fulfillment_time.label")}
                  hint={t("fields.fulfillment_time.hint")}
                  placeholder={t("select")}
                  options={FULFILLMENT_TIMES.map((value) => ({
                    value,
                    label: t(`options.fulfillmentTimes.${value}`),
                  }))}
                  value={application?.fulfillment_time}
                  error={fieldErrors.fulfillment_time}
                />
                <SelectField
                  name="ships_to"
                  label={t("fields.ships_to.label")}
                  hint={t("fields.ships_to.hint")}
                  placeholder={t("select")}
                  options={SHIPS_TO_OPTIONS.map((value) => ({
                    value,
                    label: t(`options.shipsTo.${value}`),
                  }))}
                  value={application?.ships_to}
                  error={fieldErrors.ships_to}
                />
              </div>
              <SelectField
                name="wholesale_interest"
                label={t("fields.wholesale_interest.label")}
                hint={t("fields.wholesale_interest.hint")}
                placeholder={t("select")}
                options={WHOLESALE_INTERESTS.map((value) => ({
                  value,
                  label: t(`options.wholesale.${value}`),
                }))}
                value={application?.wholesale_interest}
                error={fieldErrors.wholesale_interest}
              />
              <StepActions
                error={error}
                errorAction={errorAction}
                busy={busy}
                continueLabel={t("continue")}
                savingLabel={t("saving")}
                onBack={() => goTo("shop")}
                backLabel={t("back")}
              />
            </form>
          ) : null}

          {step === "work" ? (
            <form className={styles.form} onSubmit={handleWork}>
              <div>
                <p className={styles.fieldLabel}>{t("photos.title")}</p>
                <p className={styles.fieldHint}>
                  {t("photos.help", { max: MAX_PHOTOS })}
                </p>
                <label
                  className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ""} ${photoCount >= MAX_PHOTOS ? styles.dropzoneDisabled : ""}`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragOver(false);
                    if (photoCount < MAX_PHOTOS)
                      void uploadPhotos(event.dataTransfer.files);
                  }}
                >
                  <span className={styles.dropzoneIcon}>
                    {uploading ? (
                      <Loader2 className="size-5 animate-spin" aria-hidden />
                    ) : (
                      <ImagePlus className="size-5" aria-hidden />
                    )}
                  </span>
                  <span className="text-sm font-semibold">
                    {uploading
                      ? t("photos.uploading")
                      : photoCount >= MAX_PHOTOS
                        ? t("photos.full", { max: MAX_PHOTOS })
                        : t("photos.drop")}
                  </span>
                  <span className={styles.fieldHint}>
                    {t("photos.formats")}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={uploading || photoCount >= MAX_PHOTOS}
                    onChange={(event) => void uploadPhotos(event.target.files)}
                  />
                </label>
                {fieldErrors.sample_photos ? (
                  <span className={styles.fieldError}>
                    {fieldErrors.sample_photos}
                  </span>
                ) : null}
                {photoCount ? (
                  <>
                    <p className={`${styles.fieldHint} mt-3`}>
                      {t("photos.count", {
                        count: photoCount,
                        max: MAX_PHOTOS,
                      })}
                    </p>
                    <ul className={styles.photoList}>
                      {application?.sample_photos.map((photo) => (
                        <li key={photo.id} className={styles.photoItem}>
                          {previews[photo.id] ? (
                            // biome-ignore lint/performance/noImgElement: local object URL preview
                            <img
                              src={previews[photo.id]}
                              alt=""
                              className={styles.photoThumb}
                            />
                          ) : (
                            <span className={styles.photoThumbPlaceholder}>
                              <Check className="size-4" aria-hidden />
                            </span>
                          )}
                          <span className={styles.photoName}>
                            {photo.filename}
                          </span>
                          <button
                            type="button"
                            className={styles.iconButton}
                            onClick={() => void removePhoto(photo.id)}
                            disabled={uploading}
                            aria-label={t("photos.remove", {
                              name: photo.filename,
                            })}
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
              <Field
                label={t("fields.years_experience.label")}
                hint={t("fields.years_experience.hint")}
                error={fieldErrors.years_experience}
              >
                <input
                  name="years_experience"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={80}
                  required
                  defaultValue={application?.years_experience ?? ""}
                  className={controlClass(fieldErrors.years_experience)}
                />
              </Field>
              <Field
                label={t("fields.supporting_information.label")}
                hint={t("fields.supporting_information.hint")}
                error={fieldErrors.supporting_information}
              >
                <textarea
                  name="supporting_information"
                  rows={3}
                  defaultValue={application?.supporting_information ?? ""}
                  className={`${controlClass(fieldErrors.supporting_information)} ${styles.textarea}`}
                />
              </Field>
              <StepActions
                error={error}
                errorAction={errorAction}
                busy={busy || uploading}
                continueLabel={t("continue")}
                savingLabel={t("saving")}
                onBack={() => goTo("products")}
                backLabel={t("back")}
              />
            </form>
          ) : null}

          {step === "review" && application ? (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.reviewList}>
                {reviewSections.map((section) => (
                  <section key={section.step} className={styles.reviewSection}>
                    <div className={styles.reviewHeader}>
                      <h3>{t(`steps.${section.step}`)}</h3>
                      <button
                        type="button"
                        className={styles.linkButton}
                        onClick={() => goTo(section.step)}
                      >
                        {t("review.edit")}
                      </button>
                    </div>
                    <dl>
                      {section.rows.map(([label, value]) => (
                        <div key={label} className={styles.reviewRow}>
                          <dt>{label}</dt>
                          <dd>
                            {value || (
                              <span className="text-marketplace-muted-foreground">
                                {t("review.notProvided")}
                              </span>
                            )}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                ))}
              </div>

              {isAuthenticated ? (
                <p className={styles.accountNote}>
                  {t("review.signedInAs", { email: user?.email ?? "" })}
                </p>
              ) : (
                <div className={styles.signInCard}>
                  <Lock
                    className="size-5 shrink-0 text-marketplace-brand"
                    aria-hidden
                  />
                  <div>
                    <p className="font-semibold">{t("review.signInTitle")}</p>
                    <p className="mt-1 text-sm text-marketplace-muted-foreground">
                      {t("review.signInBody")}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href={loginHref} className={styles.primary}>
                        {t("review.signIn")}
                      </Link>
                      <Link href={registerHref} className={styles.ghost}>
                        {t("review.createAccount")}
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <label
                className={`${styles.agreement} ${fieldErrors.agreement ? styles.agreementInvalid : ""}`}
              >
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(event) => {
                    setAgreed(event.target.checked);
                    setFieldErrors(({ agreement: _ignored, ...rest }) => rest);
                  }}
                  className="mt-1 size-4 accent-[var(--marketplace-brand)]"
                />
                <span>
                  {t("review.agreementBefore")}{" "}
                  <Link
                    href={`${basePath}/handmade-standards`}
                    className="underline underline-offset-2"
                    target="_blank"
                  >
                    {t("review.standardsLink")}
                  </Link>
                  {t("review.agreementAfter")}
                </span>
              </label>
              {fieldErrors.agreement ? (
                <span className={styles.fieldError}>
                  {fieldErrors.agreement}
                </span>
              ) : null}
              <p className={styles.fieldHint}>{t("review.submitHint")}</p>
              <StepActions
                error={error}
                errorAction={errorAction}
                busy={busy}
                disabled={!isAuthenticated}
                continueLabel={t("review.submit")}
                savingLabel={t("review.submitting")}
                onBack={() => goTo("work")}
                backLabel={t("back")}
              />
            </form>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function controlClass(fieldError?: string) {
  return `${styles.control} ${fieldError ? styles.controlInvalid : ""}`;
}

function SelectField({
  name,
  label,
  hint,
  placeholder,
  options,
  value,
  error,
}: {
  name: string;
  label: string;
  hint?: string;
  placeholder: string;
  options: { value: string; label: string }[];
  value: string | null | undefined;
  error?: string;
}) {
  return (
    <Field label={label} hint={hint} error={error}>
      <select
        name={name}
        required
        defaultValue={value ?? ""}
        className={controlClass(error)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {hint ? <span className={styles.fieldHint}>{hint}</span> : null}
      {children}
      {error ? <span className={styles.fieldError}>{error}</span> : null}
    </label>
  );
}

type ErrorAction = { label: string; href?: string; onClick?: () => void };

function StepActions({
  error,
  errorAction,
  busy,
  disabled,
  continueLabel,
  savingLabel,
  onBack,
  backLabel,
}: {
  error: string;
  errorAction: ErrorAction | null;
  busy: boolean;
  disabled?: boolean;
  continueLabel: string;
  savingLabel: string;
  onBack?: () => void;
  backLabel?: string;
}) {
  return (
    <>
      {error ? (
        <div className={styles.errorBanner} role="alert">
          <p>{error}</p>
          {errorAction?.href ? (
            <Link
              href={errorAction.href}
              className="mt-1 inline-block font-semibold underline underline-offset-2"
            >
              {errorAction.label}
            </Link>
          ) : null}
          {errorAction?.onClick ? (
            <button
              type="button"
              onClick={errorAction.onClick}
              className="mt-1 font-semibold underline underline-offset-2"
            >
              {errorAction.label}
            </button>
          ) : null}
        </div>
      ) : null}
      <div className={styles.actions}>
        {onBack ? (
          <button
            type="button"
            className={styles.ghost}
            onClick={onBack}
            disabled={busy}
          >
            {backLabel}
          </button>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={busy || disabled}
          className={styles.primary}
        >
          {busy ? (
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
          ) : null}
          {busy ? savingLabel : continueLabel}
        </button>
      </div>
    </>
  );
}
