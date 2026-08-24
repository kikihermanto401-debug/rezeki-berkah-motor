(function(){
'use strict';
const TX_KEY='rbm_tx';
let mode='daily',lastSig='';
function money(n){return 'Rp '+Number(n||0).toLocaleString('id-ID')}
function readTx(){try{return JSON.parse(localStorage.getItem(TX_KEY)||'[]')||[]}catch(e){return[]}}
function localParts(v){const d=new Date(v);if(Number.isNaN(d.getTime()))return null;return {d,y:d.getFullYear(),m:d.getMonth()+1,day:d.getDate()}}
function dailyKey(p){return p.y+'-'+String(p.m).padStart(2,'0')+'-'+String(p.day).padStart(2,'0')}
function monthlyKey(p){return p.y+'-'+String(p.m).padStart(2,'0')}
function aggregate(kind){const map=new Map();for(const x of readTx()){const p=localParts(x.date);if(!p)continue;const key=kind==='monthly'?monthlyKey(p):dailyKey(p);let r=map.get(key);if(!r){r={key,date:p.d,tx:0,items:0,sales:0};map.set(key,r)}r.tx+=1;r.items+=Number(x.qty||0);r.sales+=Number(x.qty||0)*Number(x.price||0)}return [...map.values()].sort((a,b)=>b.key.localeCompare(a.key))}
function label(r,kind){if(kind==='monthly')return r.date.toLocaleDateString('id-ID',{month:'long',year:'numeric'});return r.date.toLocaleDateString('id-ID',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}
function sublabel(r,kind){return kind==='monthly'?'Rekap penjualan bulanan':'Catatan penjualan harian'}
function htmlRows(kind){const rows=aggregate(kind);if(!rows.length)return '<div class="rbmHistEmpty">Belum ada riwayat penjualan.</div>';return rows.map(r=>'<div class="rbmHistRow"><div class="rbmHistDate"><b>'+label(r,kind)+'</b><span>'+sublabel(r,kind)+'</span></div><div class="rbmHistMetric rbmHistTx">'+r.tx+' transaksi</div><div class="rbmHistMetric rbmHistItems">'+Number(r.items).toLocaleString('id-ID')+' item</div><div class="rbmHistSales">'+money(r.sales)+'</div></div>').join('')}
function build(){if(document.getElementById('rbmSalesHistory'))return;const home=document.getElementById('home');if(!home)return;const kpis=home.querySelector('.kpis');if(!kpis)return;const box=document.createElement('section');box.id='rbmSalesHistory';box.innerHTML='<div class="rbmHistHead"><div class="rbmHistTitle"><b>Riwayat Angka Penjualan</b><span>Catatan otomatis penjualan harian dan bulanan</span></div><div class="rbmHistTabs"><button class="rbmHistTab active" data-mode="daily">Harian</button><button class="rbmHistTab" data-mode="monthly">Bulanan</button></div></div><div class="rbmHistCols"><span>Hari / Tanggal</span><span>Transaksi</span><span>Item Terjual</span><span>Total Penjualan</span></div><div class="rbmHistList"></div>';kpis.insertAdjacentElement('afterend',box);box.querySelectorAll('.rbmHistTab').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;box.querySelectorAll('.rbmHistTab').forEach(x=>x.classList.toggle('active',x===b));render(true)});render(true)}
function render(force){const box=document.getElementById('rbmSalesHistory');if(!box)return;const raw=localStorage.getItem(TX_KEY)||'[]';const sig=mode+'|'+raw.length+'|'+raw.slice(-180);if(!force&&sig===lastSig)return;lastSig=sig;box.querySelector('.rbmHistList').innerHTML=htmlRows(mode)}
function init(){build();render(true);window.addEventListener('rbm-cloud-synced',()=>render(true));window.addEventListener('storage',e=>{if(e.key===TX_KEY)render(true)});setInterval(()=>render(false),1400)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,180));else setTimeout(init,180);
})();
