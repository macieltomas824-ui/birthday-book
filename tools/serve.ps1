# ============================================================================
#  SERVIDOR LOCAL  ·  tools/serve.ps1
# ============================================================================
#  Sirve la carpeta del libro por HTTP sin instalar Node, Python ni nada mas.
#  Usa un TcpListener de .NET, asi que no necesita permisos de administrador.
#
#  Uso normal (solo este equipo):
#      powershell -ExecutionPolicy Bypass -File tools/serve.ps1
#
#  Para probar desde el celular en la misma red Wi-Fi:
#      powershell -ExecutionPolicy Bypass -File tools/serve.ps1 -Lan
#
#  Opciones:
#      -Port 4173      puerto (por defecto 4173)
#      -Lan            escucha en 0.0.0.0 y muestra la IP local
#      -NoBrowser      no abre el navegador automaticamente
# ============================================================================

param(
  [int]$Port = 4173,
  [switch]$Lan,
  [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"

$root = [System.IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$hostAddress = if ($Lan) { "0.0.0.0" } else { "127.0.0.1" }

$mime = @{
  ".html"       = "text/html; charset=utf-8"
  ".htm"        = "text/html; charset=utf-8"
  ".css"        = "text/css; charset=utf-8"
  ".js"         = "application/javascript; charset=utf-8"
  ".mjs"        = "application/javascript; charset=utf-8"
  ".json"       = "application/json; charset=utf-8"
  ".webmanifest"= "application/manifest+json; charset=utf-8"
  ".svg"        = "image/svg+xml; charset=utf-8"
  ".png"        = "image/png"
  ".jpg"        = "image/jpeg"
  ".jpeg"       = "image/jpeg"
  ".webp"       = "image/webp"
  ".avif"       = "image/avif"
  ".gif"        = "image/gif"
  ".ico"        = "image/x-icon"
  ".woff"       = "font/woff"
  ".woff2"      = "font/woff2"
  ".ttf"        = "font/ttf"
  ".otf"        = "font/otf"
  ".mp3"        = "audio/mpeg"
  ".ogg"        = "audio/ogg"
  ".wav"        = "audio/wav"
  ".m4a"        = "audio/mp4"
  ".mp4"        = "video/mp4"
  ".webm"       = "video/webm"
  ".txt"        = "text/plain; charset=utf-8"
  ".md"         = "text/plain; charset=utf-8"
  ".sql"        = "text/plain; charset=utf-8"
  ".pdf"        = "application/pdf"
}

function Get-ContentType([string]$path) {
  $ext = [System.IO.Path]::GetExtension($path).ToLowerInvariant()
  if ($mime.ContainsKey($ext)) { return $mime[$ext] }
  return "application/octet-stream"
}

function Send-Response($stream, [int]$status, [string]$statusText, [string]$contentType, [byte[]]$body, [bool]$headOnly) {
  $length = if ($body) { $body.Length } else { 0 }
  $header = "HTTP/1.1 $status $statusText`r`n" +
            "Content-Type: $contentType`r`n" +
            "Content-Length: $length`r`n" +
            "Cache-Control: no-store, max-age=0`r`n" +
            "X-Content-Type-Options: nosniff`r`n" +
            "Connection: close`r`n" +
            "`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
  $stream.Write($headerBytes, 0, $headerBytes.Length)
  if (-not $headOnly -and $body -and $body.Length -gt 0) {
    $stream.Write($body, 0, $body.Length)
  }
  $stream.Flush()
}

function Get-ErrorPage([string]$title, [string]$message) {
  $html = "<!DOCTYPE html><html lang='es'><head><meta charset='utf-8'>" +
          "<meta name='viewport' content='width=device-width, initial-scale=1'>" +
          "<title>$title</title><style>" +
          "body{font-family:system-ui,sans-serif;background:#fff7f5;color:#452b38;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px}" +
          "main{max-width:460px;background:#fff;border:1px solid #f0d4dc;border-radius:20px;padding:28px;box-shadow:0 18px 50px rgba(110,53,80,.12)}" +
          "h1{font-family:Georgia,serif;color:#6e3550;margin:0 0 8px;font-size:28px}p{line-height:1.6;margin:0 0 14px}" +
          "code{background:#fbeaee;padding:2px 6px;border-radius:4px}a{color:#b95f7d}" +
          "</style></head><body><main><h1>$title</h1><p>$message</p>" +
          "<p><a href='/'>Volver al inicio</a></p></main></body></html>"
  return [System.Text.Encoding]::UTF8.GetBytes($html)
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse($hostAddress), $Port)

try {
  $listener.Start()
} catch {
  Write-Host ""
  Write-Host "No se pudo abrir el puerto $Port." -ForegroundColor Red
  Write-Host "Puede que ya este ocupado. Prueba con otro puerto:" -ForegroundColor Yellow
  Write-Host "  powershell -ExecutionPolicy Bypass -File tools/serve.ps1 -Port 4174" -ForegroundColor Yellow
  Write-Host ""
  exit 1
}

Write-Host ""
Write-Host "  Entre petalos - servidor local" -ForegroundColor Magenta
Write-Host "  ------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  Carpeta:  $root" -ForegroundColor Gray
Write-Host "  Abre:     http://localhost:$Port/" -ForegroundColor Cyan

if ($Lan) {
  Write-Host ""
  Write-Host "  Desde el celular (misma red Wi-Fi):" -ForegroundColor Yellow
  $addresses = @()
  try {
    $addresses = [System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) |
      Where-Object { $_.AddressFamily -eq [System.Net.Sockets.AddressFamily]::InterNetwork -and -not [System.Net.IPAddress]::IsLoopback($_) } |
      ForEach-Object { $_.IPAddressToString }
  } catch {
    $addresses = @()
  }
  if ($addresses.Count -gt 0) {
    foreach ($ip in $addresses) {
      Write-Host "    http://${ip}:$Port/" -ForegroundColor Cyan
    }
  } else {
    Write-Host "    No se detecto una IP local. Ejecuta ipconfig para averiguarla." -ForegroundColor Yellow
  }
  Write-Host "  Si Windows pregunta por el firewall, permite la red privada." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "  Ctrl + C para detener el servidor." -ForegroundColor DarkGray
Write-Host ""

if (-not $NoBrowser) {
  try {
    Start-Process "http://localhost:$Port/"
  } catch {
    Write-Host "  Abre el enlace manualmente en el navegador." -ForegroundColor Yellow
  }
}

$rootFull = [System.IO.Path]::GetFullPath($root)
if (-not $rootFull.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {
  $rootFull += [System.IO.Path]::DirectorySeparatorChar
}

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    $stream = $null
    try {
      $client.ReceiveTimeout = 5000
      $client.SendTimeout = 5000
      $stream = $client.GetStream()

      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $requestLine = $reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($requestLine)) {
        $client.Close()
        continue
      }

      $parts = $requestLine -split " "
      if ($parts.Length -lt 2) {
        $body = Get-ErrorPage "Solicitud no valida" "El navegador envio una solicitud que este servidor no entiende."
        Send-Response $stream 400 "Bad Request" "text/html; charset=utf-8" $body $false
        $client.Close()
        continue
      }

      $method = $parts[0].ToUpperInvariant()
      $target = $parts[1]

      # Leer y descartar cabeceras hasta la linea en blanco.
      while ($true) {
        $line = $reader.ReadLine()
        if ($null -eq $line -or $line -eq "") { break }
      }

      if ($method -ne "GET" -and $method -ne "HEAD") {
        $body = Get-ErrorPage "Metodo no permitido" "Este servidor solo entrega archivos con GET o HEAD."
        Send-Response $stream 405 "Method Not Allowed" "text/html; charset=utf-8" $body ($method -eq "HEAD")
        $client.Close()
        continue
      }

      $pathOnly = $target.Split("?")[0]
      if ($pathOnly -eq "/") { $pathOnly = "/index.html" }

      $decoded = [System.Uri]::UnescapeDataString($pathOnly)
      $relative = $decoded.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
      $full = [System.IO.Path]::GetFullPath((Join-Path $rootFull $relative))

      if (-not $full.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
        $body = Get-ErrorPage "Fuera del libro" "Esa ruta no pertenece a la carpeta del proyecto."
        Send-Response $stream 403 "Forbidden" "text/html; charset=utf-8" $body ($method -eq "HEAD")
        $client.Close()
        continue
      }

      if (Test-Path -LiteralPath $full -PathType Container) {
        $full = [System.IO.Path]::Combine($full, "index.html")
      }

      if (-not (Test-Path -LiteralPath $full -PathType Leaf)) {
        $body = Get-ErrorPage "Pagina no encontrada" "No existe <code>$decoded</code> dentro del libro."
        Send-Response $stream 404 "Not Found" "text/html; charset=utf-8" $body ($method -eq "HEAD")
        $client.Close()
        continue
      }

      $body = [System.IO.File]::ReadAllBytes($full)
      $contentType = Get-ContentType $full
      Send-Response $stream 200 "OK" $contentType $body ($method -eq "HEAD")
      $client.Close()
    } catch {
      try {
        if ($stream) {
          $body = Get-ErrorPage "Error del servidor" "No se pudo entregar el archivo solicitado."
          Send-Response $stream 500 "Internal Server Error" "text/html; charset=utf-8" $body $false
        }
      } catch {
        # Si el navegador ya cerro la conexion, no hay nada que hacer.
      }
      if ($client) { $client.Close() }
    }
  }
} finally {
  try { $listener.Stop() } catch { }
  Write-Host ""
  Write-Host "  Servidor detenido. Hasta pronto." -ForegroundColor Magenta
  Write-Host ""
}
