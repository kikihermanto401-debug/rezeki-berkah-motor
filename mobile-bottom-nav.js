(function(){
'use strict';
function isMobileDevice(){
  const ua=navigator.userAgent||'';
  return /Android|iPhone|iPad|iPod|Mobile|SamsungBrowser/i.test(ua) || (navigator.maxTouchPoints>1 && Math.min(screen.width,screen.height)<900);
}
function style(){
 const s=document.createElement('style');
 s.textContent=`
 #rbmMobileBottomNav{display:none}
 body.rbm-mobile-nav{padding-bottom:calc(86px + env(safe-area-inset-bottom))!important}
 body.rbm-mobile-nav #rbmMobileBottomNav{position:fixed!important;left:8px!important;right:8px!important;bottom:max(8px,env(safe-area-inset-bottom))!important;z-index:2147483005!important;display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:4px!important;padding:7px!important;border-radius:18px!important;background:rgba(8,10,13,.98)!important;border:1px solid rgba(255,106,0,.55)!important;box-shadow:0 18px 50px rgba(0,0,0,.8),inset 0 1px 0 rgba(255,255,255,.05)!important;backdrop-filter:blur(18px)!important;-webkit-backdrop-filter:blur(18px)!important}
 body.rbm-mobile-nav #rbmMobileBottomNav button{position:relative;min-width:0;height:58px;border:0;border-radius:12px;background:transparent;color:#9da4ad;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-family:Inter,system-ui;font-size:9px;font-weight:800;cursor:pointer;padding:3px 1px}
 body.rbm-mobile-nav #rbmMobileBottomNav button .ico{font-size:19px;line-height:1;color:#c0c5cb}
 body.rbm-mobile-nav #rbmMobileBottomNav button.active{color:#fff;background:linear-gradient(145deg,#ff7a00,#9b3400);box-shadow:0 7px 22px rgba(255,106,0,.28),inset 0 1px 0 rgba(255,255,255,.14)}
 body.rbm-mobile-nav #rbmMobileBottomNav button.active .ico{color:#fff}
 body.rbm-mobile-nav #rbmMobileBottomNav button:active{transform:scale(.96)}
 #rbmMobileMoreSheet{position:fixed;inset:0;z-index:2147483100;display:none;align-items:flex-end;background:rgba(0,0,0,.68);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
 #rbmMobileMoreSheet.show{display:flex}
 .rbmMobileSheetCard{width:100%;padding:14px 14px calc(18px + env(safe-area-inset-bottom));border-radius:22px 22px 0 0;background:linear-gradient(160deg,#15191e,#090b0e);border-top:1px solid rgba(255,106,0,.5);box-shadow:0 -24px 60px rgba(0,0,0,.7)}
 .rbmMobileSheetGrip{width:42px;height:4px;border-radius:999px;background:#3c4249;margin:0 auto 13px}.rbmMobileSheetTitle{font:800 18px 'Barlow Condensed',Inter,sans-serif;color:#fff;margin:0 0 10px;text-transform:uppercase}.rbmMobileSheetGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.rbmMobileSheetGrid button{min-height:75px;border:1px solid #2c3137;border-radius:12px;background:#101318;color:#d8dce0;font:700 10px Inter,system-ui;padding:9px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:7px}.rbmMobileSheetGrid button span:first-child{font-size:22px;color:#ff7a13}
 body.rbm-mobile-nav #rbmCloudStatus{bottom:calc(88px + env(safe-area-inset-bottom))!important}
 body.rbm-mobile-nav .rbmAuthLogout{top:8px!important;right:8px!important;font-size:8px!important;max-width:55vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 @media(max-width:380px){body.rbm-mobile-nav #rbmMobileBottomNav button{height:54px;font-size:8px}body.rbm-mobile-nav #rbmMobileBottomNav button .ico{font-size:17px}}
 `;
 document.head.appendChild(s);
}
function callPage(page){
 if(typeof window.go==='function'){window.go(page);sync(page);window.scrollTo({top:0,behavior:'smooth'});return}
 const nav=document.querySelector(`.nav button[data-page="${page}"]`);if(nav){nav.click();sync(page);window.scrollTo({top:0,behavior:'smooth'})}
}
function sync(page){document.querySelectorAll('#rbmMobileBottomNav [data-mobile-page]').forEach(b=>b.classList.toggle('active',b.dataset.mobilePage===page))}
function clickSidebarByText(words){
 const buttons=[...document.querySelectorAll('.nav button')];
 const b=buttons.find(x=>words.some(w=>(x.textContent||'').toLowerCase().includes(w)));
 if(b){b.click();window.scrollTo({top:0,behavior:'smooth'});return true}return false;
}
function build(){
 if(document.getElementById('rbmMobileBottomNav'))return;
 style();
 if(isMobileDevice() || window.innerWidth<=1024 || matchMedia('(hover:none) and (pointer:coarse)').matches){document.body.classList.add('rbm-mobile-nav')}
 const bar=document.createElement('nav');bar.id='rbmMobileBottomNav';bar.setAttribute('aria-label','Navigasi bawah RBM');
 bar.innerHTML=`<button data-mobile-page="home" class="active"><span class="ico">⌂</span><span>Dashboard</span></button><button data-mobile-page="sales"><span class="ico">🛒</span><span>Transaksi</span></button><button data-mobile-page="cash"><span class="ico">💰</span><span>Kas</span></button><button data-mobile-page="report"><span class="ico">▤</span><span>Laporan</span></button><button id="rbmMobileMore"><span class="ico">☰</span><span>Lainnya</span></button>`;
 document.body.appendChild(bar);
 bar.querySelectorAll('[data-mobile-page]').forEach(b=>b.onclick=()=>callPage(b.dataset.mobilePage));
 const sheet=document.createElement('div');sheet.id='rbmMobileMoreSheet';
 sheet.innerHTML=`<div class="rbmMobileSheetCard"><div class="rbmMobileSheetGrip"></div><div class="rbmMobileSheetTitle">Menu RBM</div><div class="rbmMobileSheetGrid"><button data-extra="products"><span>📦</span><span>Produk</span></button><button data-extra="customers"><span>👥</span><span>Pelanggan</span></button><button data-extra="zakat"><span>⌗</span><span>Zakat</span></button><button data-extra="settings"><span>⚙</span><span>Pengaturan</span></button><button data-extra="cloud"><span>☁</span><span>Cloud & Backup</span></button><button id="rbmMobileClose"><span>✕</span><span>Tutup</span></button></div></div>`;
 document.body.appendChild(sheet);
 document.getElementById('rbmMobileMore').onclick=()=>sheet.classList.add('show');document.getElementById('rbmMobileClose').onclick=()=>sheet.classList.remove('show');sheet.onclick=e=>{if(e.target===sheet)sheet.classList.remove('show')};
 sheet.querySelector('[data-extra="products"]').onclick=()=>{clickSidebarByText(['produk']);sheet.classList.remove('show')};
 sheet.querySelector('[data-extra="customers"]').onclick=()=>{clickSidebarByText(['pelanggan']);sheet.classList.remove('show')};
 sheet.querySelector('[data-extra="zakat"]').onclick=()=>{clickSidebarByText(['zakat'])||callPage('zakat');sheet.classList.remove('show')};
 sheet.querySelector('[data-extra="settings"]').onclick=()=>{clickSidebarByText(['pengaturan'])||callPage('settings');sheet.classList.remove('show')};
 sheet.querySelector('[data-extra="cloud"]').onclick=()=>{document.getElementById('rbmCloudStatus')?.click();sheet.classList.remove('show')};
 document.querySelectorAll('.nav button[data-page]').forEach(b=>b.addEventListener('click',()=>sync(b.dataset.page)));
 window.addEventListener('resize',()=>{if(isMobileDevice()||window.innerWidth<=1024)document.body.classList.add('rbm-mobile-nav')});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(build,120));else setTimeout(build,120);
})();