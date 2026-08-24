(function(){
'use strict';
const cfg=window.RBM_CLOUD_CONFIG||{};
const TX='rbm_tx',CF='rbm_cf',ST='rbm_store';
const PREFIX='rbm_daily_backup_done_';
let sb=null,session=null,running=false,timer=null;
function parse(k,f){try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v}catch(e){return f}}
function valid(){return !!(window.supabase&&/^https:\/\/.+\.supabase\.co\/?$/.test(String(cfg.supabaseUrl||''))&&String(cfg.supabaseAnonKey||'').length>30)}
function pad(n){return String(n).padStart(2,'0')}
function dateKey(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function targetBusinessDate(){const n=new Date();if(n.getHours()>=20)return dateKey(n);const y=new Date(n);y.setDate(y.getDate()-1);return dateKey(y)}
function marker(userId,day){return PREFIX+userId+'_'+day}
async function dailyBackup(force=false){
 if(running||!sb||!session?.user)return false;
 const day=targetBusinessDate(),mk=marker(session.user.id,day);
 if(!force&&localStorage.getItem(mk)==='1')return false;
 running=true;
 try{
   const payload={backup_type:'daily',backup_date:day,device_time:new Date().toISOString(),transactions:parse(TX,[]),cash_flows:parse(CF,[]),store:parse(ST,{})};
   const {error}=await sb.from('app_backups').insert({user_id:session.user.id,payload,created_at:new Date().toISOString()});
   if(error)throw error;
   localStorage.setItem(mk,'1');
   localStorage.setItem('rbm_daily_backup_last',new Date().toISOString());
   window.dispatchEvent(new CustomEvent('rbm-daily-backup-done',{detail:{date:day}}));
   return true;
 }catch(e){console.error('RBM daily backup',e);return false}finally{running=false}
}
function scheduleChecks(){clearInterval(timer);timer=setInterval(()=>dailyBackup(false),15*60*1000)}
async function init(){
 if(!valid())return;
 sb=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
 const g=await sb.auth.getSession();session=g.data.session;
 if(session){setTimeout(()=>dailyBackup(false),5000);scheduleChecks()}
 sb.auth.onAuthStateChange((ev,s)=>{session=s;if(s){setTimeout(()=>dailyBackup(false),5000);scheduleChecks()}else clearInterval(timer)});
 window.addEventListener('online',()=>session?.user&&setTimeout(()=>dailyBackup(false),1500));
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&session?.user)dailyBackup(false)});
 window.addEventListener('focus',()=>session?.user&&dailyBackup(false));
 window.RBM_DAILY_BACKUP_NOW=()=>dailyBackup(true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
