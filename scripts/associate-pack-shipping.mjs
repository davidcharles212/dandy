#!/usr/bin/env node
/**
 * Moves every 3-pack and 5-pack variant into the "Multi-pack free shipping"
 * delivery profile (gid://shopify/DeliveryProfile/109662798002), so packs ship
 * free while singles stay on the $5.95 Standard rate in the General profile.
 *
 * RUN ORDER MATTERS: the profile must already have a $0 rate (added once in
 * Admin > Settings > Shipping > "Multi-pack free shipping" > Add rate, $0
 * "Free shipping" for the US). Variants in a profile with no rates cannot
 * check out at all. This script refuses to run until a rate exists.
 *
 *   SHOPIFY_ADMIN_TOKEN=$(scripts/admin-token.sh) node scripts/associate-pack-shipping.mjs
 */
const STORE = process.env.SHOPIFY_STORE || 'hwicxd-qf.myshopify.com';
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const PROFILE = 'gid://shopify/DeliveryProfile/109662798002';
if (!TOKEN) { console.error('Set SHOPIFY_ADMIN_TOKEN (scripts/admin-token.sh prints one).'); process.exit(1); }

const AUTH = TOKEN.startsWith('atkn_') ? { Authorization: `Bearer ${TOKEN}` } : { 'X-Shopify-Access-Token': TOKEN };
const gql = async (query, variables) => {
  const r = await fetch(`https://${STORE}/admin/api/2025-10/graphql.json`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...AUTH },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors));
  return j.data;
};

// guard: the profile must have at least one active rate
const prof = await gql(`query p($id: ID!) { deliveryProfile(id: $id) { name
  profileLocationGroups { locationGroupZones(first: 5) { nodes {
    methodDefinitions(first: 5) { nodes { id active } } } } } } }`, { id: PROFILE });
const rates = (prof.deliveryProfile?.profileLocationGroups || [])
  .flatMap(g => g.locationGroupZones.nodes)
  .flatMap(z => z.methodDefinitions.nodes)
  .filter(m => m.active);
if (!rates.length) {
  console.error(`REFUSING: "${prof.deliveryProfile?.name}" has no active rate yet.\n` +
    'Add the $0 "Free shipping" rate in Admin > Settings > Shipping first, then re-run.');
  process.exit(1);
}
console.log(`profile has ${rates.length} active rate(s), associating pack variants...`);

const prods = await gql(`{ products(first: 20) { nodes { handle variants(first: 40) { nodes { id title } } } } }`);
const packs = prods.products.nodes.flatMap(p =>
  p.variants.nodes.filter(v => v.title.toLowerCase().includes('pack')).map(v => ({ ...v, handle: p.handle })));
console.log(`${packs.length} pack variants found`);

const res = await gql(`mutation u($id: ID!, $profile: DeliveryProfileInput!) {
  deliveryProfileUpdate(id: $id, profile: $profile) { profile { id } userErrors { field message } } }`,
  { id: PROFILE, profile: { variantsToAssociate: packs.map(v => v.id) } });
const errs = res.deliveryProfileUpdate.userErrors;
if (errs.length) { console.error('errors:', errs); process.exit(1); }
for (const v of packs) console.log(`  moved: ${v.handle} — ${v.title}`);
console.log('Done. Packs now ship free; singles stay on $5.95 Standard.');
