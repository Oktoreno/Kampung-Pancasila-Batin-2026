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
var XL=[];
function xtb(rs,mr,mc){var h='<table>';rs.slice(0,mr).forEach(function(r,i){h+='<tr>'+r.slice(0,mc).map(function(c){return(i===0?'<th>':'<td>')+esc(c)+(i===0?'</th>':'</td>')}).join('')+'</tr>'});return h+'</table>'}
function xtile(b){var i=XL.push(b)-1,u=enc(b.file),s=b.sheets[0];return'<div class="tile" data-xl="'+i+'"><div class="th xlp">'+xtb(s.r.filter(function(r){return r.some(function(c){return c!==''})}),9,7)+'<span class="bdg">XLSX'+(b.sheets.length>1?' · '+b.sheets.length+' sheet':'')+'</span></div><div class="cap"><b>'+esc(b.judul)+'</b><span>'+esc(b.ket)+'</span><a class="orig" href="'+u+'" target="_blank">Buka file asli</a></div></div>'}
function openXl(i,k){var b=XL[i];if(!b)return;k=k||0;var s=b.sheets[k];xm.querySelector('.xh b').textContent=b.judul;xm.querySelector('.xh a').href=enc(b.file);
xm.querySelector('.xt').innerHTML=b.sheets.length>1?b.sheets.map(function(x,j){return'<button type="button" data-k="'+j+'" class="'+(j===k?'on':'')+'">'+esc(x.n)+'</button>'}).join(''):'';
xm.querySelector('.xs').innerHTML=xtb(s.r,150,30)+(b.cut?'<p class="xn">Pratinjau dibatasi sampai 150 baris dan 30 kolom. Buka file asli untuk data lengkap.</p>':'');xm._i=i;xm.hidden=false;xm.querySelector('.xs').scrollTop=0}
var xm=document.createElement('div');xm.className='xm';xm.hidden=true;xm.innerHTML='<div class="xb"><div class="xh"><b></b><span><a class="btn ghost" target="_blank">Buka file asli</a><button class="xc" type="button" aria-label="Tutup">✕</button></span></div><div class="xt"></div><div class="xs"></div></div>';document.body.appendChild(xm);
xm.addEventListener('click',function(e){if(e.target===xm||e.target.closest('.xc')){xm.hidden=true;return}var t=e.target.closest('.xt button');if(t)openXl(xm._i,+t.getAttribute('data-k'))});
document.addEventListener('keydown',function(e){if(e.key==='Escape')xm.hidden=true});
function lbl(f){var m=/\.(pdf|pptx?|xlsx?)$/i.exec(f);if(!m)return'';var e=m[1].toLowerCase();return e==='pdf'?'PDF':e.charAt(0)==='p'?'PPT':'XLSX'}
function tiles(L){var h='<div class="ev">';L.forEach(function(b){var u=enc(b.file),pdf=!!lbl(b.file),lb=lbl(b.file);
h+=b.sheets&&b.sheets.length?xtile(b):pdf&&b.pages&&b.pages.length?'<div class="tile" data-u="'+enc(b.pages[0])+'" data-pg="'+b.pages.slice(1).map(enc).join('|')+'" data-t="'+esc(b.judul+' – '+b.ket)+'"><div class="th"><img src="'+enc(b.pages[0])+'" alt="'+esc(b.judul)+'" loading="lazy"><span class="bdg">'+lb+(b.pages.length>1?' · '+b.pages.length+' hlm':'')+'</span></div><div class="cap"><b>'+esc(b.judul)+'</b><span>'+esc(b.ket)+'</span><a class="orig" href="'+u+'" target="_blank">Buka file asli</a></div></div>':pdf?'<a class="tile" href="'+u+'" target="_blank"><div class="th"><span class="pdf">'+lb+'</span></div><div class="cap"><b>'+esc(b.judul)+'</b><span>'+esc(b.ket)+'</span></div></a>':'<div class="tile" data-u="'+u+'" data-t="'+esc(b.judul+' – '+b.ket)+'"><div class="th"><img src="'+u+'" alt="'+esc(b.judul)+'" loading="lazy"></div><div class="cap"><b>'+esc(b.judul)+'</b><span>'+esc(b.ket)+'</span></div></div>'});return h+'</div>'}
function nf(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.')}
function kpbars(rows,key){var m=Math.max.apply(null,rows.map(function(r){return r[key]||0}))||1;return rows.map(function(r){var v=r[key];return'<div class="gr"><span>RT 0'+r.rt+'</span><i><u style="width:'+(v==null?0:Math.round(v/m*100))+'%"></u></i><b>'+(v==null?'-':nf(v))+'</b></div>'}).join('')}
function cols(items,max,h,cls){return '<div class="cb '+(cls||'')+'" style="height:'+h+'px">'+items.map(function(it){var v=it.v||0;return'<div class="cc" title="'+esc(it.t||it.l)+'"><b>'+(it.show==null?nf(v):it.show)+'</b><div class="cs" style="height:'+Math.round(v/max*(h-34))+'px">'+(it.seg||'')+'</div></div>'}).join('')+'</div><div class="cx">'+items.map(function(it){return'<span>'+it.l+'</span>'}).join('')+'</div>'}
function kependudukan(){var P=window.PENDUDUK||[],K=window.KK||{};var rows=[1,2,3,4].map(function(n){var r=null;P.forEach(function(x){if(x.rt===n)r=x});r=r||{};return{rt:n,u:r.u||null,k:r.k||null,kk:r.kk,l:r.l,p:r.p,j:(r.j!=null)?r.j:((r.l==null&&r.p==null)?null:(r.l||0)+(r.p||0))}});
var CH=190;var any=rows.some(function(r){return r.kk!=null||r.j!=null});var h='<section class="kp"><h2>Data Kependudukan RW 04</h2>';
if(!any)h+='<div class="todo" style="margin:10px 0 0">Data belum diisi. Isi file <b>Data KK\\Rekap Penduduk.csv</b> lalu klik <b>PERBARUI WEBSITE.bat</b>.</div>';
else{var tk=0,tj=0,tl=0,tp=0;rows.forEach(function(r){tk+=r.kk||0;tj+=r.j||0;tl+=r.l||0;tp+=r.p||0});
h+='<div class="kt"><div><b>'+nf(tk)+'</b><span>KK</span></div><div><b>'+nf(tj)+'</b><span>jiwa</span></div><div><b class="cl">'+nf(tl)+'</b><span>laki-laki</span></div><div><b class="cp">'+nf(tp)+'</b><span>perempuan</span></div></div><div class="kpg">';
var mj=Math.max.apply(null,rows.map(function(r){return r.j||0}))||1;
var it1=rows.map(function(r){var l=r.l||0,pp=r.p||0,u=Math.max((r.j||0)-l-pp,0);var sc=function(v){return r.j?v/r.j*100:0};return{l:'RT 0'+r.rt+'<em>'+nf(r.kk||0)+' KK</em>',v:r.j,t:'RT 0'+r.rt+': '+nf(r.j||0)+' jiwa (L '+nf(l)+', P '+nf(pp)+')',seg:'<u class="sg1" style="height:'+sc(u)+'%"></u><u class="sg3" style="height:'+sc(pp)+'%"></u><u class="sg2" style="height:'+sc(l)+'%"></u>'}});
h+='<div class="kc"><small>Penduduk per RT &amp; jenis kelamin</small>'+cols(it1,mj,CH)+'<div class="lg"><i class="a"></i>Laki-laki<i class="b"></i>Perempuan'+(tl+tp<tj?'<i class="c"></i>Jenis kelamin belum diketahui':'')+'</div></div>';
var UL=['Balita<em>0-5</em>','SD<em>6-12</em>','SMP<em>13-15</em>','SMA<em>16-18</em>','Produktif<em>19-55</em>','Lansia<em>56+</em>'],KL=['Swasta','TNI/ Polri','IRT','PNS','Wiras- wasta','Pelajar','Belum bekerja','Lainnya'],KT=['Swasta (Karyawan Swasta)','TNI/Polri','Ibu Rumah Tangga','PNS','Wiraswasta','Pelajar/Mahasiswa','Belum/Tidak bekerja','Lainnya'];
function agg(key,n){var s=new Array(n).fill(0),any=false;rows.forEach(function(r){if(r[key]){any=true;r[key].forEach(function(v,i){s[i]+=v||0})}});return any?s:null}
var us=agg('u',6),ks=agg('k',8);
function sum(s){var t=0;s.forEach(function(v){t+=v});return t}
if(us){var mu=Math.max.apply(null,us)||1;h+='<div class="kc"><small>Kelompok usia</small>'+cols(us.map(function(v,i){return{l:UL[i],v:v}}),mu,CH,'one')+'</div>'}
if(ks){var mk=Math.max.apply(null,ks)||1;h+='<div class="kc wide"><small>Pekerjaan</small>'+cols(ks.map(function(v,i){return{l:KL[i],v:v,t:KT[i]+': '+nf(v)}}),mk,CH,'one jb')+'</div>'}
var PM=window.PEMUDA||[],pk=['j','b','k','w'],PL=['Jumlah pemuda','Bekerja','Kuliah','Wira- usaha'],pt=[0,0,0,0],pno=[];
PM.forEach(function(r){if(r.j==null){pno.push('RT 0'+r.rt);return}pk.forEach(function(k,i){pt[i]+=r[k]||0})});
if(PM.length&&pt[0]>0){var mp=Math.max.apply(null,pt)||1;h+='<div class="kc"><small>Pemuda &amp; pekerjaannya</small>'+cols(pt.map(function(v,i){var tp=PL[i].replace('- ','')+': '+nf(v);PM.forEach(function(r){if(r.j!=null)tp+=' | RT 0'+r.rt+': '+nf(r[pk[i]]||0)});return{l:PL[i],v:v,t:tp}}),mp,CH,'one pm')+'</div>'}
var nc=(h.match(/<div class="kc/g)||[]).length;if(nc>3)h=h.replace('<div class="kpg">','<div class="kpg k'+nc+'">');
h+='</div>'}
var docs=[1,2,3,4].filter(function(n){return K[n]&&K[n].length});
if(docs.length){h+='<h3 class="kh">Dokumen Data KK</h3>';docs.forEach(function(n){h+='<h4 class="kr">RT 0'+n+' <span>('+K[n].length+' dokumen)</span></h4>'+tiles(K[n])})}
return h+'</section>'}
function kb(){var L=window.KEBERLANJUTAN||[];var h='<div class="crumb"><a href="#/">Beranda</a> › Keberlanjutan Program</div><h1>Keberlanjutan Program</h1><p class="sub">Foto, dokumen PDF, dan paparan (PPT) tentang keberlanjutan program RW 04 Babatan Indah.</p>';
if(L.length)h+=tiles(L);else h+='<div class="todo">Belum ada file. Masukkan foto, PDF, atau PPT ke folder <b>Keberlanjutan Program</b>, lalu klik <b>PERBARUI WEBSITE.bat</b>.</div>';
app.innerHTML=h}
var TAMAN0=[{n:'Love Garden',f:'Love garden.jpeg',k:['Rapat warga','Tempat bermain anak','Tempat bersantai orang tua']},{n:'Taman Bewos',f:'Bewosen.jpeg',k:['Greenhouse','Diskusi orang tua','Tempat bermain','Lapangan sepak bola']},{n:'Taman Kebun Buah',f:'Taman Kebun Buah.jpeg',k:['Senam warga','Ditanami sayur','Ditanami tanaman obat keluarga (toga)']},{n:'Taman Lansia',f:'Taman Lansia.jpeg',k:['Senam lansia','Rapat','Tempat anak bermain']},{n:'Taman Volley',f:'Taman Volley.png',k:['Senam warga saat Posga','Berolahraga voli','Taman bermain anak']}];
function mkTaman(){var F=window.FASUM;if(!F||!F.length)return TAMAN0;var by={};TAMAN0.forEach(function(t){by[t.f]=t});var o=[],seen={};TAMAN0.forEach(function(t){F.forEach(function(x){if(x.f===t.f){o.push(t);seen[t.f]=1}})});F.forEach(function(x){if(!seen[x.f])o.push({n:x.f.replace(/\.[^.]+$/,''),f:x.f,k:[]})});return o}
var TAMAN=mkTaman();
function timg(t){return enc('Keunggulan Taman di Batin/'+t.f)}
function tm_page(){var h='<div class="crumb"><a href="#/">Beranda</a> › Fasilitas Umum</div><h1>Fasilitas Umum</h1><p class="sub">Klik foto untuk melihat lebih jelas.</p><div class="tmg">';
TAMAN.forEach(function(t,i){h+='<button type="button" class="tmc" data-tm="'+i+'"><img src="'+timg(t)+'" alt="'+esc(t.n)+'" loading="lazy"><span><b>'+esc(t.n)+'</b><small>'+(t.k.length?t.k.length+' keunggulan · ':'')+'klik untuk lihat</small></span></button>'});
app.innerHTML=h+'</div>'}
function tmtile(){return'<a class="peta fk" href="#/taman"><span class="fi" aria-hidden="true"><svg viewBox="0 0 64 48" width="64" height="48"><rect x="29" y="28" width="6" height="16" rx="2" fill="#8a5a2b"/><circle cx="32" cy="18" r="14" fill="#2f9e5b"/><circle cx="22" cy="24" r="9" fill="#3fb36d"/><circle cx="43" cy="24" r="9" fill="#3fb36d"/></svg></span><small>Keunggulan Taman</small></a>'}
var tmm=document.createElement('div');tmm.className='xm tmm';tmm.hidden=true;tmm.innerHTML='<div class="xb tmb"><div class="xh"><b></b><button class="xc" type="button" aria-label="Tutup">✕</button></div><div class="tmi"><img alt=""></div><div class="tmk"></div></div>';document.body.appendChild(tmm);
function openTm(i){var t=TAMAN[i];if(!t)return;tmm.querySelector('.xh b').textContent=t.n;var im=tmm.querySelector('img');im.src=timg(t);im.alt=t.n;tmm.querySelector('.tmk').innerHTML=!t.k.length?'':'<h3>Keunggulan</h3><ul>'+t.k.map(function(x){return'<li>'+esc(x)+'</li>'}).join('')+'</ul>';tmm.hidden=false}
tmm.addEventListener('click',function(e){if(e.target===tmm||e.target.closest('.xc'))tmm.hidden=true});
document.addEventListener('keydown',function(e){if(e.key==='Escape')tmm.hidden=true});
function tmstrip(){return'<div class="tms"><small>Fasilitas Umum</small><div>'+TAMAN.map(function(t,i){return'<button type="button" data-tm="'+i+'" title="'+esc(t.n)+'"><img src="'+timg(t)+'" alt="'+esc(t.n)+'"><span>'+esc(t.n)+'</span></button>'}).join('')+'</div></div>'}
function kbtile(){var L=window.KEBERLANJUTAN||[];var n=L.length;var im=L.filter(function(b){return /\.(jpe?g|png|webp|gif)$/i.test(b.file)});var pr=im.filter(function(b){return /produk|pameran/i.test(b.file)}),ot=im.filter(function(b){return pr.indexOf(b)<0});im=pr.concat(ot);var s=im.map(function(b,k){return'<img class="kbs'+(k?'':' on')+'" src="'+enc(b.file)+'" alt="">'}).join('');if(!s)s='<span class="fi" aria-hidden="true"><svg viewBox="0 0 64 48" width="64" height="48"><path d="M4 8a4 4 0 0 1 4-4h14l6 6h28a4 4 0 0 1 4 4v26a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#f08a24"/><path d="M4 16h56v22a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#f6a94f"/></svg></span>';return'<a class="peta fk kbp" href="#/keberlanjutan"><div class="kbw">'+s+'</div><small>Keberlanjutan Program'+(n?' · '+n+' file':'')+'</small></a>'}
(function(){if(window.__kbT)return;window.__kbT=setInterval(function(){var w=document.querySelector('.kbw');if(!w)return;var x=w.querySelectorAll('.kbs');if(x.length<2)return;var k=0;x.forEach(function(e,i){if(e.classList.contains('on'))k=i});x[k].classList.remove('on');x[(k+1)%x.length].classList.add('on')},3200)})();
function home(){
var h='<div class="hero"><div><h1>Bukti Pendukung Penilaian</h1><p class="sub">Lomba Kampung Pancasila Tahun 2026</p><div class="facts" style="margin-top:14px">'+
'<div class="fact"><small>Peserta</small><b>'+esc(D.peserta.nama)+'</b></div><div class="fact"><small>Jumlah RT</small><b>'+D.peserta.rt+'</b></div><div class="fact"><small>No. Registrasi</small><b>'+esc(D.peserta.reg)+'</b></div>'+tmstrip()+'</div></div>'+
'<div class="side">'+peta()+''+grafik()+'<div class="score"><div class="sc"><small>Nilai assessment</small><b>'+D.peserta.nilai+'</b></div><div class="sc"><small>Nilai Juri</small><b>'+NILAI_JURI+'</b></div></div>'+kbtile()+'</div></div>'+kependudukan()+'<h2 style="color:#12395b;margin-bottom:14px">Pilih pilar penilaian</h2><div class="grid">';
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
if(i.bukti.length){h+='<div class="ev">';i.bukti.forEach(function(b,x){var u=enc(b.file),pdf=!!lbl(b.file),lb=lbl(b.file);
h+=b.sheets&&b.sheets.length?xtile(b):pdf&&b.pages&&b.pages.length?'<div class="tile" data-u="'+enc(b.pages[0])+'" data-pg="'+b.pages.slice(1).map(enc).join('|')+'" data-t="'+esc(b.judul+' – '+b.ket)+'"><div class="th"><img src="'+enc(b.pages[0])+'" alt="'+esc(b.judul)+'" loading="lazy"><span class="bdg">'+lb+(b.pages.length>1?' · '+b.pages.length+' hlm':'')+'</span></div><div class="cap"><b>'+esc(b.judul)+'</b><span>'+esc(b.ket)+'</span><a class="orig" href="'+u+'" target="_blank">Buka file asli</a></div></div>':pdf?'<a class="tile" href="'+u+'" target="_blank"><div class="th"><span class="pdf">'+lb+'</span></div><div class="cap"><b>'+esc(b.judul)+'</b><span>'+esc(b.ket)+'</span></div></a>':
'<div class="tile" data-u="'+u+'" data-t="'+esc(b.judul+' – '+b.ket)+'"><div class="th"><img src="'+u+'" alt="'+esc(b.judul)+'" loading="lazy" onload="this.style.objectFit=this.naturalWidth>this.naturalHeight?\'contain\':\'cover\'"></div><div class="cap"><b>'+esc(b.judul)+'</b><span>'+esc(b.ket)+'</span></div></div>'});h+='</div>'}
else h+='<p class="sub">Bukti untuk indikator ini belum ditambahkan.</p>';
h+='</div>';
if(i.saran&&i.saran.length)h+='<div class="box todo"><h3>Bukti yang masih disarankan (catatan kerja)</h3><ul>'+i.saran.map(function(s){return'<li>'+esc(s)+'</li>'}).join('')+'</ul></div>';
h+='<p class="fold">Folder bukti: '+esc(i.folder)+'</p>';
h+='<div class="nav">'+(pr?'<a class="btn ghost" href="#/p/'+p.id+'/'+pr.no+'">← Indikator '+pr.no+'</a>':'<span class="btn ghost" aria-disabled="true">←</span>')+
'<button class="btn" onclick="window.print()" type="button">Cetak halaman</button>'+
(nx?'<a class="btn ghost" href="#/p/'+p.id+'/'+nx.no+'">Indikator '+nx.no+' →</a>':'<span class="btn ghost" aria-disabled="true">→</span>')+'</div>';
app.innerHTML=h;window._nav={pr:pr&&'#/p/'+p.id+'/'+pr.no,nx:nx&&'#/p/'+p.id+'/'+nx.no}}
function route(){XL.length=0;xm.hidden=true;tmm.hidden=true;window._nav=null;var m=(location.hash||'#/').split('/');window.scrollTo(0,0);
if(m[1]==='taman')tm_page();else if(m[1]==='keberlanjutan')kb();else if(m[1]==='p'&&m[2]&&m[3])ind(m[2],m[3]);else if(m[1]==='p'&&m[2])pilar(m[2]);else home()}
window.addEventListener('hashchange',route);route();
var lb=document.getElementById('lb'),lbi=document.getElementById('lbi'),lbs=lb.querySelector('.lbs'),lbc=document.getElementById('lbc');
function close(){lb.hidden=true;lbs.classList.remove('z')}
app.addEventListener('click',function(e){if(e.target.closest('a.orig'))return;var tt=e.target.closest('[data-tm]');if(tt){openTm(+tt.getAttribute('data-tm'));return}var xt=e.target.closest('[data-xl]');if(xt){openXl(+xt.getAttribute('data-xl'));return}var t=e.target.closest('[data-u]');if(!t)return;lbi.src=t.getAttribute('data-u');[].slice.call(lbs.querySelectorAll('img.x')).forEach(function(n){n.parentNode.removeChild(n)});var pg=t.getAttribute('data-pg');if(pg)pg.split('|').forEach(function(s){var im=document.createElement('img');im.className='x';im.src=s;lbs.appendChild(im)});lbc.textContent=t.getAttribute('data-t');lb.hidden=false;lbs.scrollTop=0});
lbs.addEventListener('click',function(){lbs.classList.toggle('z')});
lb.querySelector('.lbx').onclick=close;
document.addEventListener('keydown',function(e){if(e.key==='Escape')return close();if(!lb.hidden||!window._nav)return;if(e.key==='ArrowLeft'&&window._nav.pr)location.hash=window._nav.pr;if(e.key==='ArrowRight'&&window._nav.nx)location.hash=window._nav.nx});
})();
