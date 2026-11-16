# Marketplace 3 design foundation

## Visual roles

The marketplace uses warm neutral backgrounds, dark ink text, quiet borders, and Spree Plum (`#3b3044`). Semantic `marketplace-*` tokens express these roles; new shell components do not depend on the legacy blue or raw gray scales. Sale, success, and danger colors are reserved for meaning.

## Composition contract

`MarketplacePage` sets the canonical `1440px` maximum width with responsive `16px`, `24px`, and `32px` horizontal padding. Major sections use a `48px` mobile and `64px` desktop rhythm. Rails may extend horizontally on small screens while grids stay within the page container.

Controls use `6–8px` corners. Cards use `8–10px` only where the composition needs them. Product cards have no visible outer shell or shadow; spacing and imagery establish their grouping. Floating menus may use a subtle shadow.

`MarketplaceSectionHeader` is the single title, description, and action pattern for marketplace sections. `MarketplaceToolbar`, grids, rails, empty states, and error states provide stable contracts for later listing and discovery work.

Product and shop card visuals adopt the semantic tokens and composition contracts without changing their analytics or discovery payloads. Product photography provides most of the page color. Use the supplied Spree SVG icon and empty-state libraries; avoid gradients, decorative blobs, and repeated rounded containers.

## Shell information architecture

Desktop presents brand and Browse, a persistent search, buyer actions, and a root-category row. Mobile keeps brand, search, and cart in the header and uses Home, Browse, Favorites, Messages, and Account in the bottom navigation. Checkout and wholesale remain outside this shell.
