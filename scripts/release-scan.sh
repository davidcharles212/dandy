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
  # Trust-layer assertions (DANDY_DR_DESIGN_PROPOSAL.md §3.3 #9):
  '\[GUARANTEE_SENTENCE\]'
  'data-copy-status="pending-legal"'
  '★'
  '⭐'
  '\$[0-9]+\.[0-9]{2}[[:space:]]*/[[:space:]]*day'
  '[Rr]outines?[^-]'
  '[Dd]aily ritual'
  '[Mm]ake it a habit'
  'countdown'
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

# Guarantee sentence single-source rule: the string may exist in exactly one theme file.
guarantee_files="$(grep -RIlE --exclude='*.map' -- 'GUARANTEE_SENTENCE|dandy_guarantee_sentence' "${scan_paths[@]/#/$scan_root/}" 2>/dev/null || true)"
guarantee_count="$(printf '%s' "$guarantee_files" | grep -c . || true)"
if [[ "$guarantee_count" -gt 1 ]]; then
  found=1
  printf 'Release-blocking: guarantee sentence has %s sources (must be exactly one: snippets/dandy-guarantee-line.liquid)\n%s\n' "$guarantee_count" "$guarantee_files"
fi

if [[ "$found" -ne 0 ]]; then
  echo "Release scan failed: development markers or unresolved approvals remain." >&2
  exit 1
fi

echo "Release scan passed: no configured development markers were found."
