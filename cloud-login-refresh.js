(function(){
'use strict';
const cfg=window.RBM_CLOUD_CONFIG||{};
if(!window.supabase||!cfg.supabaseUrl||!cfg.supabaseAnonKey)return;
const TX='rbm_tx',CF='rbm_cf',ST='rbm_store',FLAG='rbm_cloud_refresh_done';
const sb=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
function stable(v){try{return JSON.stringify(v)}catch(e){return''}}
function normalizeTx(rows){return (rows||[]).map(x=>({id:isNaN(Number(x.id))?x.id:Number(x.id),date:x.date,customer:x.customer,name:x.name,notes:x.notes,qty:Number(x.qty),unit:x.unit,price:Number(x.price),cost:Number(x.cost)}))}
function normalizeCf(rows){return (rows||[]).map(x=>({id:isNaN(Number(x.id))?x.id:Number(x.id),date:x.date,type:x.type,amount:Number(x.amount),notes:x.notes}))}
async function refreshFromCloud(session,forceReload){
 if(!session?.user)return;
 const uid=session.user.id;
 try{
  const [t,c,p]=await Promise.all([
   sb.from('transactions').select('*').eq('user_id',uid).order('date',{ascending:false}),
   sb.from('cash_flows').select('*').eq('user_id',uid).order('date',{ascending:false}),
   sb.from('store_profiles').select('*').eq('user_id',uid).maybeSingle()
  ]);
  if(t.error||c.error||p.error)return;
  const tx=normalizeTx(t.data),cf=normalizeCf(c.data);
  const oldTx=localStorage.getItem(TX)||'[]',oldCf=localStorage.getItem(CF)||'[]';
  let changed=stable(JSON.parse(oldTx||'[]'))!==stable(tx)||stable(JSON.parse(oldCf||'[]'))!==stable(cf);
  localStorage.setItem(TX,JSON.stringify(tx));
  localStorage.setItem(CF,JSON.stringify(cf));
  if(p.data){
   const st={name:p.data.store_name||'Rezeki Berkah Motor',phone:p.data.phone||'',address:p.data.address||''};
   const old=localStorage.getItem(ST)||'{}';
   changed=changed||stable(JSON.parse(old||'{}'))!==stable(st);
   localStorage.setItem(ST,JSON.stringify(st));
  }
  const marker=uid+':'+tx.length+':'+cf.length+':'+(tx[0]?.id||'0');
  if((changed||forceReload)&&sessionStorage.getItem(FLAG)!==marker){
   sessionStorage.setItem(FLAG,marker);
   setTimeout(()=>location.reload(),250);
  }
 }catch(e){console.error('RBM cloud refresh:',e)}
}
async function init(){
 const {data}=await sb.auth.getSession();
 if(data.session)refreshFromCloud(data.session,false);
 sb.auth.onAuthStateChange((ev,s)=>{
  if((ev==='SIGNED_IN'||ev==='INITIAL_SESSION'||ev==='TOKEN_REFRESHED')&&s)refreshFromCloud(s,ev==='SIGNED_IN');
  if(ev==='SIGNED_OUT')sessionStorage.removeItem(FLAG);
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,250));else setTimeout(init,250);
})();