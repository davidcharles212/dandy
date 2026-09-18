// Regression: Checkout must still work after the shopper presses Back from checkout.
// Chrome restores the product page from the back-forward cache with JS state intact;
// the checkout guard in assets/dandy-gummy-cart.js must release itself on pageshow.
// Usage: CART_QA_URL=<pdp url> node qa/cart-offer/checkout-back.cjs
// Set CART_QA_ROUTE_SCRIPT=<path> to serve a local copy of dandy-gummy-cart.js in place of the
// theme's, so a fix can be checked against the live store before it is pushed.
const {execFileSync}=require('node:child_process');
const {readFileSync}=require('node:fs');
const assert=require('node:assert/strict');
const session=process.env.CART_QA_SESSION||'dandy-checkout-back-'+process.pid;
const b=(...args)=>{const r=JSON.parse(execFileSync('agent-browser',['--session',session,...args,'--json'],{encoding:'utf8',maxBuffer:4e6}));if(!r.success)throw new Error(JSON.stringify(r));return r.data;};
const e=code=>b('eval',code).result;
const url=()=>{const d=b('get','url');return typeof d==='string'?d:(d.url||d.result||d.value||JSON.stringify(d));};
const base=process.env.CART_QA_URL||'https://foreverdandy.com/products/mixed-berry-kratom-gummies';
const SINGLE=47958359965874;
const CHECKOUT_BTN='[data-d2-cart] form.dcart__checkout button[name="checkout"]';
const add=()=>e(`fetch('/cart/add.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{id:${SINGLE},quantity:1}]})}).then(r=>r.status)`);
// The drawer slides in; wait until the panel has stopped moving and the button is inside the viewport,
// otherwise a click lands on the scrim (or the page root) instead of the button.
const ready=()=>e(`(async()=>{for(let i=0;i<150;i++){const btn=document.querySelector(${JSON.stringify(CHECKOUT_BTN)});const panel=document.querySelector('[data-dcart-panel]');const t=panel?getComputedStyle(panel).transform:'';const r=btn?btn.getBoundingClientRect():null;if(window.DandyGummyCart&&btn&&!btn.disabled&&document.querySelector('[data-d2-cart]').classList.contains('is-open')&&(t==='none'||t==='matrix(1, 0, 0, 1, 0, 0)')&&r.right<=innerWidth&&r.bottom<=innerHeight&&r.width>0)return true;await new Promise(r=>setTimeout(r,100));}throw new Error('Cart drawer did not settle');})()`)&&b('wait','300');
const clear=()=>e(`fetch('/cart/clear.js',{method:'POST'}).then(r=>r.status)`);
const waitCheckout=()=>{let current='';for(let i=0;i<30;i++){b('wait','500');current=url();if(/\/checkouts\//.test(current))break;}return current;};

try {
  b('set','viewport','1440','900');
  if(process.env.CART_QA_ROUTE_SCRIPT){
    b('open');
    b('network','route','**/assets/dandy-gummy-cart.js*','--body',readFileSync(process.env.CART_QA_ROUTE_SCRIPT,'utf8'));
  }
  b('open',base);
  b('wait','1500');
  e(`document.querySelector('[data-d2-age-yes]')?.click(); true`);
  e(`(async()=>{for(let i=0;i<50;i++){if(window.DandyGummyCart)return true;await new Promise(r=>setTimeout(r,100));}throw new Error('dandy-gummy-cart.js did not load');})()`);
  clear();
  assert.equal(add(),200);
  ready();
  e(`window.__dandyBfcacheMarker=true; true`);
  b('click',CHECKOUT_BTN);
  const first=waitCheckout();
  if(!/\/checkouts\//.test(first))console.error('diag',JSON.stringify(e(`(async()=>({disabled:document.querySelector(${JSON.stringify(CHECKOUT_BTN)})?.disabled,err:document.querySelector('[data-cart-offer-error]')?.textContent||null,open:document.querySelector('[data-d2-cart]')?.classList.contains('is-open'),gummy:!!window.DandyGummyCart,count:(await fetch('/cart.js').then(r=>r.json())).item_count}))()`)),JSON.stringify(b('network','requests','--filter','gummy-cart')));
  assert.match(first,/\/checkouts\//,'first Checkout click must reach checkout: '+first);

  b('back');
  b('wait','2500');
  const restored=e(`({marker:!!window.__dandyBfcacheMarker,url:location.href})`);
  if(!restored.marker){
    console.log(JSON.stringify({case:'checkout after back',result:'inconclusive',reason:'page was reloaded, not restored from the back-forward cache',url:restored.url}));
    process.exit(0);
  }
  // Change the cart the way the shopper did: remove, then add again.
  clear();
  b('wait','1500');
  assert.equal(add(),200);
  ready();
  b('click',CHECKOUT_BTN);
  const second=waitCheckout();
  assert.match(second,/\/checkouts\//,'Checkout click after Back must reach checkout again, got '+second);
  console.log(JSON.stringify({case:'checkout after back',result:'pass',bfcacheRestored:true,first,second}));
} finally {
  try{b('open',base);clear();}catch{}
  try{b('close');}catch{}
}
