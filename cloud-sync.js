(function(){
'use strict';

const CONFIG_KEY='rbm_cloud_config';
const TX_KEY='rbm_tx';
const CASH_KEY='rbm_cf';
const STORE_KEY='rbm_store';
const LAST_BACKUP_KEY='rbm_cloud_last_backup';

let client=null, session=null, syncing=false, syncTimer=null, periodicTimer=null;
let originalSetItem=localStorage.setItem.bind(localStorage);

function validConfig(c){
  return !!(c && /^https:\/\/.+\.supabase\.co\/?$/.test(String(c.supabaseUrl||'')) &&
    String(c.supabaseAnonKey||'').length>40 &&
    !String(c.supabaseUrl).includes('ISI_') && !String(c.supabaseAnonKey).includes('ISI_'));
}
function getConfig(){
  try{
    const saved=JSON.parse(localStorage.getItem(CONFIG_KEY)||'null');
    if(validConfig(saved)) return saved;
  }catch(e){}
  const global=window.RBM_CLOUD_CONFIG||{};
  return validConfig(global)?global:null;
}
function safeParse(key,fallback){
  try{const v=JSON.parse(localStorage.getItem(key)||'null'); return v==null?fallback:v}catch(e){return fallback}
}
function status(text,state='bad'){
  let el=document.getElementById('rbmCloudStatus');
  if(!el){
    el=document.createElement('button');
    el.id='rbmCloudStatus';
    el.type='button';
    el.style.cssText='position:fixed;right:12px;bottom:12px;z-index:2147483000;border-radius:999px;padding:8px 11px;background:#090b0e;border:1px solid rgba(255,106,0,.45);font:800 10px/1 Inter,system-ui;color:#fca5a5;box-shadow:0 10px 28px rgba(0,0,0,.42);cursor:pointer';
    el.onclick=()=>openModal();
    document.body.appendChild(el);
  }
  el.textContent='● '+text;
  el.style.color=state==='ok'?'#6ee7b7':state==='sync'?'#fdba74':'#fca5a5';
}
function injectStyle(){
  const s=document.createElement('style');
  s.textContent=`
  #rbmCloudModal{position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.82);backdrop-filter:blur(10px)}
  #rbmCloudModal.show{display:flex}
  .rbmCloudCard{width:min(470px,100%);max-height:92vh;overflow:auto;border-radius:18px;padding:22px;background:linear-gradient(145deg,#14171b,#080a0d);border:1px solid rgba(255,106,0,.45);box-shadow:0 30px 90px rgba(0,0,0,.72);color:#f8fafc;font-family:Inter,system-ui}
  .rbmCloudBrand{font:italic 900 34px/1 'Barlow Condensed',Impact,sans-serif;color:#ff6a00}
  .rbmCloudBrand small{display:block;margin-top:7px;font:700 10px/1.4 Inter,system-ui;color:#cfd4d9;letter-spacing:.12em}
  .rbmCloudInfo{margin:14px 0;color:#aeb4bb;font-size:11px;line-height:1.55}
  .rbmCloudCard input{width:100%;height:44px;margin:5px 0;padding:0 12px;border-radius:9px;background:#090b0e!important;border:1px solid #353a40!important;color:#fff!important;box-sizing:border-box}
  .rbmCloudGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
  .rbmCloudBtn{min-height:42px;border-radius:9px;border:1px solid #353a40;background:#111419;color:#f3f4f6;font-weight:800;font-size:11px;cursor:pointer}
  .rbmCloudBtn.primary{background:linear-gradient(135deg,#ff8a00,#c2410c);border-color:#ff8a1f}
  .rbmCloudBtn.danger{background:#21100d;color:#fca5a5;border-color:#5c2219}
  .rbmCloudMsg{min-height:20px;margin-top:10px;color:#fbbf24;font-size:10px}
  .rbmCloudAccount{margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,.07);font-size:10px;color:#9ca3af}
  .rbmCloudSection{margin-top:15px;padding-top:12px;border-top:1px solid rgba(255,255,255,.07)}
  .rbmCloudSection b{font-size:11px;color:#fff}
  @media(max-width:560px){.rbmCloudGrid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(s);
}
function buildModal(){
  injectStyle();
  const wrap=document.createElement('div');
  wrap.id='rbmCloudModal';
  wrap.innerHTML=`
   <div class="rbmCloudCard">
    <div class="rbmCloudBrand">RBM CLOUD<small>LOGIN • SYNC • BACKUP OTOMATIS</small></div>
    <div class="rbmCloudInfo">Gunakan akun admin yang sama di HP, laptop, tablet, dan komputer. Transaksi, kas, laporan, dan profil toko akan mengikuti data cloud.</div>

    <div class="rbmCloudSection">
      <b>1. Koneksi Supabase</b>
      <input id="rbmCloudUrl" placeholder="Project URL: https://xxxx.supabase.co">
      <input id="rbmCloudKey" placeholder="Publishable / Anon Key">
      <button class="rbmCloudBtn" id="rbmSaveCloudConfig">SIMPAN KONEKSI</button>
    </div>

    <div class="rbmCloudSection">
      <b>2. Login Admin RBM</b>
      <input id="rbmCloudEmail" type="email" autocomplete="username" placeholder="Email admin">
      <input id="rbmCloudPass" type="password" autocomplete="current-password" placeholder="Password minimal 6 karakter">
      <div class="rbmCloudGrid">
        <button class="rbmCloudBtn primary" id="rbmCloudLogin">LOGIN</button>
        <button class="rbmCloudBtn" id="rbmCloudRegister">DAFTAR AKUN</button>
      </div>
    </div>

    <div class="rbmCloudSection">
      <b>3. Sinkronisasi & Backup</b>
      <div class="rbmCloudGrid">
        <button class="rbmCloudBtn" id="rbmSyncNow">SYNC SEKARANG</button>
        <button class="rbmCloudBtn" id="rbmBackupNow">BACKUP SEKARANG</button>
      </div>
      <div class="rbmCloudAccount" id="rbmCloudAccount">Belum terhubung.</div>
    </div>

    <div class="rbmCloudGrid" style="margin-top:14px">
      <button class="rbmCloudBtn danger" id="rbmCloudLogout">LOGOUT</button>
      <button class="rbmCloudBtn" id="rbmCloudClose">TUTUP</button>
    </div>
    <div class="rbmCloudMsg" id="rbmCloudMsg"></div>
   </div>`;
  document.body.appendChild(wrap);

  document.getElementById('rbmCloudClose').onclick=closeModal;
  wrap.addEventListener('click',e=>{if(e.target===wrap)closeModal()});
  document.getElementById('rbmSaveCloudConfig').onclick=saveConfigFromUI;
  document.getElementById('rbmCloudLogin').onclick=login;
  document.getElementById('rbmCloudRegister').onclick=register;
  document.getElementById('rbmCloudLogout').onclick=logout;
  document.getElementById('rbmSyncNow').onclick=()=>syncAll(true);
  document.getElementById('rbmBackupNow').onclick=()=>backup(true);
  fillConfigUI();
}
function msg(t,good=false){
  const el=document.getElementById('rbmCloudMsg');
  if(el){el.textContent=t||'';el.style.color=good?'#6ee7b7':'#fbbf24'}
}
function fillConfigUI(){
  const c=getConfig() || window.RBM_CLOUD_CONFIG || {};
  const u=document.getElementById('rbmCloudUrl'),k=document.getElementById('rbmCloudKey');
  if(u && validConfig(c)){u.value=c.supabaseUrl||'';k.value=c.supabaseAnonKey||''}
  updateAccount();
}
function openModal(){document.getElementById('rbmCloudModal')?.classList.add('show');fillConfigUI()}
function closeModal(){document.getElementById('rbmCloudModal')?.classList.remove('show')}
function updateAccount(){
  const el=document.getElementById('rbmCloudAccount');
  if(!el)return;
  if(session?.user){
    const lb=localStorage.getItem(LAST_BACKUP_KEY);
    el.innerHTML='Terhubung: <b style="color:#fff">'+(session.user.email||'Admin')+'</b><br>Backup terakhir: '+(lb?new Date(lb).toLocaleString('id-ID'):'belum ada');
  }else{
    el.textContent=getConfig()?'Koneksi Supabase tersimpan. Silakan login.':'Supabase belum dikonfigurasi.';
  }
}
async function createClient(){
  const c=getConfig();
  if(!c || !window.supabase){client=null;status('CLOUD BELUM SETUP','bad');return false}
  client=window.supabase.createClient(c.supabaseUrl,c.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const {data}=await client.auth.getSession();
  session=data.session;
  client.auth.onAuthStateChange((_e,s)=>{session=s;updateAccount();if(s){status('CLOUD ONLINE','ok');syncAll(false)}else status('BELUM LOGIN','bad')});
  if(session){status('CLOUD ONLINE','ok');updateAccount()}else status('BELUM LOGIN','bad');
  return true;
}
async function saveConfigFromUI(){
  const url=document.getElementById('rbmCloudUrl').value.trim();
  const key=document.getElementById('rbmCloudKey').value.trim();
  const c={supabaseUrl:url,supabaseAnonKey:key};
  if(!validConfig(c)){msg('Project URL atau Anon/Publishable Key belum valid.');return}
  originalSetItem(CONFIG_KEY,JSON.stringify(c));
  msg('Koneksi tersimpan. Menghubungkan...',true);
  await createClient();
  updateAccount();
}
async function login(){
  if(!client && !(await createClient())){msg('Isi koneksi Supabase terlebih dahulu.');return}
  const email=document.getElementById('rbmCloudEmail').value.trim();
  const password=document.getElementById('rbmCloudPass').value;
  if(!email || password.length<6){msg('Masukkan email dan password minimal 6 karakter.');return}
  msg('Login...');
  const {data,error}=await client.auth.signInWithPassword({email,password});
  if(error){msg(error.message);return}
  session=data.session; updateAccount(); status('CLOUD ONLINE','ok'); msg('Login berhasil.',true);
  await syncAll(false);
}
async function register(){
  if(!client && !(await createClient())){msg('Isi koneksi Supabase terlebih dahulu.');return}
  const email=document.getElementById('rbmCloudEmail').value.trim();
  const password=document.getElementById('rbmCloudPass').value;
  if(!email || password.length<6){msg('Masukkan email dan password minimal 6 karakter.');return}
  msg('Membuat akun...');
  const {data,error}=await client.auth.signUp({email,password});
  if(error){msg(error.message);return}
  if(data.session){session=data.session;msg('Akun dibuat dan login berhasil.',true);await syncAll(false)}
  else msg('Akun dibuat. Cek email konfirmasi, lalu login.',true);
  updateAccount();
}
async function logout(){
  try{await client?.auth.signOut()}catch(e){}
  session=null;updateAccount();status('BELUM LOGIN','bad');msg('Logout berhasil.',true);
}
function normalizeTx(x){
  return {user_id:session.user.id,id:String(x.id),date:x.date||new Date().toISOString(),customer:x.customer||'Umum',name:x.name||'',notes:x.notes||'',qty:Number(x.qty||0),unit:x.unit||'pcs',price:Number(x.price||0),cost:Number(x.cost||0)};
}
function normalizeCash(x){
  return {user_id:session.user.id,id:String(x.id),date:x.date||new Date().toISOString(),type:x.type==='out'?'out':'in',amount:Number(x.amount||0),notes:x.notes||''};
}
async function pull(){
  const uid=session.user.id;
  const [t,c,p]=await Promise.all([
    client.from('transactions').select('*').eq('user_id',uid).order('date',{ascending:false}),
    client.from('cash_flows').select('*').eq('user_id',uid).order('date',{ascending:false}),
    client.from('store_profiles').select('*').eq('user_id',uid).maybeSingle()
  ]);
  if(t.error)throw t.error;if(c.error)throw c.error;if(p.error)throw p.error;
  const cloudHas=(t.data?.length||0)+(c.data?.length||0)+(p.data?1:0)>0;
  if(!cloudHas)return false;
  originalSetItem(TX_KEY,JSON.stringify((t.data||[]).map(x=>({id:isNaN(Number(x.id))?x.id:Number(x.id),date:x.date,customer:x.customer,name:x.name,notes:x.notes,qty:Number(x.qty),unit:x.unit,price:Number(x.price),cost:Number(x.cost)}))));
  originalSetItem(CASH_KEY,JSON.stringify((c.data||[]).map(x=>({id:isNaN(Number(x.id))?x.id:Number(x.id),date:x.date,type:x.type,amount:Number(x.amount),notes:x.notes}))));
  if(p.data) originalSetItem(STORE_KEY,JSON.stringify({name:p.data.store_name||'Rezeki Berkah Motor',phone:p.data.phone||'',address:p.data.address||''}));
  return true;
}
async function push(){
  const uid=session.user.id;
  const tx=safeParse(TX_KEY,[]);
  const cf=safeParse(CASH_KEY,[]);
  const st=safeParse(STORE_KEY,{});
  if(tx.length){
    const {error}=await client.from('transactions').upsert(tx.map(normalizeTx),{onConflict:'user_id,id'});if(error)throw error;
  }
  if(cf.length){
    const {error}=await client.from('cash_flows').upsert(cf.map(normalizeCash),{onConflict:'user_id,id'});if(error)throw error;
  }
  const {error:pe}=await client.from('store_profiles').upsert({user_id:uid,store_name:st.name||'Rezeki Berkah Motor',phone:st.phone||'',address:st.address||'',updated_at:new Date().toISOString()},{onConflict:'user_id'});
  if(pe)throw pe;
}
async function backup(manual=false){
  if(!client || !session?.user){if(manual)msg('Login cloud terlebih dahulu.');return}
  try{
    status('BACKUP...','sync');
    const payload={transactions:safeParse(TX_KEY,[]),cash_flows:safeParse(CASH_KEY,[]),store:safeParse(STORE_KEY,{})};
    const {error}=await client.from('app_backups').insert({user_id:session.user.id,payload,created_at:new Date().toISOString()});
    if(error)throw error;
    originalSetItem(LAST_BACKUP_KEY,new Date().toISOString());
    updateAccount();status('CLOUD ONLINE','ok');if(manual)msg('Backup cloud berhasil.',true);
  }catch(e){console.error(e);status('BACKUP GAGAL','bad');if(manual)msg('Backup gagal: '+e.message)}
}
async function syncAll(manual=false){
  if(syncing || !client || !session?.user)return;
  syncing=true;status('SINKRON...','sync');
  try{
    const localEmpty=safeParse(TX_KEY,[]).length===0 && safeParse(CASH_KEY,[]).length===0;
    const hadCloud=await pull();
    if(!hadCloud || !localEmpty) await push();
    status('CLOUD TERSINKRON','ok');
    if(manual)msg('Sinkronisasi selesai.',true);
    if(hadCloud && localEmpty)setTimeout(()=>location.reload(),400);
  }catch(e){
    console.error(e);status('SYNC GAGAL','bad');if(manual)msg('Sync gagal: '+e.message);
  }finally{syncing=false}
}
function scheduleSync(){
  if(!session?.user)return;
  clearTimeout(syncTimer);
  syncTimer=setTimeout(()=>{push().then(()=>status('CLOUD TERSINKRON','ok')).catch(e=>{console.error(e);status('SYNC GAGAL','bad')})},900);
}
function hookStorage(){
  localStorage.setItem=function(k,v){
    originalSetItem(k,v);
    if(k===TX_KEY||k===CASH_KEY||k===STORE_KEY)scheduleSync();
  };
}
async function init(){
  buildModal();
  hookStorage();
  await createClient();
  if(session?.user){
    await syncAll(false);
    periodicTimer=setInterval(()=>{syncAll(false);backup(false)},5*60*1000);
  }
  window.addEventListener('online',()=>{if(session?.user)syncAll(false);else status('ONLINE • BELUM LOGIN','bad')});
  window.addEventListener('offline',()=>status('OFFLINE • DATA LOKAL','bad'));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();