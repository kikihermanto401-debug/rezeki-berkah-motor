(function(){
'use strict';
const TX='rbm_tx',CF='rbm_cf';
const cfg=window.RBM_CLOUD_CONFIG||{};
let sb=null,session=null,ready=false,timer=null;
const prevSetItem=localStorage.setItem.bind(localStorage);
function parse(key){try{return JSON.parse(localStorage.getItem(key)||'[]')}catch(e){return[]}}
function keyOf(v){return String(v||'').trim().toLowerCase().replace(/\s+/g,' ')}
function productRows(tx,uid){
 const m=new Map();
 tx.forEach(x=>{const k=keyOf(x.name);if(!k)return;const d=new Date(x.date||0);const q=Number(x.qty||0),p=Number(x.price||0),c=Number(x.cost||0);let r=m.get(k)||{user_id:uid,product_key:k,name:x.name||'',unit:x.unit||'pcs',last_price:p,last_cost:c,total_qty:0,total_revenue:0,last_sale:x.date||null,updated_at:new Date().toISOString()};r.total_qty+=q;r.total_revenue+=q*p;if(!r.last_sale||d>new Date(r.last_sale)){r.name=x.name||r.name;r.unit=x.unit||r.unit;r.last_price=p;r.last_cost=c;r.last_sale=x.date||r.last_sale}m.set(k,r)});
 return [...m.values()]
}
function customerRows(tx,uid){
 const m=new Map();
 tx.forEach(x=>{const name=(x.customer||'Umum').trim()||'Umum',k=keyOf(name),d=new Date(x.date||0),total=Number(x.qty||0)*Number(x.price||0);let r=m.get(k)||{user_id:uid,customer_key:k,name,total_transactions:0,total_spent:0,last_purchase:x.date||null,updated_at:new Date().toISOString()};r.total_transactions+=1;r.total_spent+=total;if(!r.last_purchase||d>new Date(r.last_purchase)){r.name=name;r.last_purchase=x.date||r.last_purchase}m.set(k,r)});
 return [...m.values()]
}
async function syncSummaries(){
 if(!ready||!session?.user)return;
 const uid=session.user.id,tx=parse(TX),products=productRows(tx,uid),customers=customerRows(tx,uid);
 try{
  let r=await sb.from('product_summaries').delete().eq('user_id',uid);if(r.error&&r.error.code!=='42P01')throw r.error;
  r=await sb.from('customer_summaries').delete().eq('user_id',uid);if(r.error&&r.error.code!=='42P01')throw r.error;
  if(products.length){r=await sb.from('product_summaries').upsert(products,{onConflict:'user_id,product_key'});if(r.error&&r.error.code!=='42P01')throw r.error}
  if(customers.length){r=await sb.from('customer_summaries').upsert(customers,{onConflict:'user_id,customer_key'});if(r.error&&r.error.code!=='42P01')throw r.error}
 }catch(e){console.warn('RBM catalog sync:',e.message||e)}
}
async function removeCloudRows(table,ids){
 if(!ready||!session?.user||!ids.length)return;
 try{const {error}=await sb.from(table).delete().eq('user_id',session.user.id).in('id',ids.map(String));if(error)throw error}catch(e){console.warn('RBM delete sync:',e.message||e)}
}
function schedule(){clearTimeout(timer);timer=setTimeout(syncSummaries,900)}
function hook(){
 localStorage.setItem=function(k,v){
  let before=[];if(k===TX||k===CF)before=parse(k);
  prevSetItem(k,v);
  if(!ready)return;
  if(k===TX||k===CF){
   let after=[];try{after=JSON.parse(v||'[]')}catch(e){}
   const keep=new Set(after.map(x=>String(x.id))),removed=before.filter(x=>!keep.has(String(x.id))).map(x=>x.id);
   if(removed.length)removeCloudRows(k===TX?'transactions':'cash_flows',removed);
   if(k===TX)schedule();
  }
 }
}
async function init(){
 hook();
 if(!window.supabase||!cfg.supabaseUrl||!cfg.supabaseAnonKey)return;
 sb=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 const {data}=await sb.auth.getSession();session=data.session;ready=!!session;
 if(ready)syncSummaries();
 sb.auth.onAuthStateChange((_e,s)=>{session=s;ready=!!s;if(ready)syncSummaries()});
 setInterval(()=>{if(ready)syncSummaries()},5*60*1000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,250));else setTimeout(init,250);
})();