#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if ! pnpm supabase status >/dev/null 2>&1; then
  pnpm supabase start
fi

bash .devcontainer/configure-env.sh

if ! curl -fsS --max-time 2 http://127.0.0.1:3000 >/dev/null 2>&1; then
  nohup pnpm dev >/tmp/orbital-charms-dev.log 2>&1 &
fi
