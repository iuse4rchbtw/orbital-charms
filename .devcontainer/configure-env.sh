#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [[ ! -f .env ]]; then
  cp .env.example .env
fi

if ! pnpm supabase status -o json >/tmp/orbital-supabase-status.json 2>/tmp/orbital-supabase-status.err; then
  pnpm supabase status -o env >/tmp/orbital-supabase-status.env
fi

node .devcontainer/configure-env.mjs
