Add-Type -AssemblyName System.Drawing

$width = 1200
$height = 630
$outputPath = Join-Path $PSScriptRoot "..\apps\web\public\og-image.png"

$bitmap = New-Object System.Drawing.Bitmap $width, $height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.Clear([System.Drawing.Color]::FromArgb(250, 249, 246))

function New-Font($family, $size, $style = [System.Drawing.FontStyle]::Regular) {
  return New-Object System.Drawing.Font($family, $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
}

function Draw-Rect($x, $y, $w, $h, $fill, $stroke = $null, $strokeWidth = 1) {
  $brush = New-Object System.Drawing.SolidBrush $fill
  $graphics.FillRectangle($brush, $x, $y, $w, $h)
  $brush.Dispose()

  if ($stroke -ne $null) {
    $pen = New-Object System.Drawing.Pen($stroke, $strokeWidth)
    $graphics.DrawRectangle($pen, $x, $y, $w, $h)
    $pen.Dispose()
  }
}

function Draw-Text($text, $font, $color, $x, $y, $w, $h) {
  $brush = New-Object System.Drawing.SolidBrush $color
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [System.Drawing.StringAlignment]::Near
  $format.LineAlignment = [System.Drawing.StringAlignment]::Near
  $graphics.DrawString($text, $font, $brush, [System.Drawing.RectangleF]::new($x, $y, $w, $h), $format)
  $format.Dispose()
  $brush.Dispose()
}

$black = [System.Drawing.Color]::FromArgb(10, 10, 10)
$muted = [System.Drawing.Color]::FromArgb(88, 88, 88)
$paper = [System.Drawing.Color]::FromArgb(255, 255, 255)
$soft = [System.Drawing.Color]::FromArgb(239, 238, 235)
$line = [System.Drawing.Color]::FromArgb(30, 30, 30)

$mono = "Consolas"
$sans = "Arial"

$brandFont = New-Font $mono 34 ([System.Drawing.FontStyle]::Bold)
$eyebrowFont = New-Font $mono 20 ([System.Drawing.FontStyle]::Bold)
$headlineFont = New-Font $sans 54 ([System.Drawing.FontStyle]::Bold)
$bodyFont = New-Font $sans 28 ([System.Drawing.FontStyle]::Regular)
$smallFont = New-Font $mono 18 ([System.Drawing.FontStyle]::Bold)
$tinyFont = New-Font $mono 15 ([System.Drawing.FontStyle]::Regular)
$metricFont = New-Font $sans 24 ([System.Drawing.FontStyle]::Bold)

Draw-Rect 0 0 $width $height $paper
Draw-Rect 0 0 $width 16 $black
Draw-Rect 52 48 1096 534 $paper $black 2
Draw-Rect 63 59 1096 534 $black
Draw-Rect 52 48 1096 534 $paper $black 2

Draw-Text "tracellm" $brandFont $black 82 78 260 48
Draw-Text "LLM OBSERVABILITY" $eyebrowFont $muted 82 156 340 34
Draw-Text "Understand what" $headlineFont $black 82 198 520 64
Draw-Text "your AI is doing." $headlineFont $black 82 258 560 66
Draw-Text "Trace prompts, spans, tokens, errors, and model calls in one workflow." $bodyFont $muted 86 350 500 104

Draw-Rect 82 500 144 46 $black $black 1
Draw-Text "NODE SDK" $smallFont $paper 108 513 100 22
Draw-Rect 242 500 126 46 $paper $black 2
Draw-Text "OTLP" $smallFont $black 281 513 76 22
Draw-Rect 386 500 156 46 $paper $black 2
Draw-Text "SIGNOZ" $smallFont $black 425 513 94 22

$dashX = 625
$dashY = 82
$dashW = 470
$dashH = 430
Draw-Rect ($dashX + 10) ($dashY + 10) $dashW $dashH $black
Draw-Rect $dashX $dashY $dashW $dashH $paper $black 2
Draw-Rect $dashX $dashY $dashW 64 $paper $black 2
Draw-Text "TRACE EXPLORER" $eyebrowFont $black ($dashX + 24) ($dashY + 22) 230 28
Draw-Rect ($dashX + 388) ($dashY + 18) 32 32 $black $black 1
Draw-Rect ($dashX + 430) ($dashY + 18) 32 32 $paper $black 2

Draw-Rect ($dashX + 24) ($dashY + 90) 422 84 $paper $black 1
Draw-Text "SESSION DETAIL" $tinyFont $muted ($dashX + 42) ($dashY + 108) 160 20
Draw-Text "OpenAI chatbot trace" $metricFont $black ($dashX + 42) ($dashY + 134) 260 34
Draw-Rect ($dashX + 318) ($dashY + 122) 70 28 $soft $null 1
Draw-Text "4.82s" $tinyFont $black ($dashX + 330) ($dashY + 128) 50 18
Draw-Rect ($dashX + 398) ($dashY + 122) 38 28 $black $black 1
Draw-Text "ok" $tinyFont $paper ($dashX + 408) ($dashY + 128) 22 18

Draw-Rect ($dashX + 24) ($dashY + 204) 422 224 $paper $black 1
Draw-Text "TIMELINE" $eyebrowFont $black ($dashX + 42) ($dashY + 224) 140 30

$rowY = $dashY + 270
foreach ($row in @(
  @{Name = "chat.workflow"; Detail = "started"; Dark = $false},
  @{Name = "retrieval.local-documents"; Detail = "4 docs"; Dark = $false},
  @{Name = "openai.chat.complete"; Detail = "27 tokens"; Dark = $true}
)) {
  if ($row.Dark) {
    Draw-Rect ($dashX + 42) $rowY 384 48 $black $black 1
    Draw-Text $row.Name $tinyFont $paper ($dashX + 64) ($rowY + 8) 210 18
    Draw-Text $row.Detail $tinyFont $paper ($dashX + 310) ($rowY + 8) 90 18
  } else {
    Draw-Rect ($dashX + 42) $rowY 384 48 $soft $black 1
    Draw-Text $row.Name $tinyFont $black ($dashX + 64) ($rowY + 8) 230 18
    Draw-Text $row.Detail $tinyFont $muted ($dashX + 310) ($rowY + 8) 90 18
  }
  $rowY += 62
}

$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$brandFont.Dispose()
$eyebrowFont.Dispose()
$headlineFont.Dispose()
$bodyFont.Dispose()
$smallFont.Dispose()
$tinyFont.Dispose()
$metricFont.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
