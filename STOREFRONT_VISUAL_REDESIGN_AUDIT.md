# Storefront visual redesign — Phase 0 audit

**Date:** 2026-09-22  
**Scope:** Existing Next.js marketplace storefront at `storefront/` (Spree 6.1 Store API / `@spree/sdk`)  
**Spec:** Desktop + mobile mockups (placeholder brand “Crafted” — not production naming)  
**Rule:** Refactor in place; preserve `storefront/lib/data/*` and commerce flows.

---

## Executive summary

The storefront already implements a full marketplace: locale/country routing, categories, collections, PDP with personalization, multi-seller cart, checkout, payments, favorites, messages, reviews, merchandising placements, and seller storefronts. A **partial homepage/header restyle** was started to resemble the mockups but **does not yet satisfy** the full program spec: **PDP / collections / cart / checkout** remain on the pre-redesign visual system, duplicate collection-card primitives remain, and editorial modules may still use placeholder imagery.

**Phase 1 progress (2026-09-22):** Renamed mock-specific components (`MarketplaceHeroSection`, `MarketplaceHeaderActions`); locale keys `marketplaceHero*`; removed default hero Unsplash; **ProductCard** densities consolidated to `standard` | `compact`; semantic plum/ink/cream/blush tokens added in `globals.css`; layout unit test updated for promo bar; Vitest green. **No parallel app** exists; all work remains under `storefront/src`.

**Progress update (2026-09-23):** The current uncommitted storefront changes have carried the foundation and shared-card consolidation forward. Homepage Phase 3 is now aligned to the Spree Storefront Visual System: the brand token is `#3b3044`, product cards are image-first without a surrounding card shell, homepage icons use Spree SVGs, synthetic review quotes and the duplicate static collections grid are removed, and the hero uses an editorial split without gradients. Merchandising, category, trending-product, and analytics integrations remain in place.

**Next step:** Phase 4 collection/category/search alignment. Keep the homepage as the visual reference; do not restart its composition or reintroduce placeholder reviews, collections, products, or shops.

---

## A. Route inventory

Routing root: `app/[country]/[locale]/`.

| Area | Route pattern | Page entry | Layout group |
|------|---------------|------------|--------------|
| Homepage | `/` | `(storefront)/page.tsx` | `(storefront)/layout.tsx` — promo, header, footer, bottom nav |
| Products PLP | `/products` | `(storefront)/products/page.tsx` | storefront |
| Product PDP | `/products/[slug]` | `(storefront)/products/[slug]/page.tsx` | storefront |
| Private listing | `/products/private/[id]` | `(storefront)/products/private/[id]/page.tsx` | storefront |
| Category | `/c/[...permalink]` | `(storefront)/c/[...permalink]/page.tsx` | storefront |
| Collection | `/collections/[slug]` | `(storefront)/collections/[slug]/page.tsx` | storefront |
| Shop directory | `/shops` | `(storefront)/shops/page.tsx` | storefront |
| Seller storefront | `/sellers/[slug]` | `(storefront)/sellers/[slug]/page.tsx` | storefront |
| Cart | `/cart` | `(storefront)/cart/page.tsx` | storefront |
| Checkout | `/checkout/[id]` | `(checkout)/checkout/[id]/page.tsx` | `(checkout)/layout.tsx` — no bottom nav |
| Confirm payment | `/confirm-payment/[id]` | `(checkout)/confirm-payment/[id]/page.tsx` | checkout |
| Order placed | `/order-placed/[id]` | `(checkout)/order-placed/[id]/page.tsx` | checkout |
| Account (auth) | `/account/*` | multiple under `(storefront)/account/` | storefront / authenticated sub-layout |
| Policies | `/policies/[slug]` | `(storefront)/policies/[slug]/page.tsx` | storefront |
| Wholesale | `/wholesale/*` | `(wholesale)/wholesale/*` | isolated wholesale layout |

**Preserved:** All URLs above should remain unless a deliberate migration plan says otherwise.

---

## B. Layout hierarchy

```
app/[country]/[locale]/layout.tsx          → DocumentShell, providers, i18n, markets
├── (storefront)/layout.tsx                → MarketplacePromoBar, Header, main, Footer, MarketplaceBottomNav
├── (checkout)/layout.tsx                  → Minimal checkout chrome, CheckoutProvider
└── (wholesale)/wholesale/layout.tsx       → Wholesale shell (out of scope for marketplace redesign)
```

**Header (current):** `components/layout/Header.tsx` + `MarketplacePromoBar`, `MarketplaceCategoryRow`, `MarketplaceHeaderActions`, `StoreBrandLogo`, `SearchBar`, `CartButton`.

**Mobile:** `MarketplaceBottomNav` (5 columns: Home, Browse menu, Favorites, Messages, Account) + `MobileMenu` + `SearchToggle` in header. **Gap vs spec:** spec suggests Home / Shop / Gift Guide / Favorites / Account (max 5); current uses Messages + menu slot instead of Shop + Discover.

**Marketplace composition primitives (existing):** `components/marketplace/` — `MarketplacePage`, `MarketplaceSection`, `MarketplaceSectionHeader`, `MarketplaceGrid`, `MarketplaceEditorialTile`, `MarketplaceToolbar`, `MarketplaceRail`, empty/error states.

---

## C. Data layer (`lib/data/*`)

| Module | Responsibility |
|--------|----------------|
| `products.ts`, `cached.ts` | PLP/PDP fields, list filters |
| `categories.ts` | Category tree |
| `collections.ts` | Collection + collection products |
| `merchandising.ts` | Homepage placements (hero, rails, tiles) |
| `recommendations.ts` | Trending, new arrivals, followed shops, etc. |
| `cart.ts` | Cart mutations (via contexts wrapping SDK) |
| `checkout.ts`, `payment.ts`, `express-checkout-flow.ts` | Checkout state |
| `sellers.ts` | Shop directory |
| `favorites.ts`, `follows.ts` | Favorites / followed shops |
| `reviews.ts` | Product reviews |
| `messages.ts` | Buyer messaging |
| `markets.ts`, `countries.ts` | Currency, country, locale |
| `personalization-uploads.ts`, `order-proofs.ts` | Personalization & proofs |

**Rule:** All redesigned surfaces must call these (or server actions that call them)—no parallel fetch layer.

**Homepage data today:**

- `getMerchandisingPlacements({ surface: "homepage" })` on `page.tsx`
- `getCategories({ depth_eq: 0, ... })`
- `getTrendingProducts()` for best-sellers fallback
- Optional `MerchandisingHero` when `hero` placement exists

---

## D. Component inventory (marketplace-relevant)

### Product listing family (canonical target: one `ProductCard`)

| Component | Role | Notes |
|-----------|------|--------|
| `products/ProductCard.tsx` | Primary card | Densities: `default`, `shop`, **`crafted`** ← violates spec; merge into `standard` / `compact` |
| `products/ProductCardSkeleton.tsx` | Loading | |
| `products/ProductCarousel.tsx` | Swiper rail | Uses `ProductCard` |
| `products/ProductGrid.tsx` | Grid wrapper | |
| `products/InfiniteProductList.tsx` | PLP infinite scroll | |
| `products/ProductListing.tsx` | PLP shell + filters | Uses `ListingFilterBar`, mobile drawer patterns |
| `products/ProductRecommendationRail.tsx` | Section + carousel | |
| `home/HomeProductGrid.tsx` | Homepage 6-col grid | Forces `density="crafted"` |

### Collection / category UI (fragmented)

| Component | Role | Consolidation target |
|-----------|------|----------------------|
| `marketplace/MarketplaceEditorialTile.tsx` | Generic editorial link card | Basis for `CollectionCard` |
| `home/FeaturedCollectionCard.tsx` | Homepage-only collection card | **Duplicate** → `CollectionCard` |
| `home/CategoryBrowseGrid.tsx` | Legacy grid (unused on homepage narrative) | |
| `home/CategoryQuickLinks.tsx` | Circular category scroller | `CategoryScroller` |
| `home/ShopByOccasionSection.tsx` | Occasion circles | |

### Homepage modules (recent + legacy)

| Component | Status |
|-----------|--------|
| `CraftedHeroSection.tsx` | Default hero — **rename** to `MarketplaceHero`; remove Unsplash default when merchandising hero absent; prefer placement or store asset |
| `MerchandisingHero.tsx` | Admin-driven hero | Align styling with `MarketplaceHero` |
| `HomeMarketplaceNarrative.tsx` | Composes homepage sections | |
| `FeaturedCollectionsShowcase.tsx` | Split collections | API-driven |
| `HomeEditorialBanners.tsx` | Maker + gift banners | **Hardcoded Unsplash** — should use placements or CMS fields |
| `HomeServiceTrustBar.tsx` | Trust strip | Copy only; no fake stats |
| `FeaturedShopsShowcase.tsx` / `FeaturedShopCard.tsx` | Etsy-style band | **Removed from homepage narrative**; still in repo for `/shops` / merchandising |
| `HeroSection.tsx` | Starter template hero | Legacy |
| `WholesaleSection.tsx` | B2B CTA | Removed from homepage `page.tsx` — still available for reintroduction via placement |

### Shop / seller

| Component | Role |
|-----------|------|
| `shops/ShopCard.tsx` | `compact` \| `rich` for directory |
| `shops/seller-storefront/*` | Seller PDP shop experience |
| `shops/FeaturedShopCard.tsx` | Spotlight card (separate from ShopCard) |

### Cart / checkout

| Component | Role |
|-----------|------|
| `cart/CartLineItems.tsx` | Multi-seller grouping (preserve) |
| `contexts/CartContext.tsx` | Cart state |
| `(checkout)/layout.tsx` | Checkout chrome |
| `contexts/CheckoutContext.tsx` | Checkout steps |
| `components/checkout/*` | Payment, express checkout, sections |

### Layout / brand

| Component | Brand note |
|-----------|------------|
| `StoreBrandLogo.tsx` | Uses `getStoreName()`, `header.storeTagline` — **correct** |
| `Header.test.tsx` | Mocks `getStoreName: () => "Crafted"` — **fix to neutral name** |

**Brand config:** `lib/store.ts` — `NEXT_PUBLIC_STORE_NAME`, `NEXT_PUBLIC_STORE_DESCRIPTION`, `SELLER_ONBOARDING_URL`, `SELLER_PANEL_URL`. No “Crafted” in production code paths except tests and misleading component filenames.

---

## E. Styling & tokens (current)

**File:** `src/app/globals.css` — `--marketplace-*` semantic tokens (brand, promo, header, surface, border, sale, radii, shadow).

**Recent values:** brand/promo `#482946`, canvas `#f7f4f0` (close to spec cream; spec also suggests plum `#4B143F`, ink, blush).

**Typography:** Geist (sans) + Playfair Display (`--font-playfair`) for `font-display`. Spec wants explicit editorial vs UI roles—document in Phase 1 token map.

**Gap:** Spec tokens (`marketplace-plum`, `marketplace-ink`, `marketplace-cream`, etc.) should **alias or extend** existing `--marketplace-*` rather than a second parallel system.

---

## F. i18n & locale

- Messages: `messages/{en,de,es,fr,pl}.json`
- `pnpm check:locales` — parity enforced
- Homepage/header keys added for promo, hero, collections, trust (`home.crafted*` keys should be **renamed** to neutral `home.hero*` in Phase 1)

---

## G. Authentication & buyer features

- `contexts/AuthContext.tsx` — JWT / session for Store API
- Favorites, messages, followed shops, saved searches — account routes
- Header: favorites, messages, sign-in/account, cart

---

## H. Responsive behavior (current)

| Breakpoint | Behavior |
|------------|----------|
| `< md` | Bottom nav, mobile menu, search toggle, stacked homepage grids |
| `md+` | Full header search, category row, multi-column grids |

**Not yet validated** at 375 / 390 / 430 / 1280 / 1440 per spec checklist.

---

## I. E2E & tests

**Playwright (`e2e/`):** `storefront-3-shell`, `storefront-3-discovery`, `storefront-3-visual`, `checkout`, `multi-seller-checkout`, `personalized-product`, `seller-shop`, messaging, merchandising, etc.

**Vitest baseline (2026-09-22):** `pnpm test` → **52 files, 301 passed, 1 failed** (plus 1 file failed to run). Known failure tied to layout/header test expecting old Header API (`layout.test.tsx` / header type assertion). `Header.test.tsx` updated for new actions; layout test may still reference removed props.

**Commands for CI parity:**

```bash
cd storefront
pnpm check:locales
pnpm test
pnpm lint
pnpm build
pnpm test:e2e   # requires backend / e2e:up per worktree docs
```

---

## J. Gap analysis vs mock program

| Surface | Mock target | Current state | Phase |
|---------|-------------|---------------|-------|
| Design tokens | Semantic plum/cream/ink | Core `--marketplace-*` tokens now match the Spree visual system; migrate remaining hardcoded values as each surface is updated | 1 |
| Desktop header | Utility + search + nav | Implemented loosely; Ask The Curator removed | 1 polish |
| Mobile header | Logo, search, cart, menu | Partial; differs from mock | 1 |
| Bottom nav | ≤5: Home, Shop, Discover, Favorites, Account | 5 slots but Messages + Browse menu | 1 |
| Homepage | Spree editorial and product-first sequence | Phase 3 visual alignment implemented; responsive visual QA remains | 3 |
| Collections discovery | Editorial grid + hero | Collection page uses `ProductListing`; no dedicated collections index mock | 4 |
| PLP / search | Same design system | Legacy styling | 4 |
| PDP | 60/40 gallery + purchase panel | Functional; old visual system | 5 |
| Cart | Multi-seller + summary | Logic intact; old UI | 6 |
| Checkout | Sticky summary, sections | Logic intact; old UI | 7 |
| Order confirmation | Match checkout | Old UI | 7 |
| ProductCard | One image-first card, standard/compact | Densities consolidated; standard card has no shell or shadow and uses Spree icons | 2 |
| CollectionCard | One family | EditorialTile + FeaturedCollectionCard | 2 |

---

## K. Risks

1. **Duplication drift** — `crafted` density, `FeaturedCollectionCard`, separate hero components multiply maintenance.
2. **Hardcoded media** — Unsplash URLs in hero/banners bypass merchandising and hurt brand consistency.
3. **Regression** — Multi-seller cart, personalization PDP, checkout payments are easy to break with layout-only refactors; require e2e on touch.
4. **Brand leakage** — Filename/copy keys containing “Crafted” confuse implementers; tests mocking “Crafted”.
5. **Wholesale** — Homepage no longer shows `WholesaleSection`; B2B entry only via footer/mobile menu unless restored via placement.
6. **Featured shops** — Removed from homepage; still valid for merchandising `shop_rail` via `MerchandisingShopRails` (not wired in current `HomeMarketplaceNarrative`).

---

## L. Proposed component consolidation map

| Target (spec) | Action |
|---------------|--------|
| `ProductCard` | Remove `crafted`; extend `standard` with optional `layout="home"` or use `compact` on mobile PLP; single markup for title → seller → rating → price |
| `CollectionCard` | Merge `FeaturedCollectionCard` + editorial tile variant |
| `MarketplaceHero` | Rename `CraftedHeroSection`; share layout with `MerchandisingHero` |
| `CategoryScroller` | Rename `CategoryQuickLinks` |
| `SectionHeader` | Alias/wrap `MarketplaceSectionHeader` with serif option |
| `MarketplaceHeader` | Split `Header` + `MarketplacePromoBar` + `DesktopMarketplaceNav` |
| `MobileBottomNav` | Refactor `MarketplaceBottomNav` to spec destinations |

---

## M. Files expected to change (by phase)

### Phase 1 — Foundation

- `src/app/globals.css`
- `src/components/marketplace/*` (extend)
- `src/components/layout/Header.tsx`, `MarketplacePromoBar.tsx`, `MarketplaceCategoryRow.tsx`, `MarketplaceBottomNav.tsx`, `MobileMenu.tsx`
- `messages/*.json` (rename keys, no Crafted)
- `docs/plans/6.1-storefront-crafted-homepage.md` → rename to neutral plan title in monorepo `docs/plans/`

### Phase 2 — Cards

- `src/components/products/ProductCard.tsx`
- `src/components/products/__tests__/ProductCard.test.tsx`
- New `src/components/marketplace/collection/CollectionCard.tsx` (or under `components/collection/`)
- Remove or re-export `FeaturedCollectionCard.tsx`

### Phase 3 — Homepage

- `src/app/[country]/[locale]/(storefront)/page.tsx`
- `src/components/home/*` (hero, narrative, rails)
- Merchandising integration only—no static product arrays

### Phase 4 — Collections / PLP

- `src/app/.../collections/[slug]/page.tsx`
- `src/app/.../products/page.tsx`, `c/[...permalink]/page.tsx`
- `ProductListing.tsx`, filter drawer

### Phase 5 — PDP

- `src/app/.../products/[slug]/*`, `ProductDetails.tsx`, personalization, gallery

### Phase 6 — Cart

- `src/app/.../cart/page.tsx`, `CartLineItems.tsx`, summary components

### Phase 7 — Checkout

- `(checkout)/*`, order-placed, confirm-payment

### Phase 8–9 — Mobile polish & QA

- All above + `e2e/*`, visual regression

---

## N. Immediate compliance fixes (before Phase 1 coding)

Recommended next PR (small, spec-aligned):

1. Rename `CraftedHeroSection` → `MarketplaceHeroSection` (file + imports).
2. Rename i18n keys `home.crafted*` → `home.hero*`.
3. Remove `ProductCard` density `crafted`; fold layout into `standard`.
4. Replace `Header.test.tsx` store name mock with `Maker Market` or `Test Store`.
5. Fix failing `layout.test.tsx` if still referencing obsolete `Header` props.
6. Document default hero/banner imagery: merchandising placement first, optional `NEXT_PUBLIC_DEFAULT_HERO_IMAGE` env—not Unsplash in component bodies long term.

---

## O. Relation to monorepo plan

Monorepo: `docs/plans/6.1-storefront-crafted-homepage.md` — should be retitled to **storefront visual redesign** and updated to reference this audit and the non-negotiables (no Crafted brand, one ProductCard, audit-first).

Storefront 3.0 shell plan (`docs/plans/6.1-storefront-3-phase-0-1.md`) remains valid for routing and behavior constraints.

---

## P. Sign-off for Phase 0

| Criterion | Status |
|-----------|--------|
| Route map documented | Yes |
| Data layer documented | Yes |
| Component duplication identified | Yes |
| Mock vs current gap table | Yes |
| Test baseline recorded | Yes (1 failing unit test) |
| Implementation phases mapped | Yes |

**Phase 0 complete.** Proceed to **Phase 1** only after acknowledging consolidation rules and scheduling PDP/cart/checkout in later phases—not another homepage-only pass with new duplicates.
