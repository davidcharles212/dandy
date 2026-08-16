#!/usr/bin/env bash

set -euo pipefail

scan_root="${1:-.}"

if [[ ! -d "$scan_root/templates" || ! -d "$scan_root/sections" ]]; then
  echo "Release scan error: $scan_root does not look like a Shopify theme root." >&2
  exit 2
fi

patterns=(
  '\[COPY NEEDED'
  '\[REAL REVIEW NEEDED'
  '\[ASSET V-'
  '\[FINAL [A-Z]'
  'data-development-marker='
  '"development_preview"[[:space:]]*:[[:space:]]*true'
  '"design_preview_mode"[[:space:]]*:[[:space:]]*true'
  '"copy_status"[[:space:]]*:[[:space:]]*"aggressive-draft"'
  '"copy_status"[[:space:]]*:[[:space:]]*"missing-'
)

scan_paths=(assets blocks config layout locales sections snippets templates)
found=0

for pattern in "${patterns[@]}"; do
  matches="$(grep -RInE --exclude='*.map' -- "$pattern" "${scan_paths[@]/#/$scan_root/}" 2>/dev/null || true)"
  if [[ -n "$matches" ]]; then
    found=1
    printf 'Release-blocking pattern: %s\n%s\n' "$pattern" "$matches"
  fi
done

if [[ "$found" -ne 0 ]]; then
  echo "Release scan failed: development markers or unresolved approvals remain." >&2
  exit 1
fi

echo "Release scan passed: no configured development markers were found."
