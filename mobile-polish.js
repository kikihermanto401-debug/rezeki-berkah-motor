(function(){
'use strict';
function build(){
  if(document.querySelector('.rbm-mobile-brandbar')) return;
  const bar=document.createElement('div');
  bar.className='rbm-mobile-brandbar';
  bar.innerHTML='<div class="rbm-mobile-mark">RBM</div><div class="rbm-mobile-brandcopy"><b><em>REZEKI</em> BERKAH MOTOR</b><span>SPAREPART & ACCESSORIES</span></div><button class="rbm-mobile-logout" type="button" aria-label="Logout" title="Logout">↪</button>';
  const app=document.querySelector('.app');
  if(app) document.body.insertBefore(bar,app); else document.body.prepend(bar);
  bar.querySelector('.rbm-mobile-logout').addEventListener('click',function(){
    const logout=document.getElementById('rbmCloudLogout');
    if(logout){ logout.click(); return; }
    const cloud=document.getElementById('rbmCloudStatus');
    if(cloud){ cloud.click(); setTimeout(()=>document.getElementById('rbmCloudLogout')?.click(),150); }
  });
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build); else build();
})();
