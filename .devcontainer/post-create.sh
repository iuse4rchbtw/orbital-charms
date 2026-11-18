#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

corepack enable
pnpm install --frozen-lockfile

pnpm supabase start

bash .devcontainer/configure-env.sh
