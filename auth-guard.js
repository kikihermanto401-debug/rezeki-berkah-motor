(function(){
'use strict';
const cfg=window.RBM_CLOUD_CONFIG||{};
let sb=null;
let recoveryMode=false;
function validConfig(){return !!(window.supabase&&/^https:\/\/.+\.supabase\.co\/?$/.test(String(cfg.supabaseUrl||''))&&String(cfg.supabaseAnonKey||'').length>30)}
function emailValid(v){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v||'').trim())}
function style(){
 const s=document.createElement('style');
 s.textContent=`#rbmAuthGate{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:18px;background:radial-gradient(circle at 78% 0,rgba(255,106,0,.14),transparent 28%),rgba(2,3,4,.97);backdrop-filter:blur(14px)}#rbmAuthGate.hidden{display:none}.rbmAuthBox{width:min(430px,100%);padding:25px;border-radius:18px;background:linear-gradient(145deg,#14171b,#080a0d);border:1px solid rgba(255,106,0,.48);box-shadow:0 32px 100px rgba(0,0,0,.8);color:#f8fafc;font-family:Inter,system-ui}.rbmAuthLogo{font:italic 900 38px/1 'Barlow Condensed',Impact,sans-serif;color:#ff6a00}.rbmAuthLogo small{display:block;margin-top:8px;font:700 10px/1.4 Inter,system-ui;color:#d2d6da;letter-spacing:.13em}.rbmAuthText{margin:16px 0 12px;color:#aeb4bb;font-size:11px;line-height:1.55}.rbmAuthBox input{width:100%;height:46px;margin:6px 0;padding:0 12px;border-radius:10px;border:1px solid #353a40;background:#090b0e!important;color:#fff!important;box-sizing:border-box}.rbmAuthBtns{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:11px}.rbmAuthBtns button{min-height:44px;border-radius:9px;border:1px solid #353a40;background:#111419;color:#f4f4f5;font-weight:800;font-size:11px;cursor:pointer}.rbmAuthBtns .primary{background:linear-gradient(135deg,#ff8a00,#c2410c);border-color:#ff8a1f}.rbmForgot{width:100%;margin-top:8px;padding:9px;border:0;background:transparent;color:#ff9a45;font-size:10px;font-weight:800;cursor:pointer;text-decoration:underline}.rbmAuthMsg{min-height:22px;margin-top:8px;font-size:10px;color:#fbbf24}.rbmAuthState{margin-top:11px;padding-top:10px;border-top:1px solid rgba(255,255,255,.07);font-size:9px;color:#8f969e}.rbmAuthLogout{position:fixed;right:12px;top:12px;z-index:2147483001;display:none;padding:7px 10px;border-radius:999px;border:1px solid rgba(255,106,0,.4);background:#090b0e;color:#fdba74;font:800 9px Inter,system-ui;cursor:pointer}.rbmRecovery{display:none}.rbmRecovery.show{display:block}.rbmLoginPane.hidden{display:none}@media(max-width:560px){.rbmAuthBtns{grid-template-columns:1fr}.rbmAuthBox{padding:20px}}`;
 document.head.appendChild(s);
}
function build(){
 style();
 const g=document.createElement('div');g.id='rbmAuthGate';
 g.innerHTML=`<div class="rbmAuthBox"><div class="rbmAuthLogo">RBM ADMIN<small>REZEKI BERKAH MOTOR • SECURE CLOUD LOGIN</small></div>
 <div class="rbmLoginPane" id="rbmLoginPane"><div class="rbmAuthText">Dashboard dikunci. Hanya akun Supabase yang benar-benar terautentikasi yang dapat membuka aplikasi.</div><input id="rbmGateEmail" type="email" autocomplete="username" placeholder="Email admin"><input id="rbmGatePass" type="password" autocomplete="current-password" placeholder="Password minimal 6 karakter"><div class="rbmAuthBtns"><button class="primary" id="rbmGateLogin">LOGIN</button><button id="rbmGateRegister">DAFTAR AKUN</button></div><button class="rbmForgot" id="rbmGateForgot" type="button">LUPA PASSWORD? KIRIM LINK KE EMAIL</button></div>
 <div class="rbmRecovery" id="rbmRecovery"><div class="rbmAuthText"><b style="color:#fff">BUAT PASSWORD BARU</b><br>Link reset sudah diverifikasi. Masukkan password baru Anda.</div><input id="rbmNewPass" type="password" autocomplete="new-password" placeholder="Password baru minimal 6 karakter"><input id="rbmNewPass2" type="password" autocomplete="new-password" placeholder="Ulangi password baru"><button class="rbmAuthBtns primary" style="display:block;width:100%;min-height:44px;border-radius:9px;border:1px solid #ff8a1f;background:linear-gradient(135deg,#ff8a00,#c2410c);color:#fff;font-weight:800;cursor:pointer" id="rbmSaveNewPass">SIMPAN PASSWORD BARU</button></div>
 <div class="rbmAuthMsg" id="rbmGateMsg"></div><div class="rbmAuthState" id="rbmGateState">Memeriksa sesi...</div></div>`;
 document.body.appendChild(g);
 const lo=document.createElement('button');lo.id='rbmAuthLogout';lo.className='rbmAuthLogout';lo.textContent='LOGOUT ADMIN';document.body.appendChild(lo);
 document.getElementById('rbmGateLogin').onclick=login;
 document.getElementById('rbmGateRegister').onclick=register;
 document.getElementById('rbmGateForgot').onclick=forgot;
 document.getElementById('rbmSaveNewPass').onclick=saveNewPassword;
 lo.onclick=logout;
}
function msg(t,ok=false){const e=document.getElementById('rbmGateMsg');if(e){e.textContent=t||'';e.style.color=ok?'#6ee7b7':'#fbbf24'}}
function state(t){const e=document.getElementById('rbmGateState');if(e)e.textContent=t}
function lock(){document.getElementById('rbmAuthGate')?.classList.remove('hidden');const b=document.getElementById('rbmAuthLogout');if(b)b.style.display='none';document.documentElement.style.overflow='hidden'}
function unlock(session){if(recoveryMode)return;document.getElementById('rbmAuthGate')?.classList.add('hidden');const b=document.getElementById('rbmAuthLogout');if(b)b.style.display='block';document.documentElement.style.overflow='';if(session?.user?.email)b.textContent='LOGOUT • '+session.user.email}
function showRecovery(){recoveryMode=true;lock();document.getElementById('rbmLoginPane')?.classList.add('hidden');document.getElementById('rbmRecovery')?.classList.add('show');state('Mode reset password.');msg('Silakan buat password baru.',true)}
function showLogin(){recoveryMode=false;document.getElementById('rbmRecovery')?.classList.remove('show');document.getElementById('rbmLoginPane')?.classList.remove('hidden');lock();state('Silakan login dengan password baru.');msg('Password berhasil diperbarui. Silakan LOGIN.',true)}
async function login(){
 const email=document.getElementById('rbmGateEmail').value.trim(),password=document.getElementById('rbmGatePass').value;
 if(!emailValid(email)){msg('Email tidak valid. Contoh: admin@gmail.com');return}
 if(password.length<6){msg('Password minimal 6 karakter.');return}
 msg('Memeriksa akun...');
 try{const {data,error}=await sb.auth.signInWithPassword({email,password});if(error||!data.session){msg('Login ditolak: '+(error?.message||'akun tidak valid'));lock();return}msg('Login berhasil.',true);unlock(data.session)}catch(e){msg('Login gagal: '+e.message);lock()}
}
async function register(){
 const email=document.getElementById('rbmGateEmail').value.trim(),password=document.getElementById('rbmGatePass').value;
 if(!emailValid(email)){msg('Gunakan alamat email yang valid.');return}
 if(password.length<6){msg('Password minimal 6 karakter.');return}
 msg('Membuat akun...');
 try{const {data,error}=await sb.auth.signUp({email,password});if(error){msg('Pendaftaran gagal: '+error.message);return}if(data.session){msg('Akun dibuat dan login berhasil.',true);unlock(data.session)}else{msg('Akun dibuat. Cek email konfirmasi, lalu LOGIN.',true)}}catch(e){msg('Pendaftaran gagal: '+e.message)}
}
async function forgot(){
 const email=document.getElementById('rbmGateEmail').value.trim();
 if(!emailValid(email)){msg('Masukkan email akun yang valid terlebih dahulu.');return}
 if(!sb){msg('Cloud belum siap. Coba refresh halaman.');return}
 msg('Mengirim link reset password ke email...');
 try{
   const redirectTo='https://kikihermanto401-debug.github.io/rezeki-berkah-motor/';
   const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo});
   if(error){msg('Gagal mengirim email reset: '+error.message);return}
   msg('Link reset sudah dikirim. Periksa Inbox/Spam, lalu klik link dari email.',true);
 }catch(e){msg('Gagal mengirim email reset: '+e.message)}
}
async function saveNewPassword(){
 const p1=document.getElementById('rbmNewPass').value;
 const p2=document.getElementById('rbmNewPass2').value;
 if(p1.length<6){msg('Password baru minimal 6 karakter.');return}
 if(p1!==p2){msg('Ulangi password harus sama.');return}
 msg('Menyimpan password baru...');
 try{
   const {error}=await sb.auth.updateUser({password:p1});
   if(error){msg('Gagal mengubah password: '+error.message);return}
   await sb.auth.signOut();
   history.replaceState({},document.title,location.pathname);
   showLogin();
 }catch(e){msg('Gagal mengubah password: '+e.message)}
}
async function logout(){try{await sb.auth.signOut()}catch(e){}recoveryMode=false;lock();msg('Anda sudah logout.',true)}
async function init(){
 build();lock();
 if(!validConfig()){state('Konfigurasi Supabase belum valid.');msg('Cloud belum siap. Hubungi administrator.');return}
 sb=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 sb.auth.onAuthStateChange((ev,s)=>{
   if(ev==='PASSWORD_RECOVERY'){showRecovery();return}
   if(s){if(!recoveryMode)unlock(s)}else if(!recoveryMode){lock()}
 });
 const {data,error}=await sb.auth.getSession();
 if(error){state('Gagal memeriksa sesi.');lock();return}
 const params=new URLSearchParams(location.hash.replace(/^#/,''));
 if(params.get('type')==='recovery'){showRecovery();return}
 if(data.session){state('Sesi valid.');unlock(data.session)}else{state('Belum login.');lock()}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,80));else setTimeout(init,80);
})();