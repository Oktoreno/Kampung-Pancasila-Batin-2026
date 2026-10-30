(function(){
var D=window.DATA||{baris:[],slNama:[]},app=document.getElementById('app');
var B=D.baris||[],SLN=D.slNama||[],K=D.kolom||{};
var LU=K.unik||'Farmers counted as unique name',L80=K.p80||'Participants who 80% attendance the SL',L50=K.p50||'Participants who 50% attendance the SL';
var PAL=['#1f78b4','#2e9b57','#f08a24','#8a5cc2','#c2453d','#0f9aa8','#b8860b','#6b7b8c'];
var kabs=[],kc={};
B.forEach(function(r){if(!(r.kab in kc)){kc[r.kab]=PAL[kabs.length%PAL.length];kabs.push(r.kab)}});
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function num(v,d){return v==null?'–':Number(v).toLocaleString('id-ID',{maximumFractionDigits:d==null?1:d})}
function sumF(f){var s=0;B.forEach(function(r){var v=f(r);if(v)s+=v});return s}
function tv(k,i){var t=D.total;
 if(i==null){if(t&&t[k]!=null)return t[k];return sumF(function(r){return r[k]})}
 if(t&&t.sl&&t.sl[i]!=null)return t.sl[i];return sumF(function(r){return r.sl[i]})}
var slTot=SLN.map(function(n,i){return tv('sl',i)});
var kehadiran=slTot.reduce(function(a,b){return a+(b||0)},0);
var filt='Semua',q='';
function held(r){return r.sl.filter(function(v){return v>0}).length}
function bars(r,lg){var h='<div class="bars'+(lg?' lg':'')+'">';
 SLN.forEach(function(n,i){var v=r.sl[i],on=v>0,p=on?(r.unik?Math.min(100,v/r.unik*100):60):0;
  h+='<div class="bc'+(on?'':' off')+'"><span class="bv">'+(on?num(v,0):'–')+'</span>'+
  '<div class="bt" title="'+esc(n)+': '+(on?v+' petani':'belum ada kehadiran')+'"><i style="height:'+(on?Math.max(p,5):0)+'%"></i></div>'+
  (lg?'<span class="bp">'+(on&&r.unik?Math.round(v/r.unik*100)+'%':'')+'</span>':'')+
  '<span class="bl">'+esc(n.replace(/^SL\s*/i,'SL'))+'</span></div>'});
 return h+'</div>'}
function cards(){
 var list=B.map(function(r,i){return{r:r,i:i}}).filter(function(x){
  return (filt==='Semua'||x.r.kab===filt)&&(!q||(x.r.desa+' '+x.r.kec+' '+x.r.kab).toLowerCase().indexOf(q)>=0)});
 if(!list.length)return'<div class="empty">Tidak ada desa yang cocok.</div>';
 return'<div class="grid">'+list.map(function(x){var r=x.r,no=(r.p80==null&&r.p50==null);
  return'<a class="pc" style="--c:'+kc[r.kab]+'" href="#/d/'+x.i+'"><span class="kab">'+esc(r.kab)+'</span><h2>'+esc(r.desa)+'</h2><p>Kec. '+esc(r.kec)+'</p>'+
  '<div class="big"><b>'+num(r.unik,0)+'</b><small>petani (nama unik)</small></div>'+
  '<div class="stat">'+(no?'<span class="chip warn">data 80% / 50% belum ada</span>':
   '<span class="chip ok">≥80% hadir: '+num(r.p80,0)+'</span><span class="chip">≥50% hadir: '+num(r.p50,0)+'</span>')+
   (r.tambahan?'<span class="chip tb">'+esc(r.tambahan)+'</span>':'')+'</div>'+bars(r)+'</a>'}).join('')+'</div>'}
function table(){
 var h='<div class="tw"><table><thead><tr><th class="l">Kabupaten</th><th class="l">Desa</th><th class="l">Kecamatan</th><th>'+esc(LU)+'</th><th>'+esc(L80)+'</th><th>'+esc(L50)+'</th>'+
  SLN.map(function(n){return'<th>'+esc(n)+'</th>'}).join('')+'</tr></thead><tbody>';
 B.forEach(function(r,i){
  h+='<tr><td class="l">'+esc(r.kab)+'</td><td class="l"><a href="#/d/'+i+'" style="color:#1f78b4;font-weight:600">'+esc(r.desa)+'</a>'+(r.tambahan?' <span class="chip tb">'+esc(r.tambahan)+'</span>':'')+'</td><td class="l">'+esc(r.kec)+'</td>'+
  '<td>'+num(r.unik,0)+'</td><td'+(r.p80==null?' class="z"':'')+'>'+num(r.p80,0)+'</td><td'+(r.p50==null?' class="z"':'')+'>'+num(r.p50,0)+'</td>'+
  SLN.map(function(n,j){var v=r.sl[j];return'<td'+(v>0?'':' class="z"')+'>'+(v==null?'–':num(v,0))+'</td>'}).join('')+'</tr>'});
 h+='<tr class="tot"><td class="l" colspan="3">TOTAL</td><td>'+num(tv('unik'),0)+'</td><td>'+num(tv('p80'),0)+'</td><td>'+num(tv('p50'),0)+'</td>'+
  SLN.map(function(n,j){return'<td>'+num(slTot[j],0)+'</td>'}).join('')+'</tr></tbody></table></div>';
 return h}
function home(){
 var h='<div class="hero"><div><h1>Rekap Presensi Sekolah Lapang</h1><p class="sub">CISU 2 • OR 2026</p><div class="facts" style="margin-top:14px">'+
  '<div class="fact"><small>Kabupaten</small><b>'+kabs.length+'</b></div><div class="fact"><small>Desa</small><b>'+B.length+'</b></div><div class="fact"><small>Pertemuan SL</small><b>'+SLN.length+'</b></div></div></div>'+
  '<div class="score"><small>Petani (nama unik)</small><b>'+num(tv('unik'),0)+'</b><small>di '+B.length+' desa</small></div></div>'+
  '<div class="kv"><div><small>'+esc(L80)+'</small><b>'+num(tv('p80'),0)+'</b></div><div><small>'+esc(L50)+'</small><b>'+num(tv('p50'),0)+'</b></div><div><small>Total kehadiran SL 1–'+SLN.length+'</small><b>'+num(kehadiran,0)+'</b></div></div>'+
  '<h2 class="sec">Pilih desa</h2><div class="filt" id="filt">'+
  ['Semua'].concat(kabs).map(function(k){return'<button type="button" class="fb'+(k===filt?' on':'')+'" data-k="'+esc(k)+'">'+esc(k)+'</button>'}).join('')+
  '<input class="srch" id="srch" type="search" placeholder="Cari desa / kecamatan…" value="'+esc(q)+'"></div>'+
  '<div id="cards">'+cards()+'</div>'+
  '<h2 class="sec">Tabel rekap lengkap</h2>'+table()+
  '<p class="note">Angka “–” pada SL berarti belum ada kehadiran tercatat (0 atau kosong di Excel). Warna batang = kabupaten; tinggi batang = persen kehadiran terhadap petani nama unik desa tersebut.</p>';
 app.innerHTML=h;
 document.getElementById('filt').onclick=function(e){var b=e.target.closest('.fb');if(!b)return;filt=b.getAttribute('data-k');
  [].forEach.call(this.querySelectorAll('.fb'),function(x){x.classList.toggle('on',x===b)});document.getElementById('cards').innerHTML=cards()};
 document.getElementById('srch').oninput=function(){q=this.value.trim().toLowerCase();document.getElementById('cards').innerHTML=cards()}}
function detail(i){var r=B[i];if(!r)return home();
 var pv=B[i-1],nx=B[i+1],na='<b class="na">belum ada data</b>',hd=held(r);
 var vals=r.sl.filter(function(v){return v>0}),avg=vals.length?vals.reduce(function(a,b){return a+b},0)/vals.length:null;
 var h='<div class="crumb"><a href="#/">Beranda</a> › '+esc(r.kab)+' › '+esc(r.desa)+'</div>'+
  '<h1>'+esc(r.desa)+(r.tambahan?' <span class="chip tb" style="vertical-align:middle">'+esc(r.tambahan)+'</span>':'')+'</h1><p class="sub">Kecamatan '+esc(r.kec)+' • Kabupaten '+esc(r.kab)+'</p>'+
  '<div class="box"><h3>Ringkasan peserta</h3><div class="kv">'+
  '<div><small>'+esc(LU)+'</small><b>'+num(r.unik,0)+'</b></div>'+
  '<div><small>'+esc(L80)+'</small>'+(r.p80==null?na:'<b>'+num(r.p80,0)+'</b>')+'</div>'+
  '<div><small>'+esc(L50)+'</small>'+(r.p50==null?na:'<b>'+num(r.p50,0)+'</b>')+'</div>'+
  '<div><small>SL yang sudah berjalan</small><b>'+hd+' dari '+SLN.length+'</b></div>'+
  '<div><small>Rata-rata hadir per SL</small>'+(avg==null?na:'<b>'+num(avg,1)+'</b>')+'</div></div></div>'+
  '<div class="box" style="--c:'+kc[r.kab]+'"><h3>Kehadiran per Sekolah Lapang</h3>'+bars(r,true)+
  '<p class="note">Angka di atas batang = jumlah petani hadir; persen = terhadap '+num(r.unik,0)+' petani nama unik.</p></div>'+
  '<div class="nav">'+(pv?'<a class="btn ghost" href="#/d/'+(i-1)+'">← '+esc(pv.desa)+'</a>':'<span class="btn ghost" aria-disabled="true">←</span>')+
  '<a class="btn" href="#/">Semua desa</a>'+
  (nx?'<a class="btn ghost" href="#/d/'+(i+1)+'">'+esc(nx.desa)+' →</a>':'<span class="btn ghost" aria-disabled="true">→</span>')+'</div>';
 app.innerHTML=h;window._nav={pr:pv&&'#/d/'+(i-1),nx:nx&&'#/d/'+(i+1)}}

var RAW=window.RAW||[];
function csv(rows){var w=0;rows.forEach(function(r){if(r.length>w)w=r.length});
 return 'sep=,\r\n'+rows.map(function(r){var o=[];for(var i=0;i<w;i++){var v=r[i];v=v==null?'':String(v);o.push(/[",\r\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v)}return o.join(',')}).join('\r\n')}
function colL(n){var s='';while(n>0){var m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26)}return s}
function rawView(i,qq){var sh=RAW[i];if(!sh)return rawHome();
 var rows=sh.baris,w=0;rows.forEach(function(r){if(r.length>w)w=r.length});
 var ql=(qq||'').toLowerCase();
 var h='<h1>Raw Data</h1><p class="sub">Isi sheet apa adanya dari file Excel. Pilih sheet, lihat, lalu unduh.</p><div class="rawc">'+
  RAW.map(function(s,x){return'<a class="fb'+(x===i?' on':'')+'" href="#/raw/'+x+'">'+esc(s.nama)+'</a>'}).join('')+'</div>'+
  '<div class="box"><h3>'+esc(sh.nama)+' • '+rows.length+' baris × '+w+' kolom</h3>'+
  '<div class="rawt"><input class="srch" id="rsrch" type="search" placeholder="Cari di sheet ini…" value="'+esc(qq||'')+'">'+
  '<button class="btn" id="dlCsv" type="button">Unduh CSV sheet ini</button>'+
  (D.sumber?'<a class="btn ghost" href="'+esc(encodeURIComponent(D.sumber))+'" download>Unduh Excel lengkap (.xlsx)</a>':'')+'</div>'+
  '<div class="rawwrap"><table class="rawtab"><thead><tr><th class="rn"></th>';
 for(var c=1;c<=w;c++)h+='<th>'+colL(c)+'</th>';
 h+='</tr></thead><tbody id="rbody">'+rawRows(rows,w,ql)+'</tbody></table></div>'+
  '<p class="note">Kolom A, B, C… dan nomor baris sama dengan di Excel. File CSV dibuka langsung dengan Excel.</p></div>';
 app.innerHTML=h;
 document.getElementById('rsrch').oninput=function(){document.getElementById('rbody').innerHTML=rawRows(rows,w,this.value.trim().toLowerCase())};
 document.getElementById('dlCsv').onclick=function(){
  var blob=new Blob(['﻿'+csv(rows)],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=sh.nama.replace(/[\\\/:*?"<>|]/g,'_').trim()+'.csv';document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)}}
function rawRows(rows,w,ql){var h='';
 rows.forEach(function(r,ri){
  if(ql&&r.join('\u0001').toLowerCase().indexOf(ql)<0)return;
  h+='<tr><td class="rn">'+(ri+1)+'</td>';
  for(var c=0;c<w;c++){var v=r[c];h+='<td'+(typeof v==='number'?' class="n"':'')+'>'+(v==null?'':esc(typeof v==='number'?num(v,6):v))+'</td>'}
  h+='</tr>'});
 return h||'<tr><td class="rn"></td><td colspan="'+(w||1)+'">Tidak ada baris yang cocok.</td></tr>'}
function rawHome(){if(!RAW.length){app.innerHTML='<div class="empty">Raw data belum ada. Jalankan PERBARUI DATA.bat.</div>';return}rawView(0)}
function route(){window._nav=null;var m=(location.hash||'#/').split('/');window.scrollTo(0,0);
 document.getElementById('mHome').classList.toggle('on',m[1]!=='raw');document.getElementById('mRaw').classList.toggle('on',m[1]==='raw');
 if(m[1]==='raw'){if(m[2]!=null&&m[2]!=='')rawView(parseInt(m[2],10));else rawHome()}else if(m[1]==='d'&&m[2]!=null&&m[2]!=='')detail(parseInt(m[2],10));else home()}
window.addEventListener('hashchange',route);route();
document.getElementById('printBtn').onclick=function(){window.print()};
document.getElementById('ft').textContent='Sumber data: '+(D.sumber||'-')+' (sheet “Tab all”) • Diperbarui '+(D.diperbarui||'-');
document.addEventListener('keydown',function(e){if(!window._nav||/INPUT/.test((e.target||{}).tagName||''))return;
 if(e.key==='ArrowLeft'&&window._nav.pr)location.hash=window._nav.pr;if(e.key==='ArrowRight'&&window._nav.nx)location.hash=window._nav.nx});
})();
