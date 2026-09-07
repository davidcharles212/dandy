#!/usr/bin/env node
// Dandy-only repair. Dry run by default; --apply attaches existing pack variants
// to real pouch inventory without changing prices, stock counts, or oversell policy.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const store = 'hwicxd-qf.myshopify.com';
const token = process.env.SHOPIFY_ADMIN_TOKEN || execFileSync('bash', [fileURLToPath(new URL('./admin-token.sh', import.meta.url))], { env: { ...process.env, SHOPIFY_STORE: store }, encoding: 'utf8' }).trim();
const auth = token.startsWith('atkn_') ? { Authorization: `Bearer ${token}` } : { 'X-Shopify-Access-Token': token };
async function gql(query, variables) {
  const r = await fetch(`https://${store}/admin/api/2026-07/graphql.json`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...auth }, body: JSON.stringify({ query, variables }) });
  if (!r.ok) throw new Error(`Shopify HTTP ${r.status}`);
  const j = await r.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors));
  return j.data;
}
const productId = 'gid://shopify/Product/8948156301490';
const singleId = 'gid://shopify/ProductVariant/47958359965874';
const packs = [
  { id: 'gid://shopify/ProductVariant/47958359998642', quantity: 3, price: '119.98' },
  { id: 'gid://shopify/ProductVariant/47958360031410', quantity: 5, price: '179.97' },
];
const query = `query($id: ID!) { shop { myshopifyDomain } product(id:$id) { handle variants(first:10) { nodes { id title price inventoryQuantity inventoryPolicy requiresComponents inventoryItem { tracked } productVariantComponents(first:10) { nodes { quantity productVariant { id } } } } } } }`;
const before = await gql(query, { id: productId });
if (before.shop.myshopifyDomain !== store || before.product?.handle !== 'mixed-berry-kratom-gummies') throw new Error('Store/product mismatch');
const variants = before.product.variants.nodes;
const single = variants.find(v => v.id === singleId);
if (!single || single.title !== '30-count / Single' || !single.inventoryItem.tracked || single.inventoryPolicy !== 'DENY' || single.requiresComponents) throw new Error('Unexpected component inventory configuration');
const input = [];
for (const pack of packs) {
  const v = variants.find(v => v.id === pack.id);
  if (!v || v.title !== `30-count / ${pack.quantity}-pack` || v.price !== pack.price || v.inventoryPolicy !== 'DENY') throw new Error('Unexpected pack configuration');
  const components = v.productVariantComponents.nodes;
  if (components.length === 1 && components[0].productVariant.id === singleId && components[0].quantity === pack.quantity) continue;
  if (components.length || v.requiresComponents || v.inventoryQuantity !== 0) throw new Error('Refusing to replace existing stock or component configuration');
  input.push({ parentProductVariantId: v.id, priceInput: { calculation: 'FIXED', price: pack.price }, productVariantRelationshipsToCreate: [{ id: singleId, quantity: pack.quantity }] });
}
console.log(JSON.stringify({ componentStock: single.inventoryQuantity, repair: input }, null, 2));
if (!process.argv.includes('--apply')) { console.log('Dry run only. Use --apply after review.'); process.exit(0); }
if (input.length) {
  const result = await gql(`mutation($input:[ProductVariantRelationshipUpdateInput!]!) { productVariantRelationshipBulkUpdate(input:$input) { parentProductVariants { id requiresComponents } userErrors { code field message } } }`, { input });
  if (result.productVariantRelationshipBulkUpdate.userErrors.length) throw new Error(JSON.stringify(result.productVariantRelationshipBulkUpdate.userErrors));
  console.log(JSON.stringify(result, null, 2));
}
console.log(JSON.stringify(await gql(query, {id:productId}), null, 2));
