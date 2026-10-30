$ErrorActionPreference = 'Stop'
try {
  $root = Split-Path -Parent $MyInvocation.MyCommand.Path
  $dataPath = Join-Path $root 'assets\data.js'
  $raw = [System.IO.File]::ReadAllText($dataPath, [System.Text.Encoding]::UTF8)
  $json = ($raw.Trim() -replace '^window\.DATA\s*=\s*', '') -replace ';\s*$', ''
  $data = $json | ConvertFrom-Json

  function Q([string]$s) {
    $s = $s.Replace('\', '\\').Replace('"', '\"').Replace("`r", ' ').Replace("`n", ' ').Replace("`t", ' ')
    return '"' + $s + '"'
  }

  $exts = @('.png', '.jpg', '.jpeg', '.webp', '.gif', '.pdf')

  # ---- Gambar dari PDF (Windows 10/11, tanpa program tambahan) ----
  $pdfDir = Join-Path $root 'assets\pdf'
  $pdfFail = @()
  $wrOk = $false
  try {
    Add-Type -AssemblyName System.Runtime.WindowsRuntime
    $null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
    $null = [Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime]
    $null = [Windows.Data.Pdf.PdfPageRenderOptions, Windows.Data.Pdf, ContentType = WindowsRuntime]
    $null = [Windows.Storage.Streams.InMemoryRandomAccessStream, Windows.Storage.Streams, ContentType = WindowsRuntime]
    $null = [Windows.Foundation.IAsyncAction, Windows.Foundation, ContentType = WindowsRuntime]
    $ext = [System.WindowsRuntimeSystemExtensions].GetMethods()
    $asTaskOp = @($ext | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
    $asTaskAct = @($ext | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction' })[0]
    $wrOk = $true
  } catch { $wrOk = $false }

  function AwaitOp($op, [Type]$t) {
    $task = $asTaskOp.MakeGenericMethod($t).Invoke($null, @($op))
    [void]$task.Wait(-1)
    return $task.Result
  }
  function AwaitAct($act) {
    $task = $asTaskAct.Invoke($null, @($act))
    [void]$task.Wait(-1)
  }

  function Get-PdfPages([string]$relFile, $fileInfo) {
    # Mengembalikan teks JSON  ,"pages":[...]  atau string kosong
    $md5 = [System.Security.Cryptography.MD5]::Create()
    $hash = ([BitConverter]::ToString($md5.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($relFile))) -replace '-', '').ToLower().Substring(0, 12)
    if (-not (Test-Path -LiteralPath $pdfDir)) { New-Item -ItemType Directory -Path $pdfDir | Out-Null }
    $existing = @(Get-ChildItem -LiteralPath $pdfDir -File -Filter ($hash + '_*.png') -ErrorAction SilentlyContinue)
    $fresh = ($existing.Count -gt 0) -and ((Get-Item -LiteralPath (Join-Path $pdfDir ($hash + '_1.png'))).LastWriteTime -ge $fileInfo.LastWriteTime)
    if (-not $fresh) {
      if (-not $wrOk) { $script:pdfFail += $relFile; return '' }
      try {
        foreach ($o in $existing) { Remove-Item -LiteralPath $o.FullName -Force }
        $sf = AwaitOp ([Windows.Storage.StorageFile]::GetFileFromPathAsync($fileInfo.FullName)) ([Windows.Storage.StorageFile])
        $doc = AwaitOp ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($sf)) ([Windows.Data.Pdf.PdfDocument])
        $n = [Math]::Min([int]$doc.PageCount, 12)
        for ($k = 0; $k -lt $n; $k++) {
          $page = $doc.GetPage($k)
          $ms = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
          $opt = New-Object Windows.Data.Pdf.PdfPageRenderOptions
          $opt.DestinationWidth = 1400
          AwaitAct ($page.RenderToStreamAsync($ms, $opt))
          $ms.Seek(0)
          $in = [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($ms)
          $fs = [System.IO.File]::Create((Join-Path $pdfDir ($hash + '_' + ($k + 1) + '.png')))
          $in.CopyTo($fs)
          $fs.Close(); $in.Close(); $ms.Dispose(); $page.Dispose()
        }
      } catch { $script:pdfFail += $relFile; return '' }
    }
    $pgs = @(Get-ChildItem -LiteralPath $pdfDir -File -Filter ($hash + '_*.png') | ForEach-Object {
      $num = [int]($_.BaseName.Split('_')[1]); New-Object psobject -Property @{ N = $num; Name = $_.Name } } | Sort-Object N)
    if ($pgs.Count -eq 0) { return '' }
    return ',"pages":[' + (($pgs | ForEach-Object { Q ('assets/pdf/' + $_.Name) }) -join ',') + ']'
  }
  $entries = @()
  $total = 0
  $filled = 0

  foreach ($p in $data.pilar) {
    foreach ($i in $p.indikator) {
      $rel = [string]$i.folder
      $dir = Join-Path $root ($rel -replace '/', '\')
      if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
      $items = @()
      $files = @(Get-ChildItem -LiteralPath $dir -File | Where-Object { $exts -contains $_.Extension.ToLower() } | Sort-Object Name)
      foreach ($f in $files) {
        $base = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)
        $judul = $base
        $ket = ''
        $txt = Join-Path $dir ($base + '.txt')
        if (Test-Path -LiteralPath $txt) {
          $lines = @([System.IO.File]::ReadAllLines($txt, [System.Text.Encoding]::UTF8) | Where-Object { $_.Trim() -ne '' })
          if ($lines.Count -ge 1) { $judul = $lines[0].Trim() }
          if ($lines.Count -ge 2) { $ket = (($lines | Select-Object -Skip 1) -join ' ').Trim() }
        }
        $pg = ''
        if ($f.Extension.ToLower() -eq '.pdf') { $pg = Get-PdfPages ($rel + '/' + $f.Name) $f }
        $items += ('{"file":' + (Q ($rel + '/' + $f.Name)) + ',"judul":' + (Q $judul) + ',"ket":' + (Q $ket) + $pg + '}')
        $total++
      }
      if ($items.Count -gt 0) { $filled++ }
      $entries += ('"' + $p.id + '/' + $i.no + '":[' + ($items -join ',') + ']')
    }
  }

  $petaDir = Join-Path $root 'Peta Batin'
  if (-not (Test-Path -LiteralPath $petaDir)) { New-Item -ItemType Directory -Path $petaDir | Out-Null }
  $petaItems = @()
  $petaFiles = @(Get-ChildItem -LiteralPath $petaDir -File | Where-Object { $exts -contains $_.Extension.ToLower() } | Sort-Object Name)
  foreach ($f in $petaFiles) {
    $base = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)
    $judul = $base
    $ket = ''
    $txt = Join-Path $petaDir ($base + '.txt')
    if (Test-Path -LiteralPath $txt) {
      $lines = @([System.IO.File]::ReadAllLines($txt, [System.Text.Encoding]::UTF8) | Where-Object { $_.Trim() -ne '' })
      if ($lines.Count -ge 1) { $judul = $lines[0].Trim() }
      if ($lines.Count -ge 2) { $ket = (($lines | Select-Object -Skip 1) -join ' ').Trim() }
    }
    $pg = ''
    if ($f.Extension.ToLower() -eq '.pdf') { $pg = Get-PdfPages ('Peta Batin/' + $f.Name) $f }
    $petaItems += ('{"file":' + (Q ('Peta Batin/' + $f.Name)) + ',"judul":' + (Q $judul) + ',"ket":' + (Q $ket) + $pg + '}')
  }

  # ---- Data KK: dokumen per RT dan rekap penduduk ----
  function Get-ItemsJson([string]$dir, [string]$relBase) {
    $res = @()
    $fl = @(Get-ChildItem -LiteralPath $dir -File | Where-Object { $exts -contains $_.Extension.ToLower() } | Sort-Object Name)
    foreach ($f in $fl) {
      $base = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)
      $judul = $base
      $ket = ''
      $txt = Join-Path $dir ($base + '.txt')
      if (Test-Path -LiteralPath $txt) {
        $lines = @([System.IO.File]::ReadAllLines($txt, [System.Text.Encoding]::UTF8) | Where-Object { $_.Trim() -ne '' })
        if ($lines.Count -ge 1) { $judul = $lines[0].Trim() }
        if ($lines.Count -ge 2) { $ket = (($lines | Select-Object -Skip 1) -join ' ').Trim() }
      }
      $pg = ''
      if ($f.Extension.ToLower() -eq '.pdf') { $pg = Get-PdfPages ($relBase + '/' + $f.Name) $f }
      $res += ('{"file":' + (Q ($relBase + '/' + $f.Name)) + ',"judul":' + (Q $judul) + ',"ket":' + (Q $ket) + $pg + '}')
    }
    return $res
  }
  $kkDir = Join-Path $root 'Data KK'
  $kkEntries = @()
  $kkTotal = 0
  foreach ($n in 1..4) {
    $rtName = 'RT 0' + $n
    $d = Join-Path $kkDir $rtName
    if (-not (Test-Path -LiteralPath $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
    $its = @(Get-ItemsJson $d ('Data KK/' + $rtName))
    $kkTotal += $its.Count
    $kkEntries += ('"' + $n + '":[' + ($its -join ',') + ']')
  }
  $pend = @()
  $csv = Join-Path $kkDir 'Rekap Penduduk.csv'
  if (Test-Path -LiteralPath $csv) {
    $csvLines = @([System.IO.File]::ReadAllLines($csv, [System.Text.Encoding]::UTF8) | Select-Object -Skip 1)
    foreach ($ln in $csvLines) {
      if ($ln.Trim() -eq '') { continue }
      $sep = ','
      if ($ln.Contains(';')) { $sep = ';' }
      $c = $ln.Split($sep)
      if ($c.Count -lt 5) { continue }
      $vals = @()
      foreach ($k in 0..18) {
        $t = ($c[$k] -replace '[^0-9]', '')
        if ($t -eq '') { $vals += 'null' } else { $vals += [string][int]$t }
      }
      if ($vals[0] -eq 'null') { continue }
      $pend += ('{"rt":' + $vals[0] + ',"kk":' + $vals[1] + ',"j":' + $vals[2] + ',"l":' + $vals[3] + ',"p":' + $vals[4] + ',"u":[' + ($vals[5..10] -join ',') + '],"k":[' + ($vals[11..18] -join ',') + ']}')
    }
  }

  $out = 'window.BUKTI={' + "`n" + ($entries -join ",`n") + "`n" + '};' + "`n" + 'window.PETA=[' + ($petaItems -join ',') + '];' + "`n" + 'window.KK={' + ($kkEntries -join ',') + '};' + "`n" + 'window.PENDUDUK=[' + ($pend -join ',') + '];'
  $outPath = Join-Path $root 'assets\bukti.js'
  [System.IO.File]::WriteAllText($outPath, $out, (New-Object System.Text.UTF8Encoding($false)))
  Write-Host ''
  Write-Host ('SELESAI: ' + $total + ' bukti pada ' + $filled + ' indikator, ' + $petaItems.Count + ' peta.')
  Write-Host ('Data KK: ' + $kkTotal + ' dokumen, ' + $pend.Count + ' baris rekap penduduk.')
  Write-Host 'Buka atau refresh index.html untuk melihat hasilnya.'
  if ($pdfFail.Count -gt 0) {
    Write-Host ''
    Write-Host ('PERHATIAN: ' + $pdfFail.Count + ' PDF belum bisa dijadikan gambar (tetap tampil sebagai kotak PDF):') -ForegroundColor Yellow
    $pdfFail | ForEach-Object { Write-Host (' - ' + $_) }
    Write-Host 'Solusi: buka PDF-nya, simpan/ekspor sebagai JPG atau PNG, lalu taruh di folder yang sama.'
  }
}
catch {
  Write-Host ''
  Write-Host 'TERJADI KESALAHAN:' -ForegroundColor Red
  Write-Host $_.Exception.Message
}
