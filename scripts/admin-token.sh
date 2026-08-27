#!/bin/bash
# Prints a store-scoped Shopify Admin API token derived from the Shopify CLI's
# logged-in session (~/Library/Preferences/shopify-cli-kit-nodejs/config.json).
# Use with:  Authorization: Bearer <token>   (NOT X-Shopify-Access-Token).
# Tokens live ~24h; if expired, any CLI command refreshes them first.
STORE="${SHOPIFY_STORE:-hwicxd-qf.myshopify.com}"
CONF="$HOME/Library/Preferences/shopify-cli-kit-nodejs/config.json"

token() {
  python3 - "$STORE" "$CONF" <<'PY'
import json, sys, datetime
store, conf = sys.argv[1], sys.argv[2]
d = json.load(open(conf))
s = json.loads(d['sessionStore'])
acct = list(list(s.values())[0].values())[0]
for k, v in acct['applications'].items():
    if k.startswith(store):
        exp = datetime.datetime.fromisoformat(v['expiresAt'].replace('Z', '+00:00'))
        if exp < datetime.datetime.now(datetime.timezone.utc):
            sys.exit(3)  # expired -> caller refreshes
        print(v['accessToken'])
        sys.exit(0)
sys.exit(1)
PY
}

token && exit 0
if [ $? -eq 3 ]; then
  npx @shopify/cli theme list --store "$STORE" --json >/dev/null 2>&1
  token && exit 0
fi
echo "no session for $STORE; run: shopify auth login" >&2
exit 1
