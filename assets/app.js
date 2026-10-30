(function(){
var D=window.DATA,app=document.getElementById('app'),mb=document.getElementById('modeBtn');
if(window.BUKTI)D.pilar.forEach(function(p){p.indikator.forEach(function(i){var b=window.BUKTI[p.id+'/'+i.no];if(b)i.bukti=b})});
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function enc(p){return p.split('/').map(encodeURIComponent).join('/')}
function pil(id){for(var i=0;i<D.pilar.length;i++)if(D.pilar[i].id===id)return D.pilar[i]}
function juri(on){document.body.classList.toggle('juri',on);mb.textContent='Mode Penjurian: '+(on?'Aktif':'Mati');try{localStorage.setItem('kp_juri',on?'1':'0')}catch(e){}}
try{juri(localStorage.getItem('kp_juri')==='1')}catch(e){}
mb.onclick=function(){juri(!document.body.classList.contains('juri'))};
function nb(p){var n=0;p.indikator.forEach(function(i){if(i.bukti.length)n++});return n}
function peta(){var P=window.PETA||[];if(!P.length)return'';return P.map(function(b){var u=enc(b.file);if(/\.pdf$/i.test(b.file)&&b.pages&&b.pages.length)return'<div class="peta" data-u="'+enc(b.pages[0])+'" data-pg="'+b.pages.slice(1).map(enc).join('|')+'" data-t="'+esc('Peta: '+b.judul+(b.ket?' – '+b.ket:''))+'"><img src="'+enc(b.pages[0])+'" alt="'+esc(b.judul)+'"><small>Peta: '+esc(b.judul)+'</small></div>';if(/\.pdf$/i.test(b.file))return'<a class="peta" href="'+u+'" target="_blank"><span class="pdf">PDF</span><small>Peta: '+esc(b.judul)+'</small></a>';return'<div class="peta" data-u="'+u+'" data-t="'+esc('Peta: '+b.judul+(b.ket?' – '+b.ket:''))+'"><img src="'+u+'" alt="'+esc(b.judul)+'"><small>Peta: '+esc(b.judul)+'</small></div>'}).join('')}
var NILAI_JURI='295';
var GRAFIK=[['CCTV',30],['Security',8],['Kebersihan',4]];
function grafik(){var m=Math.max.apply(null,GRAFIK.map(function(g){return g[1]}));return'<div class="graf"><small class="gt">Grafik</small>'+GRAFIK.map(function(g){return'<div class="gr"><span>'+esc(g[0])+'</span><i><u style="width:'+Math.round(g[1]/m*100)+'%"></u></i><b>'+g[1]+'</b></div>'}).join('')+'</div>'}
function tiles(L){var h='<div class="ev">';L.forEach(function(b){var u=enc(b.file),pdf=/\.pdf$/i.test(b.file);
h+=pdf&&b.pages&&b.pages.length?'<div class="tile" data-u="'+enc(b.pages[0])+'" data-pg="'+b.pages.slice(1).map(enc).join('|')+'" data-t="'+esc(b.judul+' – '+b.ket)+'"><div class="th"><img src="'+enc(b.pages[0])+'" alt="'+esc(b.judul)+'" loading="lazy"><span class="bdg">PDF'+(b.pages.length>1?' · '+b.pages.length+' hlm':'')+'</span></div><div class="cap"><b>'+esc(b.judul)+'</b><span>'+esc(b.ket)+'</span><a class="orig" href="'+u+'" target="_blank">Buka file PDF asli</a></div></div>':pdf?'<a class="tile" href="'+u+'" target="_blank"><div class="th"><span class="pdf">PDF</span></div><div class="cap"><b>'+esc(b.judul)+'</b><span>'+esc(b.ket)+'</span></div></a>':'<div class="tile" data-u="'+u+'" data-t="'+esc(b.judul+' – '+b.ket)+'"><div class="th"><img src="'+u+'" alt="'+esc(b.judul)+'" loading="lazy"></div><div class="cap"><b>'+esc(b.judul)+'</b><span>'+esc(b.ket)+'</span></div></div>'});return h+'</div>'}
function nf(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.')}
function kpbars(rows,key){var m=Math.max.apply(null,rows.map(function(r){return r[key]||0}))||1;return rows.map(function(r){var v=r[key];return'<div class="gr"><span>RT 0'+r.rt+'</span><i><u style="width:'+(v==null?0:Math.round(v/m*100))+'%"></u></i><b>'+(v==null?'-':nf(v))+'</b></div>'}).join('')}
function cols(items,max,h,cls){return '<div class="cb '+(cls||'')+'" style="height:'+h+'px">'+items.map(function(it){var v=it.v||0;return'<div class="cc" title="'+esc(it.t||it.l)+'"><b>'+(it.show==null?nf(v):it.show)+'</b><div class="cs" style="height:'+Math.round(v/max*(h-34))+'px">'+(it.seg||'')+'</div></div>'}).join('')+'</div><div class="cx">'+items.map(function(it){return'<span>'+it.l+'</span>'}).join('')+'</div>'}
function kependudukan(){var P=window.PENDUDUK||[],K=window.KK||{};var rows=[1,2,3,4].map(function(n){var r=null;P.forEach(function(x){if(x.rt===n)r=x});r=r||{};return{rt:n,u:r.u||null,k:r.k||null,kk:r.kk,l:r.l,p:r.p,j:(r.j!=null)?r.j:((r.l==null&&r.p==null)?null:(r.l||0)+(r.p||0))}});
var any=rows.some(function(r){return r.kk!=null||r.j!=null});var h='<section class="kp"><h2>Data Kependudukan RW 04</h2>';
if(!any)h+='<div class="todo" style="margin:10px 0 0">Data belum diisi. Isi file <b>Data KK\\Rekap Penduduk.csv</b> lalu klik <b>PERBARUI WEBSITE.bat</b>.</div>';
else{var tk=0,tj=0,tl=0,tp=0;rows.forEach(function(r){tk+=r.kk||0;tj+=r.j||0;tl+=r.l||0;tp+=r.p||0});
h+='<div class="kt"><div><b>'+nf(tk)+'</b><span>KK</span></div><div><b>'+nf(tj)+'</b><span>jiwa</span></div><div><b class="cl">'+nf(tl)+'</b><span>laki-laki</span></div><div><b class="cp">'+nf(tp)+'</b><span>perempuan</span></div></div><div class="kpg">';
var mj=Math.max.apply(null,rows.map(function(r){return r.j||0}))||1;
var it1=rows.map(function(r){var l=r.l||0,pp=r.p||0,u=Math.max((r.j||0)-l-pp,0);var sc=function(v){return r.j?v/r.j*100:0};return{l:'RT 0'+r.rt+'<em>'+nf(r.kk||0)+' KK</em>',v:r.j,t:'RT 0'+r.rt+': '+nf(r.j||0)+' jiwa (L '+nf(l)+', P '+nf(pp)+')',seg:'<u class="sg1" style="height:'+sc(u)+'%"></u><u class="sg3" style="height:'+sc(pp)+'%"></u><u class="sg2" style="height:'+sc(l)+'%"></u>'}});
h+='<div class="kc"><small>Penduduk per RT &amp; jenis kelamin</small>'+cols(it1,mj,190)+'<div class="lg"><i class="a"></i>Laki-laki<i class="b"></i>Perempuan'+(tl+tp<tj?'<i class="c"></i>Jenis kelamin belum diketahui':'')+'</div></div>';
var UL=['Balita<em>0-5</em>','SD<em>6-12</em>','SMP<em>13-15</em>','SMA<em>16-18</em>','Produktif<em>19-55</em>','Lansia<em>56+</em>'],KL=['Swasta','TNI/ Polri','IRT','PNS','Wiras- wasta','Pelajar','Belum bekerja','Lainnya'],KT=['Swasta (Karyawan Swasta)','TNI/Polri','Ibu Rumah Tangga','PNS','Wiraswasta','Pelajar/Mahasiswa','Belum/Tidak bekerja','Lainnya'];
function agg(key,n){var s=new Array(n).fill(0),any=false;rows.forEach(function(r){if(r[key]){any=true;r[key].forEach(function(v,i){s[i]+=v||0})}});return any?s:null}
var us=agg('u',6),ks=agg('k',8);
function sum(s){var t=0;s.forEach(function(v){t+=v});return t}
if(us){var mu=Math.max.apply(null,us)||1;h+='<div class="kc"><small>Kelompok usia</small>'+cols(us.map(function(v,i){return{l:UL[i],v:v}}),mu,190,'one')+(sum(us)<tj?'<small class="kn">Usia diketahui untuk '+nf(sum(us))+' dari '+nf(tj)+' jiwa</small>':'')+'</div>'}
if(ks){var mk=Math.max.apply(null,ks)||1;h+='<div class="kc wide"><small>Pekerjaan</small>'+cols(ks.map(function(v,i){return{l:KL[i],v:v,t:KT[i]+': '+nf(v)}}),mk,190,'one jb')+(sum(ks)<tj?'<small class="kn">Pekerjaan diketahui untuk '+nf(sum(ks))+' dari '+nf(tj)+' jiwa</small>':'')+'</div>'}
h+='</div>'}
var docs=[1,2,3,4].filter(function(n){return K[n]&&K[n].length});
if(docs.length){h+='<h3 class="kh">Dokumen Data KK</h3>';docs.forEach(function(n){h+='<h4 class="kr">RT 0'+n+' <span>('+K[n].length+' dokumen)</span></h4>'+tiles(K[n])})}
return h+'</section>'}
function home(){
var h='<div class="hero"><div><h1>Bukti Pendukung Penilaian</h1><p class="sub">Lomba Kampung Pancasila Tahun 2026</p><div class="facts" style="margin-top:14px">'+
'<div class="fact"><small>Peserta</small><b>'+esc(D.peserta.nama)+'</b></div><div class="fact"><small>Jumlah RT</small><b>'+D.peserta.rt+'</b></div><div class="fact"><small>No. Registrasi</small><b>'+esc(D.peserta.reg)+'</b></div></div></div>'+
'<div class="side">'+peta()+''+grafik()+'<div class="score"><div class="sc"><small>Nilai assessment</small><b>'+D.peserta.nilai+'</b></div><div class="sc"><small>Nilai Juri</small><b>'+NILAI_JURI+'</b></div></div></div></div>'+kependudukan()+'<h2 style="color:#12395b;margin-bottom:14px">Pilih pilar penilaian</h2><div class="grid">';
D.pilar.forEach(function(p){var n=nb(p),t=p.indikator.length;
h+='<a class="pc" style="--c:'+p.warna+'" href="#/p/'+p.id+'"><h2>'+esc(p.nama)+'</h2><p>'+esc(p.desk)+'</p><div class="stat"><span class="chip">'+t+' indikator</span><span class="chip '+(n?'ok':'warn')+'">'+n+' dengan bukti</span></div></a>'});
app.innerHTML=h+'</div>'}
function pilar(id){var p=pil(id);if(!p)return home();
var h='<div class="crumb"><a href="#/">Beranda</a> › '+esc(p.nama)+'</div><h1>'+esc(p.nama)+'</h1><p class="sub">'+esc(p.desk)+'</p><div class="list" style="--c:'+p.warna+'">';
p.indikator.forEach(function(i){var a=i.jawaban||i.sistem||'';
h+='<a class="ic" style="--c:'+p.warna+'" href="#/p/'+p.id+'/'+i.no+'"><div class="no">'+i.no+'</div><div class="t"><p>'+esc(i.teks)+'</p><small>'+esc(a)+(i.isian?' • Isian: '+esc(i.isian):'')+'</small></div><span class="chip '+(i.bukti.length?'ok':'warn')+'">'+(i.bukti.length?i.bukti.length+' bukti':'bukti belum ada')+'</span></a>'});
app.innerHTML=h+'</div>'}
function ind(id,no){var p=pil(id);if(!p)return home();var k=-1;p.indikator.forEach(function(i,x){if(i.no==no)k=x});if(k<0)return pilar(id);
var i=p.indikator[k],pr=p.indikator[k-1],nx=p.indikator[k+1];
var h='<div class="crumb"><a href="#/">Beranda</a> › <a href="#/p/'+p.id+'">'+esc(p.nama)+'</a> › Indikator '+i.no+'</div>'+
'<div style="display:flex;gap:16px;align-items:flex-start"><div class="no" style="background:'+p.warna+';width:52px;height:52px;font-size:22px;flex:none">'+i.no+'</div><h1>'+esc(i.teks)+'</h1></div>';
h+='<div class="box"><h3>Jawaban</h3>';
if(i.jawaban){h+='<div class="ans">'+esc(i.jawaban)+'</div>'}
else{h+='<div class="kv"><div><small>Data sistem</small><b>'+esc(i.sistem)+'</b></div>'+(i.isian?'<div><small>Isian RW 04</small><b>'+esc(i.isian)+'</b></div>':'')+'</div>'+(i.sumber?'<div class="src">'+esc(i.sumber)+'</div>':'')}
h+='</div><div class="box"><h3>Bukti pendukung ('+i.bukti.length+')</h3>';
if(i.bukti.length){h+='<div class="ev">';i.bukti.forEach(function(b,x){var u=enc(b.file),pdf=/\.pdf$/i.test(b.file);
h+=pdf&&b.pages&&b.pages.length?'<div class="tile" data-u="'+enc(b.pages[0])+'" data-pg="'+b.pages.slice(1).map(enc).join('|')+'" data-t="'+esc(b.judul+' – '+b.ket)+'"><div class="th"><img src="'+enc(b.pages[0])+'" alt="'+esc(b.judul)+'" loading="lazy"><span class="bdg">PDF'+(b.pages.length>1?' · '+b.pages.length+' hlm':'')+'</span></div><div class="cap"><b>'+esc(b.judul)+'</b><span>'+esc(b.ket)+'</span><a class="orig" href="'+u+'" target="_blank">Buka file PDF asli</a></div></div>':pdf?'<a class="tile" href="'+u+'" target="_blank"><div class="th"><span class="pdf">PDF</span></div><div class="cap"><b>'+esc(b.judul)+'</b><span>'+esc(b.ket)+'</span></div></a>':
'<div class="tile" data-u="'+u+'" data-t="'+esc(b.judul+' – '+b.ket)+'"><div class="th"><img src="'+u+'" alt="'+esc(b.judul)+'" loading="lazy" onload="this.style.objectFit=this.naturalWidth>this.naturalHeight?\'contain\':\'cover\'"></div><div class="cap"><b>'+esc(b.judul)+'</b><span>'+esc(b.ket)+'</span></div></div>'});h+='</div>'}
else h+='<p class="sub">Bukti untuk indikator ini belum ditambahkan.</p>';
h+='</div>';
if(i.saran&&i.saran.length)h+='<div class="box todo"><h3>Bukti yang masih disarankan (catatan kerja)</h3><ul>'+i.saran.map(function(s){return'<li>'+esc(s)+'</li>'}).join('')+'</ul></div>';
h+='<p class="fold">Folder bukti: '+esc(i.folder)+'</p>';
h+='<div class="nav">'+(pr?'<a class="btn ghost" href="#/p/'+p.id+'/'+pr.no+'">← Indikator '+pr.no+'</a>':'<span class="btn ghost" aria-disabled="true">←</span>')+
'<button class="btn" onclick="window.print()" type="button">Cetak halaman</button>'+
(nx?'<a class="btn ghost" href="#/p/'+p.id+'/'+nx.no+'">Indikator '+nx.no+' →</a>':'<span class="btn ghost" aria-disabled="true">→</span>')+'</div>';
app.innerHTML=h;window._nav={pr:pr&&'#/p/'+p.id+'/'+pr.no,nx:nx&&'#/p/'+p.id+'/'+nx.no}}
function route(){window._nav=null;var m=(location.hash||'#/').split('/');window.scrollTo(0,0);
if(m[1]==='p'&&m[2]&&m[3])ind(m[2],m[3]);else if(m[1]==='p'&&m[2])pilar(m[2]);else home()}
window.addEventListener('hashchange',route);route();
var lb=document.getElementById('lb'),lbi=document.getElementById('lbi'),lbs=lb.querySelector('.lbs'),lbc=document.getElementById('lbc');
function close(){lb.hidden=true;lbs.classList.remove('z')}
app.addEventListener('click',function(e){if(e.target.closest('a.orig'))return;var t=e.target.closest('[data-u]');if(!t)return;lbi.src=t.getAttribute('data-u');[].slice.call(lbs.querySelectorAll('img.x')).forEach(function(n){n.parentNode.removeChild(n)});var pg=t.getAttribute('data-pg');if(pg)pg.split('|').forEach(function(s){var im=document.createElement('img');im.className='x';im.src=s;lbs.appendChild(im)});lbc.textContent=t.getAttribute('data-t');lb.hidden=false;lbs.scrollTop=0});
lbs.addEventListener('click',function(){lbs.classList.toggle('z')});
lb.querySelector('.lbx').onclick=close;
document.addEventListener('keydown',function(e){if(e.key==='Escape')return close();if(!lb.hidden||!window._nav)return;if(e.key==='ArrowLeft'&&window._nav.pr)location.hash=window._nav.pr;if(e.key==='ArrowRight'&&window._nav.nx)location.hash=window._nav.nx});
})();
