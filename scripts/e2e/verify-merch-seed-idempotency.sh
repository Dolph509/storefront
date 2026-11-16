#!/usr/bin/env bash
# Verify merchandising dev dataset seed is idempotent (run 1 == run 2).
set -euo pipefail

readonly COMPOSE_FILE="${1:-e2e-backend/docker-compose.merchandising.yml}"

runner='store = Spree::Store.default
fixtures = Spree::MarketplaceDevDataset::MerchandisingSignalsFixtures.new(store: store)
snap1 = fixtures.count_snapshot
fixtures.call
snap2 = fixtures.count_snapshot
fixtures.call
snap3 = fixtures.count_snapshot
puts "| Fixture | Run 1 | Run 2 | Result |"
puts "|---|---:|---:|---|"
snap1.each_key do |key|
  match = snap2[key] == snap3[key] ? "OK" : "FAIL"
  puts "| #{key} | #{snap1[key]} | #{snap3[key]} | #{match} |"
end
if snap2 != snap3
  puts "MERCH_SEED_IDEMPOTENCY_FAILED"
  exit 1
end
puts "MERCH_SEED_IDEMPOTENCY_OK"'

docker compose -f "$COMPOSE_FILE" exec -T web bash -lc \
  "cd /rails && bundle exec rails runner \"$runner\""
