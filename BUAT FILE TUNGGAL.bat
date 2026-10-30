@echo off
chcp 65001 >nul
title Buat File Tunggal - Website Bukti Kampung Pancasila
set "SELF=%~f0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$m='#'+'#'; $on=$false; $ps=''; foreach($l in [IO.File]::ReadLines($env:SELF)){ if($l.StartsWith($m+'DATA')){break}; if($on){$ps+=$l+[Environment]::NewLine}; if($l.StartsWith($m+'PS1')){$on=$true} }; iex $ps"
echo.
pause
exit /b
##PS1##
$ErrorActionPreference='Stop'
try{
Add-Type -AssemblyName System.IO.Compression
$root=Split-Path -Parent $env:SELF
$parent=Split-Path -Parent $root
$outPath=Join-Path $parent 'Buka Website Bukti Kampung Pancasila.bat'
Write-Host ''
Write-Host ' Membuat FILE TUNGGAL dari folder website ini...'
$upd=Join-Path $root 'Perbarui Website.ps1'
if(Test-Path -LiteralPath $upd){
  Write-Host ' Memperbarui daftar foto bukti terlebih dahulu...'
  & powershell -NoProfile -ExecutionPolicy Bypass -File $upd | Out-Null
}
$files=@()
foreach($f in Get-ChildItem -LiteralPath $root -Recurse -File){
  $rel=$f.FullName.Substring($root.Length).TrimStart('\','/')
  if($rel -notmatch '[\\/]' -and $rel -ne 'index.html'){ continue }
  if($f.Extension -in '.bat','.ps1'){ continue }
  if($f.Name -eq 'BACA_DULU.txt' -or $f.Name -like '~$*'){ continue }
  $files+=,@($f.FullName,$rel.Replace('/','\'))
}
if($files.Count -eq 0){ throw 'Tidak ada file website ditemukan.' }
Write-Host (' Mengemas '+$files.Count+' file...')
$ms=New-Object IO.MemoryStream
$za=New-Object IO.Compression.ZipArchive($ms,[IO.Compression.ZipArchiveMode]::Create,$true)
$man=New-Object Text.StringBuilder
$i=0
foreach($x in $files){
  $i++; $k='f'+$i.ToString('0000')
  [void]$man.Append($k+"`t"+$x[1]+"`n")
  $en=$za.CreateEntry($k,[IO.Compression.CompressionLevel]::Optimal)
  $es=$en.Open(); $fs=[IO.File]::OpenRead($x[0]); $fs.CopyTo($es); $fs.Close(); $es.Close()
}
$en=$za.CreateEntry('manifest.txt')
$w=New-Object IO.StreamWriter($en.Open(),(New-Object Text.UTF8Encoding($false)))
$w.Write($man.ToString()); $w.Close()
$za.Dispose()
$bytes=$ms.ToArray()
$tpl=@'
@echo off
chcp 65001 >nul
title Website Bukti - Lomba Kampung Pancasila RW 04 Babatan Indah
echo.
echo  Menyiapkan website Bukti Pendukung... mohon tunggu sebentar.
set "SELF=%~f0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$m='#'+'#'; $on=$false; $ps=''; foreach($l in [IO.File]::ReadLines($env:SELF)){ if($l.StartsWith($m+'DATA')){break}; if($on){$ps+=$l+[Environment]::NewLine}; if($l.StartsWith($m+'PS1')){$on=$true} }; iex $ps"
if errorlevel 1 (
  echo.
  echo  Terjadi masalah saat membuka website. Hubungi pengirim file ini.
  pause
)
exit /b
##PS1##
$ErrorActionPreference='Stop'
try{
Add-Type -AssemblyName System.IO.Compression
$self=$env:SELF
$m='#'+'#'
$ms=New-Object IO.MemoryStream
$on=$false
foreach($l in [IO.File]::ReadLines($self)){
  if($on){ $t=$l.Trim(); if($t.Length -gt 0){ $b=[Convert]::FromBase64String($t); $ms.Write($b,0,$b.Length) } }
  elseif($l.StartsWith($m+'DATA')){ $on=$true }
}
if($ms.Length -lt 100){ throw 'Isi website tidak ditemukan di dalam file ini. Minta kirim ulang file .bat-nya.' }
$ms.Position=0
$zip=New-Object IO.Compression.ZipArchive($ms,[IO.Compression.ZipArchiveMode]::Read)
$name='Website Bukti Kampung Pancasila'
$dest=Join-Path (Split-Path -Parent $self) $name
try{
  New-Item -ItemType Directory -Force -Path $dest | Out-Null
  $probe=Join-Path $dest 'tulis.tmp'; [IO.File]::WriteAllText($probe,'x'); try{ Remove-Item -LiteralPath $probe -Force }catch{}
}catch{
  $dk=[Environment]::GetFolderPath('Desktop'); if(-not $dk){ $dk=[IO.Path]::GetTempPath() }
  $dest=Join-Path $dk $name
  New-Item -ItemType Directory -Force -Path $dest | Out-Null
}
$sr=New-Object IO.StreamReader($zip.GetEntry('manifest.txt').Open(),[Text.Encoding]::UTF8)
$map=[ordered]@{}
while(($ln=$sr.ReadLine()) -ne $null){ if($ln){ $p=$ln.Split("`t"); $map[$p[0]]=$p[1] } }
$sr.Close()
$sep=[string][IO.Path]::DirectorySeparatorChar
$full=[IO.Path]::GetFullPath($dest)
$rootp=$full.TrimEnd($sep)+$sep
$n=0
foreach($k in $map.Keys){
  $out=[IO.Path]::GetFullPath((Join-Path $full $map[$k].Replace('\',$sep)))
  if(-not $out.StartsWith($rootp,[StringComparison]::OrdinalIgnoreCase)){ continue }
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $out) | Out-Null
  $i=$zip.GetEntry($k).Open(); $o=[IO.File]::Create($out); $i.CopyTo($o); $o.Close(); $i.Close()
  $n++
}
$zip.Dispose()
Write-Host (' Selesai: '+$n+' file disiapkan di folder:')
Write-Host (' '+$full)
if(-not $env:NOOPEN){ try{ Start-Process -FilePath (Join-Path $full 'index.html') }catch{ Write-Host ' Buka file index.html di folder tersebut secara manual.' } }
}catch{
  Write-Host ''
  Write-Host (' GAGAL: '+$_.Exception.Message)
  exit 1
}
'@
$sw=New-Object IO.StreamWriter($outPath,$false,(New-Object Text.ASCIIEncoding))
$sw.NewLine="`r`n"
foreach($line in ($tpl -split "`r?`n")){ $sw.WriteLine($line) }
$sw.WriteLine('#'+'#DATA'+'##')
for($o=0;$o -lt $bytes.Length;$o+=3072){
  $len=[Math]::Min(3072,$bytes.Length-$o)
  $sw.WriteLine([Convert]::ToBase64String($bytes,$o,$len))
}
$sw.Close()
$mb=[Math]::Round((Get-Item -LiteralPath $outPath).Length/1MB,1)
Write-Host ''
Write-Host ' SELESAI. File tunggal sudah dibuat:'
Write-Host (' '+$outPath+'  ('+$mb+' MB)')
Write-Host ' Kirim file .bat itu saja. Penerima cukup klik dua kali.'
if(-not $env:NOOPEN){ try{ Start-Process explorer.exe ('/select,"'+$outPath+'"') }catch{} }
}catch{
  Write-Host ''
  Write-Host (' GAGAL: '+$_.Exception.Message)
  exit 1
}
