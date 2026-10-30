$ErrorActionPreference = 'Stop'
$zip = $null
$fs = $null
try {
  Add-Type -AssemblyName System.IO.Compression
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $root = Split-Path -Parent $MyInvocation.MyCommand.Path
  $inv = [System.Globalization.CultureInfo]::InvariantCulture

  # --- cari file Excel ---
  $xlsx = $null
  $cfg = Join-Path $root 'lokasi_excel.txt'
  if (Test-Path -LiteralPath $cfg) {
    $p = ([System.IO.File]::ReadAllText($cfg)).Trim().Trim('"')
    if ($p -ne '') { $xlsx = $p }
  }
  if (-not $xlsx) {
    $f = Get-ChildItem -LiteralPath $root -Filter '*.xlsx' -File | Where-Object { $_.Name -notlike '~$*' } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $f) { throw 'Tidak ada file Excel (.xlsx) di folder ini.' }
    $xlsx = $f.FullName
  }
  if (-not (Test-Path -LiteralPath $xlsx)) { throw ('File Excel tidak ditemukan: ' + $xlsx) }

  # --- buka xlsx (boleh sedang terbuka di Excel) ---
  $fs = New-Object System.IO.FileStream($xlsx, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
  $zip = New-Object System.IO.Compression.ZipArchive($fs, [System.IO.Compression.ZipArchiveMode]::Read)

  function ReadEntry($z, [string]$n) {
    $e = $z.GetEntry($n)
    if (-not $e) { return $null }
    $sr = New-Object System.IO.StreamReader($e.Open(), [System.Text.Encoding]::UTF8)
    try { return $sr.ReadToEnd() } finally { $sr.Dispose() }
  }
  function Q($s) {
    if ($null -eq $s) { return 'null' }
    $s = [string]$s
    $s = $s.Replace('\', '\\').Replace('"', '\"').Replace("`r", ' ').Replace("`n", ' ').Replace("`t", ' ')
    return '"' + $s + '"'
  }
  function ColName([int]$n) {
    $s = ''
    while ($n -gt 0) { $m = ($n - 1) % 26; $s = ([string][char](65 + $m)) + $s; $n = [int][math]::Floor(($n - 1) / 26) }
    return $s
  }

  # --- daftar sheet (nama -> file xml) ---
  $wb = [xml](ReadEntry $zip 'xl/workbook.xml')
  $rels = [xml](ReadEntry $zip 'xl/_rels/workbook.xml.rels')
  $relMap = @{}
  foreach ($r in $rels.GetElementsByTagName('Relationship')) { $relMap[$r.GetAttribute('Id')] = $r.GetAttribute('Target') }
  $sheetList = @()
  foreach ($s in $wb.GetElementsByTagName('sheet')) {
    $tg = [string]$relMap[$s.GetAttribute('id', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')]
    $tg = $tg.TrimStart('/')
    if (-not $tg.StartsWith('xl/')) { $tg = 'xl/' + $tg }
    $sheetList += , @($s.GetAttribute('name'), $tg)
  }
  $tabTarget = $null
  foreach ($x in $sheetList) { if ($x[0].Trim() -eq 'Tab all') { $tabTarget = $x[1] } }
  if (-not $tabTarget) { throw 'Sheet "Tab all" tidak ditemukan di file Excel.' }

  # --- shared strings ---
  $ss = New-Object System.Collections.ArrayList
  $sx = ReadEntry $zip 'xl/sharedStrings.xml'
  if ($sx) {
    $sd = [xml]$sx
    foreach ($si in $sd.GetElementsByTagName('si')) {
      $txt = ''
      foreach ($t in $si.GetElementsByTagName('t')) {
        if ($t.ParentNode.LocalName -ne 'rPh') { $txt += $t.InnerText }
      }
      [void]$ss.Add($txt)
    }
  }

  # --- style: tandai format tanggal ---
  $isDateXf = @{}
  $stx = ReadEntry $zip 'xl/styles.xml'
  if ($stx) {
    $st = [xml]$stx
    $custom = @{}
    foreach ($nf in $st.GetElementsByTagName('numFmt')) { $custom[[int]$nf.GetAttribute('numFmtId')] = $nf.GetAttribute('formatCode') }
    $xfNodes = $st.SelectSingleNode("//*[local-name()='cellXfs']")
    $xi = 0
    if ($xfNodes) {
      foreach ($xf in $xfNodes.ChildNodes) {
        $id = [int]$xf.GetAttribute('numFmtId')
        $d = $false
        if (($id -ge 14 -and $id -le 22) -or ($id -ge 45 -and $id -le 47)) { $d = $true }
        elseif ($custom.ContainsKey($id)) {
          $code = [regex]::Replace($custom[$id], '"[^"]*"|\[[^\]]*\]|\\.', '')
          if ($code -match '[dmyhs]') { $d = $true }
        }
        $isDateXf[$xi] = $d
        $xi++
      }
    }
  }

  # --- baca semua sel satu sheet ---
  function LoadCells([string]$path) {
    $res = @{}
    $sh = [xml](ReadEntry $zip $path)
    foreach ($c in $sh.GetElementsByTagName('c')) {
      $ref = $c.GetAttribute('r')
      $t = $c.GetAttribute('t')
      $val = $null
      if ($t -eq 'inlineStr') { $val = $c.InnerText }
      else {
        $vn = $c.SelectSingleNode("*[local-name()='v']")
        if ($null -ne $vn) {
          $raw = $vn.InnerText
          if ($t -eq 's') { $val = [string]$ss[[int]$raw] }
          elseif ($t -eq 'str') { $val = $raw }
          elseif ($t -eq 'e' -or $t -eq 'b') { $val = $raw }
          else {
            $val = [double]::Parse($raw, $inv)
            $sidx = $c.GetAttribute('s')
            if ($sidx -ne '' -and $isDateXf.ContainsKey([int]$sidx) -and $isDateXf[[int]$sidx]) {
              $dt = [datetime]::FromOADate($val)
              if ($dt.TimeOfDay.TotalSeconds -gt 0) { $val = $dt.ToString('yyyy-MM-dd HH:mm', $inv) } else { $val = $dt.ToString('yyyy-MM-dd', $inv) }
            }
          }
        }
      }
      if ($null -ne $val) { $res[$ref] = $val }
    }
    return $res
  }
  $cells = LoadCells $tabTarget
  function CV([int]$col, [int]$row) {
    if ($col -lt 1) { return $null }
    $k = (ColName $col) + $row
    if ($cells.ContainsKey($k)) { return $cells[$k] }
    return $null
  }
  function NumJ($col, [int]$row) {
    if (-not $col) { return 'null' }
    $v = CV $col $row
    if ($v -is [double]) { return $v.ToString('R', $inv) }
    return 'null'
  }

  # --- cari baris judul (Kabupaten) ---
  $hr = 0; $hc = 0
  for ($r = 1; $r -le 60 -and $hr -eq 0; $r++) {
    for ($c = 1; $c -le 40; $c++) {
      $v = CV $c $r
      if (($v -is [string]) -and ($v.Trim() -ieq 'Kabupaten')) { $hr = $r; $hc = $c; break }
    }
  }
  if ($hr -eq 0) { throw 'Judul kolom "Kabupaten" tidak ditemukan di sheet "Tab all".' }

  $cKab = $null; $cDesa = $null; $cKec = $null; $cUnik = $null; $c80 = $null; $c50 = $null
  $hUnik = 'Farmers counted as unique name'; $h80 = 'Participants who 80% attendance the SL'; $h50 = 'Participants who 50% attendance the SL'
  $slCols = @()
  for ($c = $hc; $c -le $hc + 25; $c++) {
    $h = CV $c $hr
    if ($h -isnot [string]) { continue }
    $h = $h.Trim()
    if ($h -ieq 'Kabupaten') { $cKab = $c }
    elseif ($h -ieq 'Desa') { $cDesa = $c }
    elseif ($h -ieq 'Kecamatan') { $cKec = $c }
    elseif ($h -like 'Farmers*') { $cUnik = $c; $hUnik = $h }
    elseif ($h -like '*80%*') { $c80 = $c; $h80 = $h }
    elseif ($h -like '*50%*') { $c50 = $c; $h50 = $h }
    elseif ($h -match '^SL\s*\d+$') { $slCols += , @($c, $h) }
  }
  if (-not $cDesa -or -not $cKec -or -not $cUnik) { throw 'Kolom Desa / Kecamatan / Farmers counted tidak lengkap.' }

  # --- baca baris data ---
  $rows = @()
  $totJ = 'null'
  $n = 0
  for ($r = $hr + 1; $r -le $hr + 60; $r++) {
    $kab = CV $cKab $r
    if (($kab -isnot [string]) -or ($kab.Trim() -eq '')) { break }
    $sl = @()
    foreach ($s in $slCols) { $sl += (NumJ $s[0] $r) }
    $nums = '"unik":' + (NumJ $cUnik $r) + ',"p80":' + (NumJ $c80 $r) + ',"p50":' + (NumJ $c50 $r) + ',"sl":[' + ($sl -join ',') + ']'
    if ($kab.Trim() -ieq 'TOTAL') { $totJ = '{' + $nums + '}'; continue }
    $tb = $null
    $tv = CV ($hc - 1) $r
    if (($tv -is [string]) -and ($tv.Trim() -ne '')) { $tb = $tv.Trim() }
    $rows += ('{"kab":' + (Q $kab.Trim()) + ',"desa":' + (Q ((CV $cDesa $r))) + ',"kec":' + (Q ((CV $cKec $r))) + ',"tambahan":' + (Q $tb) + ',' + $nums + '}')
    $n++
  }
  if ($n -eq 0) { throw 'Tidak ada baris desa yang terbaca.' }

  $slNama = @()
  foreach ($s in $slCols) { $slNama += (Q $s[1]) }
  $now = Get-Date -Format 'dd/MM/yyyy HH:mm'
  $out = 'window.DATA={' + "`n" +
    '"sumber":' + (Q (Split-Path $xlsx -Leaf)) + ',' + "`n" +
    '"diperbarui":' + (Q $now) + ',' + "`n" +
    '"kolom":{"unik":' + (Q $hUnik) + ',"p80":' + (Q $h80) + ',"p50":' + (Q $h50) + '},' + "`n" +
    '"slNama":[' + ($slNama -join ',') + '],' + "`n" +
    '"baris":[' + "`n" + ($rows -join ",`n") + "`n" + '],' + "`n" +
    '"total":' + $totJ + "`n" + '};'
  # --- raw data: semua sheet mulai "SRP Geneng" sampai sheet terakhir ---
  $rawParts = @()
  $started = $false
  foreach ($x in $sheetList) {
    if ($x[0].Trim() -like 'SRP Geneng*') { $started = $true }
    if (-not $started) { continue }
    if ($x[0].Trim() -eq 'Tab all') { continue }
    $cl = LoadCells $x[1]
    $byRow = @{}
    $maxR = 0; $maxC = 0
    foreach ($k in $cl.Keys) {
      if ($k -match '^([A-Z]+)(\d+)$') {
        $cn = 0
        foreach ($ch in $Matches[1].ToCharArray()) { $cn = $cn * 26 + ([int]$ch - 64) }
        $rn = [int]$Matches[2]
        if (-not $byRow.ContainsKey($rn)) { $byRow[$rn] = @{} }
        $byRow[$rn][$cn] = $cl[$k]
        if ($rn -gt $maxR) { $maxR = $rn }
        if ($cn -gt $maxC) { $maxC = $cn }
      }
    }
    $lines = @()
    for ($rn = 1; $rn -le $maxR; $rn++) {
      $items = @()
      if ($byRow.ContainsKey($rn)) {
        $last = 0
        foreach ($cn in $byRow[$rn].Keys) { if ($cn -gt $last) { $last = $cn } }
        for ($cn = 1; $cn -le $last; $cn++) {
          $v = $byRow[$rn][$cn]
          if ($null -eq $v) { $items += 'null' }
          elseif ($v -is [double]) { $items += ([math]::Round($v, 8)).ToString('R', $inv) }
          else { $items += (Q $v) }
        }
      }
      $lines += ('[' + ($items -join ',') + ']')
    }
    $rawParts += ('{"nama":' + (Q $x[0].Trim()) + ',"baris":[' + "`n" + ($lines -join ",`n") + "`n" + ']}')
  }
  $rawOut = 'window.RAW=[' + "`n" + ($rawParts -join ",`n") + "`n" + '];'
  [System.IO.File]::WriteAllText((Join-Path $root 'assets\raw.js'), $rawOut, (New-Object System.Text.UTF8Encoding($false)))

  $outPath = Join-Path $root 'assets\data.js'
  [System.IO.File]::WriteAllText($outPath, $out, (New-Object System.Text.UTF8Encoding($false)))
  Write-Host ''
  Write-Host ('SELESAI: ' + $n + ' desa dan ' + $rawParts.Count + ' sheet raw data dibaca dari ' + (Split-Path $xlsx -Leaf))
  Write-Host 'Buka atau refresh index.html untuk melihat hasilnya.'
}
catch {
  Write-Host ''
  Write-Host 'TERJADI KESALAHAN:' -ForegroundColor Red
  Write-Host $_.Exception.Message
}
finally {
  if ($zip) { $zip.Dispose() }
  if ($fs) { $fs.Dispose() }
}
