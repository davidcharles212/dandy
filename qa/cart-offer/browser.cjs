const {execFileSync}=require('node:child_process');
const {writeFileSync}=require('node:fs');
const assert=require('node:assert/strict');
const session=process.env.CART_QA_SESSION||'dandy-cart-fix';
const b=(...args)=>{const r=JSON.parse(execFileSync('agent-browser',['--session',session,...args,'--json'],{encoding:'utf8',maxBuffer:4e6}));if(!r.success)throw new Error(JSON.stringify(r));return r.data;};
const e=code=>b('eval',code).result;
const click=selector=>{e(`(async()=>{const el=document.querySelector(${JSON.stringify(selector)});el.scrollIntoView({block:'center',behavior:'instant'});for(let i=0;i<60;i++){await new Promise(r=>requestAnimationFrame(r));const rect=el.getBoundingClientRect();if(el.contains(document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2)))return true;}throw new Error('Control remains covered');})()`);return b('click',selector);};
const base=process.env.CART_QA_URL||'https://foreverdandy.com/products/mixed-berry-kratom-gummies?preview_theme_id=158473978034&pb=0';
const results=[];
const clear=()=>e(`(async()=>{const c=await fetch('/cart.js').then(r=>r.json());if(c.items.some(i=>![47958359965874,48043999068338,48043999035570].includes(i.id)))throw new Error('Unexpected cart content');const r=await fetch('/cart/clear.js',{method:'POST'});if(!r.ok)throw new Error('Cleanup failed');return (await r.json()).item_count;})()`);
const ready=()=>e(`(async()=>{for(let i=0;i<100;i++){const r=document.querySelector('dandy-gummy-offer');if(window.DandyGummyCart&&r&&!r.pending&&!document.querySelector('[data-d2-cart] button[name="checkout"]')?.disabled)return true;await new Promise(r=>setTimeout(r,100));}throw new Error('Cart did not settle');})()`);
const state=()=>e(`(async()=>{const c=await fetch('/cart.js').then(r=>r.json());return {total:c.total_price,items:c.items.map(i=>({id:i.id,quantity:i.quantity})),drawer:document.querySelector('[data-d2-cart]')?.innerText,error:document.querySelector('[data-d2-cart-error]')?.hidden===false,overflow:document.documentElement.scrollWidth>innerWidth,theme:window.Shopify.theme.id};})()`);
const close=()=>e(`document.querySelector('button[data-d2-cart-close]')?.click()`);
const bundle=()=>{const s=state();assert.deepEqual(s.items,[{id:48043999068338,quantity:1}]);assert.equal(s.total,11998);return s;};
for(const width of [390,1440]){
 b('set','viewport',String(width),'900');b('open',base);
 e(`document.querySelector('[data-d2-age-yes]')?.click()`);
 ready();clear();close();click('[data-go-tier][value="1"]');click('[data-go-cta]');ready();click('[data-d2-inc]');ready();
 const s=bundle();assert.equal(s.error,false);assert.equal(s.overflow,false);assert.match(s.drawer,/free pouch is included/i);
 console.log('Passed cart increment at '+width); results.push({case:'single plus increment',width,...s});b('screenshot',process.cwd()+`/qa/cart-offer/cart-${width}.png`);
 click('[data-d2-dec]');ready();assert.deepEqual(state().items,[]);close();
 click('[data-go-cta]');ready();close();click('[data-go-cta]');ready();bundle();results.push({case:'two separate additions',width,pass:true});clear();close();
 click('[data-go-tier][value="2"]');click('[data-go-cta]');ready();const two=state();assert.equal(two.total,9998);assert.deepEqual(two.items,[{id:48043999035570,quantity:1}]);results.push({case:'discounted two-pack preserved',width,pass:true});clear();close();
 click('[data-go-tier][value="3"]');click('[data-go-cta]');ready();bundle();results.push({case:'direct three-pack preserved',width,pass:true});clear();close();
}
e(`fetch('/cart/add.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{id:47958359965874,quantity:2}]})}).then(r=>{if(!r.ok)throw new Error('Fixture failed');return true})`);
b('open','https://foreverdandy.com/cart');
b('wait','--text','30-count / 3-pack');
bundle();results.push({case:'old full cart repaired',pass:true});
click('.cartsum button[name=checkout]');b('wait','--url','**/checkouts/**');b('wait','--text','119.98');const checkout=e('document.body.innerText');assert.match(checkout,/3-pack|Quantity[^]*3/);results.push({case:'native checkout shows three-pouch offer',pass:true,text:checkout});

writeFileSync(process.cwd()+'/qa/cart-offer/'+(process.env.CART_QA_OUTPUT||'preview-browser.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results.map(({case:name,width,pass,total,items,theme})=>({case:name,width,pass:pass??true,total,items,theme})),null,2));
