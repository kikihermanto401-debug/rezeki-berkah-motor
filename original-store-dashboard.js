(function(){
  const STORE_KEYS=['rbm_store','rbm_store_profile_v2'];
  function readStore(){
    for(const k of STORE_KEYS){try{const x=JSON.parse(localStorage.getItem(k)||'null');if(x&&typeof x==='object')return {name:x.name||'Rezeki Berkah Motor',address:x.address||'-',phone:x.phone||'-',logo:x.logo||''};}catch(e){}}
    return {name:'Rezeki Berkah Motor',address:'-',phone:'-',logo:''};
  }
  function waNumber(phone){return String(phone||'').replace(/\D/g,'').replace(/^0/,'62')}
  function ensureSidebar(){
    const sideBrand=document.querySelector('.side .sub,.rbm-side-brand .rbm-brand-sub');
    if(!sideBrand||document.getElementById('rbm-store-contact'))return;
    const box=document.createElement('div');box.id='rbm-store-contact';box.className='rbm-store-contact';
    box.innerHTML='<div class="rbm-store-contact-title">Informasi Toko</div><div class="rbm-store-contact-line"><i class="fa-solid fa-location-dot"></i><strong id="rbm-dash-address">-</strong></div><div class="rbm-store-contact-line"><i class="fa-brands fa-whatsapp"></i><a id="rbm-dash-wa" class="rbm-store-wa" href="#" target="_blank" rel="noopener">-</a></div>';
    sideBrand.insertAdjacentElement('afterend',box);
  }
  function ensureTop(){
    const top=document.querySelector('.top,.rbm-topbar');if(!top||document.getElementById('rbm-top-store-info'))return;
    const box=document.createElement('div');box.id='rbm-top-store-info';box.className='rbm-top-store-info';
    box.innerHTML='<div class="rbm-top-store-item"><i class="fa-solid fa-location-dot"></i><span id="rbm-top-address">-</span></div><div class="rbm-top-store-item"><i class="fa-brands fa-whatsapp"></i><a id="rbm-top-wa" href="#" target="_blank" rel="noopener">-</a></div>';
    const user=top.querySelector('.user,.rbm-admin');if(user)top.insertBefore(box,user);else top.appendChild(box);
  }
  function update(){
    ensureSidebar();ensureTop();const s=readStore();
    const addr=s.address||'-', phone=s.phone||'-', wn=waNumber(phone), href=wn?'https://wa.me/'+wn:'#';
    ['rbm-dash-address','rbm-top-address'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=addr});
    ['rbm-dash-wa','rbm-top-wa'].forEach(id=>{const e=document.getElementById(id);if(e){e.textContent=phone;e.href=href}});
    const brand=document.querySelector('.brand,.rbm-brand-title');if(brand&&s.name)brand.textContent=s.name;
  }
  function hookSettings(){
    const saveCandidates=[...document.querySelectorAll('button')].filter(b=>/simpan pengaturan/i.test(b.textContent||''));
    saveCandidates.forEach(b=>{if(b.dataset.rbmStoreHook)return;b.dataset.rbmStoreHook='1';b.addEventListener('click',()=>setTimeout(update,80))});
  }
  const originalSet=localStorage.setItem.bind(localStorage);
  localStorage.setItem=function(k,v){originalSet(k,v);if(STORE_KEYS.includes(k))setTimeout(update,0)};
  function init(){update();hookSettings();new MutationObserver(()=>{ensureSidebar();ensureTop();hookSettings()}).observe(document.body,{childList:true,subtree:true});setInterval(update,1500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,150));else setTimeout(init,150);
})();