(function(){
'use strict';
function style(){
 const s=document.createElement('style');
 s.textContent=`
 #rbmMobileBottomNav{display:none}
 @media(max-width:760px){
   body{padding-bottom:78px!important}
   #rbmMobileBottomNav{position:fixed;left:8px;right:8px;bottom:8px;z-index:2147482500;display:grid;grid-template-columns:repeat(5,1fr);gap:4px;padding:7px;border-radius:18px;background:rgba(8,10,13,.96);border:1px solid rgba(255,106,0,.34);box-shadow:0 18px 50px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,255,255,.04);backdrop-filter:blur(16px)}
   #rbmMobileBottomNav button{position:relative;min-width:0;height:56px;border:0;border-radius:12px;background:transparent;color:#969da6;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-family:Inter,system-ui;font-size:9px;font-weight:800;cursor:pointer;transition:.2s ease}
   #rbmMobileBottomNav button .ico{font-size:18px;line-height:1;color:#b5bbc2}
   #rbmMobileBottomNav button.active{color:#fff;background:linear-gradient(145deg,rgba(255,106,0,.96),rgba(139,45,0,.92));box-shadow:0 8px 22px rgba(255,106,0,.22),inset 0 1px 0 rgba(255,255,255,.13)}
   #rbmMobileBottomNav button.active .ico{color:#fff;transform:translateY(-1px)}
   #rbmMobileBottomNav button:active{transform:scale(.96)}
   #rbmMobileMoreSheet{position:fixed;inset:0;z-index:2147482600;display:none;align-items:flex-end;background:rgba(0,0,0,.62);backdrop-filter:blur(5px)}
   #rbmMobileMoreSheet.show{display:flex}
   .rbmMobileSheetCard{width:100%;padding:14px 14px calc(18px + env(safe-area-inset-bottom));border-radius:22px 22px 0 0;background:linear-gradient(160deg,#15191e,#090b0e);border-top:1px solid rgba(255,106,0,.4);box-shadow:0 -24px 60px rgba(0,0,0,.6)}
   .rbmMobileSheetGrip{width:42px;height:4px;border-radius:999px;background:#3c4249;margin:0 auto 13px}
   .rbmMobileSheetTitle{font:800 17px 'Barlow Condensed',Inter,sans-serif;color:#fff;margin:0 0 10px;text-transform:uppercase}
   .rbmMobileSheetGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
   .rbmMobileSheetGrid button{min-height:72px;border:1px solid #2c3137;border-radius:12px;background:#101318;color:#d8dce0;font:700 10px Inter,system-ui;padding:9px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:7px}
   .rbmMobileSheetGrid button span:first-child{font-size:21px;color:#ff7a13}
   #rbmCloudStatus{bottom:82px!important}
   .rbmAuthLogout{top:8px!important;right:8px!important;font-size:8px!important;max-width:46vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 }
 @media(max-width:360px){#rbmMobileBottomNav button{font-size:8px;height:53px}#rbmMobileBottomNav button .ico{font-size:16px}}
 `;
 document.head.appendChild(s);
}
function callPage(page){
 if(typeof window.go==='function'){window.go(page);sync(page);return}
 const nav=document.querySelector(`.nav button[data-page="${page}"]`);if(nav){nav.click();sync(page)}
}
function sync(page){
 document.querySelectorAll('#rbmMobileBottomNav [data-mobile-page]').forEach(b=>b.classList.toggle('active',b.dataset.mobilePage===page));
}
function build(){
 if(document.getElementById('rbmMobileBottomNav'))return;
 style();
 const bar=document.createElement('nav');bar.id='rbmMobileBottomNav';bar.setAttribute('aria-label','Navigasi mobile RBM');
 bar.innerHTML=`
  <button data-mobile-page="home" class="active"><span class="ico">⌂</span><span>Dashboard</span></button>
  <button data-mobile-page="sales"><span class="ico">🛒</span><span>Transaksi</span></button>
  <button data-mobile-page="cash"><span class="ico">💰</span><span>Kas</span></button>
  <button data-mobile-page="report"><span class="ico">▤</span><span>Laporan</span></button>
  <button id="rbmMobileMore"><span class="ico">☰</span><span>Lainnya</span></button>`;
 document.body.appendChild(bar);
 bar.querySelectorAll('[data-mobile-page]').forEach(b=>b.onclick=()=>callPage(b.dataset.mobilePage));
 const sheet=document.createElement('div');sheet.id='rbmMobileMoreSheet';
 sheet.innerHTML=`<div class="rbmMobileSheetCard"><div class="rbmMobileSheetGrip"></div><div class="rbmMobileSheetTitle">Menu RBM</div><div class="rbmMobileSheetGrid"><button data-extra="products"><span>📦</span><span>Produk</span></button><button data-extra="customers"><span>👥</span><span>Pelanggan</span></button><button data-extra="zakat"><span>⌗</span><span>Zakat</span></button><button data-extra="settings"><span>⚙</span><span>Pengaturan</span></button><button data-extra="cloud"><span>☁</span><span>Cloud & Backup</span></button><button id="rbmMobileClose"><span>✕</span><span>Tutup</span></button></div></div>`;
 document.body.appendChild(sheet);
 document.getElementById('rbmMobileMore').onclick=()=>sheet.classList.add('show');
 document.getElementById('rbmMobileClose').onclick=()=>sheet.classList.remove('show');
 sheet.onclick=e=>{if(e.target===sheet)sheet.classList.remove('show')};
 sheet.querySelector('[data-extra="products"]').onclick=()=>{document.querySelector('.nav button:nth-of-type(5)')?.click();sheet.classList.remove('show')};
 sheet.querySelector('[data-extra="customers"]').onclick=()=>{document.querySelector('.nav button:nth-of-type(6)')?.click();sheet.classList.remove('show')};
 sheet.querySelector('[data-extra="zakat"]').onclick=()=>{callPage('zakat');sheet.classList.remove('show')};
 sheet.querySelector('[data-extra="settings"]').onclick=()=>{callPage('settings');sheet.classList.remove('show')};
 sheet.querySelector('[data-extra="cloud"]').onclick=()=>{document.getElementById('rbmCloudStatus')?.click();sheet.classList.remove('show')};
 document.querySelectorAll('.nav button[data-page]').forEach(b=>b.addEventListener('click',()=>sync(b.dataset.page)));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(build,180));else setTimeout(build,180);
})();