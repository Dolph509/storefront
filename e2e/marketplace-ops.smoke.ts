/**
 * Storefront marketplace-ops smoke (manual / worktree).
 *
 * The Next.js storefront is not part of the dashboard Playwright harness.
 * After `bin/rails spree:marketplace:seed_dev_dataset` and
 * `bin/rails spree:marketplace:validate_dataset`, walk:
 *
 * 1. Sign in as `dev-buyer-001@example.com` / `spree123`
 * 2. Account → Messages — open a thread with `[dev-dataset]` copy
 * 3. Account → Orders — open a completed seller order — Contact seller / Get help
 * 4. Account → Offers — Message seller when offers were seeded
 *
 * Automate later under the storefront app's own Playwright config when one exists.
 */
export {};
