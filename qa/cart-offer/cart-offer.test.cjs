const {test} = require('node:test');
const assert = require('node:assert/strict');
const {plan, createService} = require('../../assets/dandy-gummy-cart.js');
const SINGLE=47958359965874, BUNDLE=48043999068338;
const product={variants:[{id:SINGLE,price:5999,available:true},{id:BUNDLE,price:11998,available:true}]};
const item=(id,quantity,extra={})=>({id,key:id+':key',quantity,final_price:id===SINGLE?5999:11998,properties:{},...extra});
const cart=items=>({items,currency:'USD',total_price:items.reduce((n,i)=>n+i.quantity*i.final_price,0)});

test('DY1046: two paid singles become three pouches for the same $119.98',()=>{
 const c=cart([item(SINGLE,2)]),p=plan(c,product);
 assert.equal(c.total_price,11998);
 assert.deepEqual(p,{updates:{[SINGLE+':key']:0,[BUNDLE]:1},pairs:1});
});
test('one single and the deliberately discounted two-pack are unchanged',()=>{
 assert.equal(plan(cart([item(SINGLE,1)]),product),null);
 assert.equal(plan(cart([item(48043999035570,1,{final_price:9998})]),product),null);
});
test('subscription, discounted singles, customized lines, and bundle components are excluded',()=>{
 for(const extra of [{selling_plan_allocation:{selling_plan:{id:1}}},{final_price:4799},{properties:{gift:'yes'}},{parent_relationship:{parent_key:'bundle'}},{item_components:[{}]}]) {
  assert.equal(plan(cart([item(SINGLE,2,extra)]),product),null);
 }
});
test('unrelated products and existing bundles are preserved',()=>{
 const p=plan(cart([item(123,2),item(SINGLE,2),item(BUNDLE,2)]),product);
 assert.deepEqual(p.updates,{[SINGLE+':key']:0,[BUNDLE+':key']:3});
});
test('every two paid singles earns one free pouch and odd leftovers remain',()=>{
 assert.deepEqual(plan(cart([item(SINGLE,5)]),product),{updates:{[SINGLE+':key']:1,[BUNDLE]:2},pairs:2});
});
test('sold-out or changed-price bundle blocks conversion without removing singles',()=>{
 for(const variant of [{id:BUNDLE,price:11998,available:false},{id:BUNDLE,price:13998,available:true}]) {
  assert.throws(()=>plan(cart([item(SINGLE,2)]),{variants:[product.variants[0],variant]}),/unavailable/);
 }
});
test('ambiguous existing bundle lines are never silently overwritten',()=>{
 assert.throws(()=>plan(cart([item(SINGLE,2),item(BUNDLE,1,{properties:{gift:'yes'}})]),product),/reviewed/);
});
function fixture({failUpdate=false,wrongTotal=false}={}) {
 let c=cart([item(SINGLE,2)]);const calls=[];
 const fetcher=async(url,options={})=>{
  calls.push([url,options.body?JSON.parse(options.body):null]);
  if(url.endsWith('products/mixed-berry-kratom-gummies.js'))return {ok:true,json:async()=>product};
  if(url.endsWith('cart/update.js')){
   if(failUpdate)return {ok:false,status:422};
   c=cart([item(BUNDLE,1)]);if(wrongTotal)c.total_price=17997;
  }
  return {ok:true,json:async()=>structuredClone(c)};
 };
 return {service:createService(fetcher),calls,current:()=>c};
}
test('conversion uses one atomic update and verifies the result; repeat calls are idempotent',async()=>{
 const f=fixture();const result=await f.service.ensure();
 assert.equal(result.changed,true);assert.equal(result.cart.total_price,11998);
 assert.equal((await f.service.ensure()).changed,false);
 assert.equal(f.calls.filter(([url])=>url.endsWith('cart/update.js')).length,1);
});
test('concurrent cart loads cannot double-award the free pouch',async()=>{
 const f=fixture();await Promise.all([f.service.ensure(),f.service.ensure(),f.service.ensure()]);
 assert.equal(f.current().items[0].quantity,1);
 assert.equal(f.calls.filter(([url])=>url.endsWith('cart/update.js')).length,1);
});
test('failed updates reject and preserve the paid singles',async()=>{
 const f=fixture({failUpdate:true});await assert.rejects(f.service.ensure(),/422/);
 assert.equal(f.current().items[0].id,SINGLE);assert.equal(f.current().items[0].quantity,2);
});
test('unexpected higher total rejects rather than proceeding to checkout',async()=>{
 const f=fixture({wrongTotal:true});await assert.rejects(f.service.ensure(),/verified/);
});
