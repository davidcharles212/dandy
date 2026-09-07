const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../assets/dandy2.js'), 'utf8');
const variants = [
  {id:47958359933106,title:'10-count / Single',available:true,price:2499},
  {id:47958359965874,title:'30-count / Single',available:true,price:5999},
  {id:47958359998642,title:'30-count / 3-pack',available:true,price:11998},
  {id:47958360031410,title:'30-count / 5-pack',available:true,price:17997},
];
function setup(catalog = variants, plan = 'monthly') {
  class Element {
    constructor() { this.dataset={}; this.listeners={}; this.hidden=false; this.value=''; this.disabled=false; this.textContent=''; }
    addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
    dispatchEvent(event) { for(const fn of this.listeners[event.type] || []) fn(event); }
    setAttribute() {}
    querySelector(selector) { return this.nodes?.[selector] || null; }
    querySelectorAll(selector) { return this.lists?.[selector] || []; }
  }
  let Pdp;
  let fetches = 0;
  const errors=[];
  vm.runInNewContext(source, { HTMLElement:Element, customElements:{ get(){}, define(name, klass){Pdp=klass;} }, location:{hash:''}, window:{}, document:{}, console:{error(...args){errors.push(args);}}, FormData:class {}, fetch:async()=>{fetches++;throw new Error('network');} });
  const pdp=new Pdp();
  const form=new Element(), note=new Element(), id=new Element(), qty=new Element(), planField=new Element(), cta=new Element(), recap=new Element(), sticky=new Element();
  form.dataset.plan=plan; form.action='https://foreverdandy.com/cart/add';
  form.submit=()=>assert.fail('must not silently retry with native submit');
  form.nodes={'[data-d2-previewnote]':note,'[data-d2-idfield]':id,'[data-d2-qtyfield]':qty,'[data-d2-planfield]':planField};
  const inputs=['1','3','5','trial'].map(value=>Object.assign(new Element(),{value,checked:value==='3'}));
  pdp.nodes={'[data-d2-buyform]':form,'[data-d2-variantmap]':{textContent:JSON.stringify(catalog)},'[data-d2-cta]':cta,'[data-d2-recap-cta]':recap};
  pdp.lists={'[data-d2-one]':inputs,'[data-d2-cta], [data-d2-submit]':[cta,recap,sticky]};
  pdp.connectedCallback();
  return {pdp,form,note,id,qty,planField,cta,recap,sticky,errors,get fetches(){return fetches;},select(key){pdp.door=key==='sub'?'sub':'one';inputs.forEach(i=>i.checked=i.value===key);pdp.sync();}};
}
test('3 and 5 pouch selections send one correctly priced bundle, never several singles',()=>{
  const s=setup();
  for(const [key,variantId,total] of [['3',47958359998642,'$119.98'],['5',47958360031410,'$179.97']]) {
    s.select(key);assert.equal(s.form.dataset.buyable,'true');assert.equal(s.id.value,variantId);assert.equal(s.qty.value,1);assert.equal(s.planField.disabled,true);assert.equal(s.cta.disabled,false);assert.ok(s.cta.textContent.endsWith(total));assert.equal(s.recap.textContent,s.cta.textContent);assert.equal(s.note.hidden,true);
  }
});
test('existing sold-out bundles show stock status immediately and clear stale purchase IDs',()=>{
  const s=setup(variants.map(v=>({...v,available:!v.title.includes('pack')})));
  s.select('1');assert.equal(s.form.dataset.buyable,'true');
  for(const key of ['3','5']) {s.select(key);assert.equal(s.form.dataset.buyable,'false');assert.equal(s.id.value,'');assert.equal(s.note.hidden,false);assert.match(s.note.textContent,/sold out/);assert.doesNotMatch(s.note.textContent,/SKU|Preview/);assert.ok(s.cta.disabled && s.recap.disabled && s.sticky.disabled);}
  s.select('1');assert.equal(s.cta.disabled,false);assert.equal(s.note.hidden,true);
});
test('missing variants have a different message from out of stock',()=>{
  const s=setup(variants.slice(0,2));s.select('3');assert.match(s.note.textContent,/unavailable/);assert.doesNotMatch(s.note.textContent,/sold out|SKU|Preview/);assert.equal(s.id.value,'');
});
test('single, sampler, and subscription preserve their own payloads across bundle transitions',()=>{
  const s=setup();
  for(const [key,id] of [['1',47958359965874],['trial',47958359933106],['sub',47958359965874],['5',47958360031410]]) {
    s.select(key);assert.equal(s.id.value,id);assert.equal(s.qty.value,1);assert.equal(s.planField.disabled,key!=='sub');assert.equal(s.planField.value,key==='sub'?'monthly':'');assert.equal(s.form.dataset.buyable,'true');
  }
});
test('missing subscription plan cannot silently add a one-time pouch',()=>{
  const s=setup(variants,'');s.select('sub');assert.equal(s.form.dataset.buyable,'false');assert.equal(s.id.value,'');assert.match(s.note.textContent,/Monthly delivery is currently unavailable/);s.select('1');assert.equal(s.form.dataset.buyable,'true');
});
test('a failed add surfaces an error without risking a duplicate native add',async()=>{
  const s=setup();s.form.dispatchEvent({type:'submit',preventDefault(){}});await new Promise(resolve=>setImmediate(resolve));assert.equal(s.fetches,1);assert.equal(s.note.hidden,false);assert.match(s.note.textContent,/couldn’t add/);assert.equal(s.errors.length,1);
});
