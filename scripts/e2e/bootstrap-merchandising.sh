#!/usr/bin/env bash
# Bootstrap monorepo merchandising E2E backend + write .env.merch-e2e
set -euo pipefail

readonly REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
readonly BACKEND_DIR="$REPO_ROOT/e2e-backend"
readonly COMPOSE_FILE="$BACKEND_DIR/docker-compose.merchandising.yml"
readonly ENV_FILE="$REPO_ROOT/.env.merch-e2e"
readonly SPREE_URL="http://localhost:4010"

cd "$REPO_ROOT"

echo "==> Starting merchandising E2E stack"
docker compose -f "$COMPOSE_FILE" up -d --wait

echo "==> Waiting for Spree at $SPREE_URL/up"
curl -fsS --retry 120 --retry-delay 3 --retry-all-errors "$SPREE_URL/up" >/dev/null

echo "==> Seeding marketplace dev dataset (includes merchandising fixtures)"
docker compose -f "$COMPOSE_FILE" exec -T web bash -lc \
  "cd /rails && bundle exec rails spree:marketplace:seed_dev_dataset"

echo "==> Fetching publishable API key"
PUBLISHABLE_KEY="$(docker compose -f "$COMPOSE_FILE" exec -T web bash -lc \
  "cd /rails && bundle exec rails runner \"puts Spree::ApiKey.publishable.active.first&.token || Spree::Store.default.api_keys.publishable.active.first&.token\"" | tr -d '\r')"

if [[ -z "$PUBLISHABLE_KEY" ]]; then
  echo "No publishable key found after seed." >&2
  exit 1
fi

cat >"$ENV_FILE" <<EOF
SPREE_API_URL=$SPREE_URL/api/v3/store
NEXT_PUBLIC_SPREE_API_URL=$SPREE_URL/api/v3/store
SPREE_PUBLISHABLE_KEY=$PUBLISHABLE_KEY
STOREFRONT_E2E_PORT=3002
MARKETPLACE_E2E_REQUIRED=1
EOF

echo "==> Wrote $ENV_FILE"
echo "    SPREE_API_URL=$SPREE_URL/api/v3/store"
