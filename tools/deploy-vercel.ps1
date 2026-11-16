param(
  [string]$RepoName = "birthday-book",
  [ValidateSet("public","private")] [string]$Visibility = "private",
  [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Have($cmd) { return [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }

function Refresh-Path {
  $env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')
}

Write-Host "==> Proyecto: $root" -ForegroundColor Cyan

if (-not $SkipInstall) {
  if (-not (Have winget)) { throw "winget no está disponible. Instala Git, GitHub CLI y Node.js manualmente." }
  if (-not (Have git)) {
    Write-Host "==> Instalando Git..." -ForegroundColor Yellow
    winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
    Refresh-Path
  }
  if (-not (Have gh)) {
    Write-Host "==> Instalando GitHub CLI..." -ForegroundColor Yellow
    winget install --id GitHub.cli -e --source winget --accept-package-agreements --accept-source-agreements
    Refresh-Path
  }
  if (-not (Have node) -or -not (Have npm)) {
    Write-Host "==> Instalando Node.js LTS (para Vercel CLI)..." -ForegroundColor Yellow
    winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements
    Refresh-Path
  }
}

Refresh-Path
if (-not (Have git)) { throw "git no encontrado. Reinicia la terminal y ejecuta de nuevo." }
if (-not (Have gh)) { throw "gh no encontrado. Reinicia la terminal y ejecuta de nuevo." }

# Git repo local
if (-not (Test-Path (Join-Path $root '.git'))) {
  Write-Host "==> Inicializando repositorio git..." -ForegroundColor Yellow
  git init | Out-Host
}
git add -A
$pending = git status --porcelain
if ($pending) {
  git commit -m "Deploy: libro de cumpleaños" | Out-Host
} else {
  Write-Host "==> Sin cambios nuevos para commit." -ForegroundColor DarkGray
}
try { git branch -M main | Out-Null } catch {}

# GitHub auth
$authed = $false
try { gh auth status 1>$null 2>$null; if ($LASTEXITCODE -eq 0) { $authed = $true } } catch {}
if (-not $authed) {
  Write-Host "==> Inicia sesión en GitHub (se abrirá el navegador)..." -ForegroundColor Yellow
  gh auth login -h github.com -p https -w
}

# Crear repo y push
$remoteUrl = $null
try { $remoteUrl = (git remote get-url origin 2>$null) } catch {}
if (-not $remoteUrl) {
  Write-Host "==> Creando repositorio en GitHub y subiendo código..." -ForegroundColor Yellow
  $visFlag = if ($Visibility -eq 'public') { '--public' } else { '--private' }
  gh repo create $RepoName $visFlag --source=. --remote=origin --push
} else {
  Write-Host "==> Remote origin ya existe: $remoteUrl" -ForegroundColor DarkGray
  git push -u origin main | Out-Host
}

$repoFull = gh repo view --json nameWithOwner -q .nameWithOwner
$repoUrl = "https://github.com/$repoFull"
Write-Host "==> Repositorio listo: $repoUrl" -ForegroundColor Green

# Vercel
$importUrl = "https://vercel.com/new/clone?repository-url=$([uri]::EscapeDataString($repoUrl))"
Write-Host "==> Abriendo importación en Vercel..." -ForegroundColor Cyan
Start-Process $importUrl

if ((Have npx) -or (Have npm)) {
  Write-Host "==> (Opcional) Puedes desplegar también por CLI con: npx vercel --prod" -ForegroundColor DarkGray
}

Write-Host "\nLISTO: en Vercel selecciona Framework 'Other', sin Build Command, Output '.' y pulsa Deploy." -ForegroundColor Green
Write-Host "Luego actualiza js/config.js -> siteUrl con la URL final y haz push para redeploy." -ForegroundColor Green
