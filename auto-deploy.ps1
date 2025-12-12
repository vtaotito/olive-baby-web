# ============================================
# 🚀 Olive Baby Web - Auto Deploy com MCP
# ============================================
# Deploy totalmente automatizado via Hostinger MCP
# PowerShell Script para Windows
# ============================================

param(
    [switch]$Force = $false,
    [switch]$SkipTests = $false
)

# Configurações
$PROJECT_NAME = "olivebaby-web"
$VPS_ID = 1188492
$API_URL = "https://oliecare.cloud/api/v1"

# Cores
function Write-Step($msg) { Write-Host "`n▶ $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "✓ $msg" -ForegroundColor Green }
function Write-Error($msg) { Write-Host "✗ $msg" -ForegroundColor Red }
function Write-Info($msg) { Write-Host "ℹ $msg" -ForegroundColor Yellow }

Write-Host @"

╔══════════════════════════════════════════╗
║   🚀 AUTO DEPLOY - OLIVE BABY WEB        ║
║   Deploy Automatizado via MCP            ║
╚══════════════════════════════════════════╝

"@ -ForegroundColor Green

# ============================================
# STEP 1: Validar ambiente
# ============================================
Write-Step "Validando ambiente local..."

if (!(Test-Path "package.json")) {
    Write-Error "Execute na raiz do projeto olive-baby-web"
    exit 1
}

Write-Success "Projeto encontrado"

# ============================================
# STEP 2: Criar pacote de deploy
# ============================================
Write-Step "Criando pacote de deploy..."

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$archiveName = "olive-baby-web_$timestamp.zip"

# Lista de arquivos essenciais
$filesToInclude = @(
    "package.json",
    "package-lock.json",
    "src",
    "public",
    "index.html",
    "vite.config.ts",
    "tsconfig.json",
    "tsconfig.node.json",
    "tailwind.config.js",
    "postcss.config.js",
    "Dockerfile",
    "nginx.conf",
    "docker-compose.deploy.yml"
)

Write-Info "Compactando arquivos..."
Compress-Archive -Path $filesToInclude -DestinationPath $archiveName -Force

$size = (Get-Item $archiveName).Length / 1MB
Write-Success "Pacote criado: $archiveName ($([math]::Round($size, 2)) MB)"

# ============================================
# STEP 3: Instruções para deploy via Cursor
# ============================================
Write-Step "Próximo passo: Deploy no VPS"

Write-Info ""
Write-Host "Para fazer o deploy automático, use o Cursor Agent:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Abra o Cursor Chat" -ForegroundColor Cyan
Write-Host "  2. Cole o comando abaixo:" -ForegroundColor Cyan
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""
Write-Host "Faça o deploy do arquivo $archiveName" -ForegroundColor White
Write-Host "no VPS $VPS_ID para o projeto $PROJECT_NAME." -ForegroundColor White
Write-Host "Use a ferramenta deployJsApplication da Hostinger." -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""
Write-Info "O Cursor Agent irá:"
Write-Host "  • Fazer upload do arquivo para o VPS" -ForegroundColor White
Write-Host "  • Extrair e preparar os arquivos" -ForegroundColor White
Write-Host "  • Fazer build da aplicação" -ForegroundColor White
Write-Host "  • Iniciar os containers Docker" -ForegroundColor White
Write-Host "  • Verificar se está tudo funcionando" -ForegroundColor White
Write-Host ""

Write-Success "Pacote pronto para deploy! 🎉"
Write-Host ""
Write-Info "Arquivo: $archiveName"
Write-Info "Local: $(Get-Location)\$archiveName"
Write-Host ""
