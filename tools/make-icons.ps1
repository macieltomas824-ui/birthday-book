# ============================================================================
#  GENERADOR DE ICONOS  ·  tools/make-icons.ps1
# ============================================================================
#  Crea los PNG que usa el libro (favicon de Apple, iconos PWA y vista previa
#  al compartir). Solo necesita Windows PowerShell y System.Drawing.
#
#  Uso:
#      powershell -ExecutionPolicy Bypass -File tools/make-icons.ps1
#
#  Los archivos se guardan en assets/icons/. Puedes reemplazarlos por un logo
#  propio sin tocar el codigo: conserva los mismos nombres y tamanos.
# ============================================================================

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$root = [System.IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$outDir = Join-Path $root "assets\icons"
if (-not (Test-Path -LiteralPath $outDir)) {
  New-Item -ItemType Directory -Path $outDir | Out-Null
}

function New-Canvas([int]$width, [int]$height) {
  $bitmap = [System.Drawing.Bitmap]::new($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function New-Color([string]$hex, [int]$alpha = 255) {
  $clean = $hex.TrimStart("#")
  $r = [Convert]::ToInt32($clean.Substring(0, 2), 16)
  $g = [Convert]::ToInt32($clean.Substring(2, 2), 16)
  $b = [Convert]::ToInt32($clean.Substring(4, 2), 16)
  return [System.Drawing.Color]::FromArgb($alpha, $r, $g, $b)
}

function Get-HeartPath([single]$cx, [single]$cy, [single]$size) {
  $w = $size
  $h = $size * 0.92
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $path.StartFigure()
  $path.AddBezier(
    [single]$cx, [single]($cy + $h * 0.34),
    [single]($cx - $w * 0.70), [single]($cy - $h * 0.12),
    [single]($cx - $w * 0.52), [single]($cy - $h * 0.64),
    [single]$cx, [single]($cy - $h * 0.22)
  )
  $path.AddBezier(
    [single]$cx, [single]($cy - $h * 0.22),
    [single]($cx + $w * 0.52), [single]($cy - $h * 0.64),
    [single]($cx + $w * 0.70), [single]($cy - $h * 0.12),
    [single]$cx, [single]($cy + $h * 0.34)
  )
  $path.CloseFigure()
  return $path
}

function Add-Leaf($graphics, [single]$x, [single]$y, [single]$angle, [single]$w, [single]$h, $color) {
  $state = $graphics.Save()
  $graphics.TranslateTransform($x, $y)
  $graphics.RotateTransform($angle)
  $brush = [System.Drawing.SolidBrush]::new($color)
  $graphics.FillEllipse($brush, [single](-$w / 2), [single](-$h / 2), [single]$w, [single]$h)
  $brush.Dispose()
  $graphics.Restore($state)
}

function Add-SoftCircle($graphics, [single]$x, [single]$y, [single]$r, $color) {
  $brush = [System.Drawing.SolidBrush]::new($color)
  $graphics.FillEllipse($brush, [single]($x - $r), [single]($y - $r), [single]($r * 2), [single]($r * 2))
  $brush.Dispose()
}

# ---------------------------------------------------------------------------
#  Icono cuadrado (PWA / Apple touch)
# ---------------------------------------------------------------------------
function New-AppIcon([int]$size, [string]$fileName) {
  $canvas = New-Canvas $size $size
  $g = $canvas.Graphics
  $rect = [System.Drawing.RectangleF]::new(0, 0, $size, $size)

  $bg = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    $rect,
    (New-Color "#fbeaee"),
    (New-Color "#f3c9d6"),
    45
  )
  $g.FillRectangle($bg, $rect)
  $bg.Dispose()

  Add-SoftCircle $g ($size * 0.14) ($size * 0.16) ($size * 0.22) (New-Color "#ffffff" 70)
  Add-SoftCircle $g ($size * 0.88) ($size * 0.9) ($size * 0.3) (New-Color "#ffffff" 45)

  # Hojas alrededor del corazon.
  $leafColor = New-Color "#9fb096" 225
  $leafLight = New-Color "#b9c8b1" 200
  $cx = $size / 2
  $cy = $size / 2
  $ringX = $size * 0.305
  $ringY = $size * 0.315
  for ($i = 0; $i -lt 14; $i++) {
    $angle = ($i / 14.0) * 360.0
    $rad = $angle * [Math]::PI / 180.0
    $x = $cx + [Math]::Cos($rad) * $ringX
    $y = $cy + [Math]::Sin($rad) * $ringY
    $tangent = $angle + 90
    $color = if ($i % 2 -eq 0) { $leafColor } else { $leafLight }
    Add-Leaf $g $x $y $tangent ($size * 0.075) ($size * 0.15) $color
  }

  # Disco de papel.
  $disc = New-Color "#fffaf7" 245
  $discBrush = [System.Drawing.SolidBrush]::new($disc)
  $discR = $size * 0.255
  $g.FillEllipse($discBrush, [single]($cx - $discR), [single]($cy - $discR), [single]($discR * 2), [single]($discR * 2))
  $discBrush.Dispose()

  # Corazon.
  $heart = Get-HeartPath $cx ($cy + $size * 0.012) ($size * 0.31)
  $heartBrush = [System.Drawing.SolidBrush]::new((New-Color "#b95f7d"))
  $g.FillPath($heartBrush, $heart)
  $heart.Dispose()
  $heartBrush.Dispose()

  # Brillo interior.
  $shineState = $g.Save()
  $shine = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $shine.AddEllipse([single]($cx - $size * 0.115), [single]($cy - $size * 0.09), [single]($size * 0.085), [single]($size * 0.055))
  $shineBrush = [System.Drawing.SolidBrush]::new((New-Color "#ffffff" 110))
  $g.FillPath($shineBrush, $shine)
  $shine.Dispose()
  $shineBrush.Dispose()
  $g.Restore($shineState)

  # Puntitos.
  Add-SoftCircle $g ($size * 0.5) ($size * 0.135) ($size * 0.012) (New-Color "#b95f7d" 150)
  Add-SoftCircle $g ($size * 0.795) ($size * 0.315) ($size * 0.009) (New-Color "#b95f7d" 130)
  Add-SoftCircle $g ($size * 0.21) ($size * 0.7) ($size * 0.01) (New-Color "#b95f7d" 120)

  $path = Join-Path $outDir $fileName
  $canvas.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $canvas.Bitmap.Dispose()
  Write-Host "  Creado: assets/icons/$fileName" -ForegroundColor Green
}

# ---------------------------------------------------------------------------
#  Vista previa al compartir (1200 x 630)
# ---------------------------------------------------------------------------
function New-OpenGraph {
  $width = 1200
  $height = 630
  $canvas = New-Canvas $width $height
  $g = $canvas.Graphics
  $rect = [System.Drawing.RectangleF]::new(0, 0, $width, $height)

  $bg = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    $rect,
    (New-Color "#fffaf7"),
    (New-Color "#f6d6de"),
    22
  )
  $g.FillRectangle($bg, $rect)
  $bg.Dispose()

  Add-SoftCircle $g 150 120 260 (New-Color "#ffffff" 90)
  Add-SoftCircle $g 1090 560 320 (New-Color "#ffffff" 55)
  Add-SoftCircle $g 930 90 150 (New-Color "#f9e6ea" 120)

  # Ramas laterales.
  $leafColor = New-Color "#a9b9a1" 150
  for ($i = 0; $i -lt 20; $i++) {
    $t = $i / 19.0
    $leftX = 96 + [Math]::Sin($t * 3.1) * 56
    $leftY = 590 - $t * 500
    Add-Leaf $g $leftX $leftY (-35 + $t * 40) 34 78 $leafColor

    $rightX = 1104 - [Math]::Sin($t * 3.1) * 56
    $rightY = 590 - $t * 500
    Add-Leaf $g $rightX $rightY (35 - $t * 40) 34 78 $leafColor
  }

  # Tarjeta central.
  $card = [System.Drawing.RectangleF]::new(250, 72, 700, 486)
  $cardBrush = [System.Drawing.SolidBrush]::new((New-Color "#fffdfb" 238))
  $g.FillRectangle($cardBrush, $card)
  $cardBrush.Dispose()
  $borderPen = [System.Drawing.Pen]::new((New-Color "#e3a2b6" 170), 2)
  $g.DrawRectangle($borderPen, 250, 72, 700, 486)
  $borderPen.Dispose()

  # Corazon central pequeno.
  $heart = Get-HeartPath 600 165 74
  $heartBrush = [System.Drawing.SolidBrush]::new((New-Color "#b95f7d"))
  $g.FillPath($heartBrush, $heart)
  $heart.Dispose()
  $heartBrush.Dispose()

  $center = [System.Drawing.StringFormat]::new()
  $center.Alignment = [System.Drawing.StringAlignment]::Center
  $center.LineAlignment = [System.Drawing.StringAlignment]::Center

  $eyebrowFont = [System.Drawing.Font]::new("Segoe UI", 17, [System.Drawing.FontStyle]::Bold)
  $eyebrowBrush = [System.Drawing.SolidBrush]::new((New-Color "#8a5f70"))
  $eyebrowRect = [System.Drawing.RectangleF]::new(300, 225, 600, 30)
  $g.DrawString("UN LIBRO DE RECUERDOS, HECHO A MANO", $eyebrowFont, $eyebrowBrush, $eyebrowRect, $center)
  $eyebrowFont.Dispose()
  $eyebrowBrush.Dispose()

  $titleFont = [System.Drawing.Font]::new("Georgia", 62, [System.Drawing.FontStyle]::Italic)
  $titleBrush = [System.Drawing.SolidBrush]::new((New-Color "#6e3550"))
  $titleRect = [System.Drawing.RectangleF]::new(285, 268, 630, 150)
  $g.DrawString("Feliz cumplea" + [char]0xF1 + "os", $titleFont, $titleBrush, $titleRect, $center)
  $titleFont.Dispose()
  $titleBrush.Dispose()

  $linePen = [System.Drawing.Pen]::new((New-Color "#c98ba1" 150), 2)
  $g.DrawLine($linePen, 490, 430, 710, 430)
  $linePen.Dispose()

  $subFont = [System.Drawing.Font]::new("Segoe UI", 21, [System.Drawing.FontStyle]::Regular)
  $subBrush = [System.Drawing.SolidBrush]::new((New-Color "#7d5c6b"))
  $subRect = [System.Drawing.RectangleF]::new(315, 448, 570, 70)
  $g.DrawString("Un peque" + [char]0xF1 + "o libro para decirte todo.", $subFont, $subBrush, $subRect, $center)
  $subFont.Dispose()
  $subBrush.Dispose()

  $path = Join-Path $outDir "og-cover.png"
  $canvas.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $canvas.Bitmap.Dispose()
  Write-Host "  Creado: assets/icons/og-cover.png" -ForegroundColor Green
}

Write-Host ""
Write-Host "  Generando iconos del libro..." -ForegroundColor Magenta
Write-Host ""

New-AppIcon 192 "icon-192.png"
New-AppIcon 512 "icon-512.png"
New-AppIcon 180 "apple-touch-icon.png"
New-OpenGraph

Write-Host ""
Write-Host "  Listo. Los iconos estan en assets/icons/." -ForegroundColor Magenta
Write-Host ""
