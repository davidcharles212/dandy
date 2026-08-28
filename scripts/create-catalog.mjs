#!/usr/bin/env node
/**
 * Creates the eight confirmed Dandy SKUs (handoff §4) via the Shopify Admin GraphQL API.
 *
 *   SHOPIFY_STORE=hwicxd-qf.myshopify.com \
 *   SHOPIFY_ADMIN_TOKEN=shpat_xxx \
 *   node scripts/create-catalog.mjs --dry-run
 *
 * Token needs: write_products, write_inventory.
 * Get one in Admin → Settings → Apps and sales channels → Develop apps → Create app.
 *
 * Run --dry-run first: it prints exactly what it would create and changes nothing.
 * NOTE: subscriptions are NOT created here. Selling plans must be owned by a
 * subscriptions app (Shopify Subscriptions / Recharge). See the end of this file.
 */
const STORE = process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const DRY = process.argv.includes('--dry-run');
const API = '2024-10';

if (!STORE || !TOKEN) {
  console.error('Set SHOPIFY_STORE and SHOPIFY_ADMIN_TOKEN. See header of this file.');
  process.exit(1);
}

// Prices, titles and counts are the approved launch figures (handoff §4).
const PRODUCTS = [
  { title: 'Mixed Berry Kratom Gummies', handle: 'mixed-berry-kratom-gummies',
    type: 'Gummies', tags: ['gummies', '35mg'],
    descriptionHtml: '<p>Kratom gummies portioned to an exact 35 mg of mitragynine each. Lab-tested every batch.</p>',
    options: ['Count', 'Pack'],
    // Pack ladder per handoff: 3-pack = pay for 2, 5-pack = pay for 3.
    // compareAtPrice is the honest anchor (qty x unit), never an invented number.
    variants: [
      { opts: ['10-count', 'Single'],  price: '24.99',  sku: 'OLL-GUM-MB-35MG-10CT' },
      { opts: ['30-count', 'Single'],  price: '59.99',  sku: 'OLL-GUM-MB-35MG-30CT' },
      { opts: ['30-count', '3-pack'],  price: '119.98', compareAt: '179.97', sku: 'OLL-GUM-MB-35MG-30CT-3PK' },
      { opts: ['30-count', '5-pack'],  price: '179.97', compareAt: '299.95', sku: 'OLL-GUM-MB-35MG-30CT-5PK' },
    ] },
  { title: 'Premium Kratom Leaf Powder', handle: 'premium-kratom-leaf-powder',
    type: 'Powder', tags: ['powder', 'loose-leaf'], template: 'dandy2-powder',
    descriptionHtml: '<p>Milled Mitragyna speciosa leaf. One ingredient, screened per batch. Serving size 1 teaspoon (2.5 g), 30 mg mitragynine per serving.</p>',
    options: ['Size', 'Pack'],
    variants: [
      // Supplier item# for the 250 g size is "...-200G" (their sheet nets it at 250 g).
      { opts: ['100 g', 'Single'], price: '34.99',  sku: 'OLL-LEAF-KLP-30MG-100G' },
      { opts: ['100 g', '3-pack'], price: '69.98',  compareAt: '104.97', sku: 'OLL-LEAF-KLP-30MG-100G-3PK' },
      { opts: ['100 g', '5-pack'], price: '104.97', compareAt: '174.95', sku: 'OLL-LEAF-KLP-30MG-100G-5PK' },
      { opts: ['250 g', 'Single'], price: '54.99',  sku: 'OLL-LEAF-KLP-30MG-200G' },
      { opts: ['250 g', '3-pack'], price: '109.98', compareAt: '164.97', sku: 'OLL-LEAF-KLP-30MG-200G-3PK' },
      { opts: ['250 g', '5-pack'], price: '164.97', compareAt: '274.95', sku: 'OLL-LEAF-KLP-30MG-200G-5PK' },
    ] },
  { title: 'Extract Capsules · 50 mg', handle: 'extract-capsules-50mg',
    type: 'Capsules', tags: ['capsules', '50mg'], template: 'dandy2-capsules',
    descriptionHtml: '<p>Kratom extract capsules, 50 mg. Nothing to taste or measure. Lab-tested every batch.</p>',
    options: ['Count', 'Pack'],
    variants: [
      { opts: ['10-count', 'Single'], price: '28.99',  sku: 'OLL-CAP-EXC-50MG-R-10CT' },
      { opts: ['10-count', '3-pack'], price: '57.98',  compareAt: '86.97',  sku: 'OLL-CAP-EXC-50MG-R-10CT-3PK' },
      { opts: ['10-count', '5-pack'], price: '86.97',  compareAt: '144.95', sku: 'OLL-CAP-EXC-50MG-R-10CT-5PK' },
      { opts: ['30-count', 'Single'], price: '64.99',  sku: 'OLL-CAP-EXC-50MG-R-30CT' },
      { opts: ['30-count', '3-pack'], price: '129.98', compareAt: '194.97', sku: 'OLL-CAP-EXC-50MG-R-30CT-3PK' },
      { opts: ['30-count', '5-pack'], price: '194.97', compareAt: '324.95', sku: 'OLL-CAP-EXC-50MG-R-30CT-5PK' },
    ] },
  { title: 'Extract Capsules · 90 mg', handle: 'extract-capsules-90mg',
    type: 'Capsules', tags: ['capsules', '90mg'], template: 'dandy2-capsules',
    descriptionHtml: '<p>Kratom extract capsules, 90 mg. For an established tolerance. Lab-tested every batch.</p>',
    options: ['Count', 'Pack'],
    variants: [
      { opts: ['10-count', 'Single'], price: '44.99',  sku: 'OLL-CAP-EXC-90MG-E-10CT' },
      { opts: ['10-count', '3-pack'], price: '89.98',  compareAt: '134.97', sku: 'OLL-CAP-EXC-90MG-E-10CT-3PK' },
      { opts: ['10-count', '5-pack'], price: '134.97', compareAt: '224.95', sku: 'OLL-CAP-EXC-90MG-E-10CT-5PK' },
      { opts: ['30-count', 'Single'], price: '99.99',  sku: 'OLL-CAP-EXC-90MG-E-30CT' },
      { opts: ['30-count', '3-pack'], price: '199.98', compareAt: '299.97', sku: 'OLL-CAP-EXC-90MG-E-30CT-3PK' },
      { opts: ['30-count', '5-pack'], price: '299.97', compareAt: '499.95', sku: 'OLL-CAP-EXC-90MG-E-30CT-5PK' },
    ] },
];

// CLI-session tokens (atkn_*) authenticate with Bearer; custom-app tokens (shpat_*)
// with the X-Shopify-Access-Token header.
const AUTH = TOKEN.startsWith('atkn_')
  ? { Authorization: `Bearer ${TOKEN}` }
  : { 'X-Shopify-Access-Token': TOKEN };

const gql = async (query, variables) => {
  const r = await fetch(`https://${STORE}/admin/api/${API}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...AUTH },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors));
  return j.data;
};

const CREATE = `mutation p($input: ProductInput!) {
  productCreate(input: $input) { product { id handle title } userErrors { field message } } }`;

const UPDATE = `mutation p($input: ProductInput!) {
  productUpdate(input: $input) { product { id handle } userErrors { field message } } }`;

const OPTIONS = `mutation o($productId: ID!, $options: [OptionCreateInput!]!) {
  productOptionsCreate(productId: $productId, options: $options, variantStrategy: LEAVE_AS_IS) {
    userErrors { field message } } }`;

const BULK = `mutation v($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
  productVariantsBulkCreate(productId: $productId, variants: $variants, strategy: REMOVE_STANDALONE_VARIANT) {
    productVariants { id title sku price } userErrors { field message } } }`;

const FIND = `query f($q: String!) {
  products(first: 1, query: $q) { nodes { id handle
    options { name } variants(first: 40) { nodes { id title price } } } } }`;

for (const p of PRODUCTS) {
  const label = `${p.title} (${p.variants.length} variants incl. packs)`;
  if (DRY) {
    console.log('would create:', label);
    for (const v of p.variants) console.log(`    ${v.opts.join(' / ')}  $${v.price}${v.compareAt ? ` (was $${v.compareAt})` : ''}  ${v.sku}`);
    continue;
  }

  // Upsert: if the handle already exists (e.g. the hand-made placeholder gummy,
  // which is already published to the Online Store), build onto that record so
  // its URL and publish state survive. Otherwise create fresh.
  const found = (await gql(FIND, { q: `handle:${p.handle}` })).products.nodes[0];
  let id;
  if (found) {
    if (found.variants.nodes.length > 1) { console.log(`skip (already has variants): ${p.handle}`); continue; }
    id = found.id;
    const upd = await gql(UPDATE, { input: {
      id, productType: p.type, vendor: 'Dandy', tags: p.tags,
      descriptionHtml: p.descriptionHtml, templateSuffix: p.template || null,
    }});
    if (upd.productUpdate.userErrors.length) { console.error('!', p.title, upd.productUpdate.userErrors); continue; }
    const have = found.options.map(o => o.name);
    const need = p.options.filter(n => !have.includes(n));
    if (need.length) {
      const oc = await gql(OPTIONS, { productId: id, options: need.map(name => ({
        name, values: [...new Set(p.variants.map(v => v.opts[p.options.indexOf(name)]))].map(n => ({ name: n })),
      }))});
      if (oc.productOptionsCreate.userErrors.length) { console.error('!', p.title, oc.productOptionsCreate.userErrors); continue; }
    }
  } else {
    const created = await gql(CREATE, { input: {
      title: p.title, handle: p.handle, productType: p.type, vendor: 'Dandy',
      tags: p.tags, descriptionHtml: p.descriptionHtml, status: 'ACTIVE',
      templateSuffix: p.template || null,
      productOptions: p.options.map((name, i) => ({
        name, values: [...new Set(p.variants.map(v => v.opts[i]))].map(n => ({ name: n })),
      })),
    }});
    const errs = created.productCreate.userErrors;
    if (errs.length) { console.error('!', p.title, errs); continue; }
    id = created.productCreate.product.id;
  }

  const bulk = await gql(BULK, { productId: id, variants: p.variants.map(v => ({
    optionValues: v.opts.map((name, i) => ({ optionName: p.options[i], name })),
    price: v.price, compareAtPrice: v.compareAt || null,
    inventoryItem: { sku: v.sku, tracked: false },
  }))});
  const verrs = bulk.productVariantsBulkCreate.userErrors;
  console.log(verrs.length ? `! ${p.title} variants: ${JSON.stringify(verrs)}` : `${found ? 'upgraded' : 'created'}: ${label}`);

  // Online Store publish state: CLI-session tokens can't touch the publications
  // APIs, so report it and leave any unpublished product for a one-click publish
  // in Admin (Product > Sales channels).
  const pubQ = await gql(`query s($id: ID!) { product(id: $id) { publishedAt status } }`, { id });
  console.log(`    status: ${pubQ.product.status}, online store publishedAt: ${pubQ.product.publishedAt || 'NOT PUBLISHED (publish in Admin > Sales channels)'}`);
}

console.log(`
Created as DRAFT and with inventory tracking OFF so nothing can oversell.
Next, by hand in Admin:
  1. Review each product, add media, set SEO, then set status Active.
  2. Install a subscriptions app and attach a selling plan to the 30-count gummy:
     $47.99 every 30 days (20% off $59.99), free shipping. Selling plans cannot be
     created by this script — they must be owned by the subscriptions app.
  3. Shipping (Settings > Shipping, General profile), two price-based rates:
       under $119.98 -> $5.95 Standard; $119.98 and up -> Free.
     That makes every 3-pack and 5-pack ship free automatically. The $47.99
     subscription ships free via the subscriptions app's shipping settings
     (Recharge supports this directly).
  4. Block the 16 restricted states at checkout (AL AR CA CT IN KS LA MS NE ND RI TN UT VT WV WI).
  5. Create discount code DANDY10 (10% off, first order, one use per customer).
Then in the theme, swap the fixture prices for real product objects.
`);
