# Olive Baby Web - Prepare Deploy Script (Baby Sharing Feature)
# PowerShell script para preparar deploy com nova feature de compartilhamento

param(
    [string]$VPS_ID = "1188492",
    [string]$API_URL = "https://oliecare.cloud/api/v1"
)

$ErrorActionPreference = "Stop"

Write-Host "`nOlive Baby Web - Prepare Deploy (Baby Sharing)" -ForegroundColor Green
Write-Host "==================================================`n" -ForegroundColor Green

# Step 1: Verificar ambiente
Write-Host "Step 1/5: Verificando ambiente..." -ForegroundColor Cyan

if (-not (Test-Path "package.json")) {
    Write-Host "Erro: Execute este script na raiz do projeto olive-baby-web" -ForegroundColor Red
    exit 1
}

Write-Host "Projeto encontrado" -ForegroundColor Green

# Step 2: Build do projeto
Write-Host "`nStep 2/5: Fazendo build do projeto..." -ForegroundColor Cyan

$env:VITE_API_URL = $API_URL
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build concluído" -ForegroundColor Green

# Step 3: Criar diretório temporário
Write-Host "`n📦 Step 3/5: Preparando arquivos..." -ForegroundColor Cyan

$tempDir = "deploy-temp"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copiar arquivos necessários
Copy-Item -Path "dist" -Destination "$tempDir/dist" -Recurse -Force
Copy-Item -Path "Dockerfile" -Destination "$tempDir/Dockerfile" -Force
Copy-Item -Path "nginx.conf" -Destination "$tempDir/nginx.conf" -Force -ErrorAction SilentlyContinue

# Criar docker-compose.yml usando here-string
$dockerComposeContent = @'
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VITE_API_URL: {API_URL}
    container_name: olivebaby-web-app
    restart: unless-stopped
    expose:
      - "80"
    networks:
      - olivebaby-network
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

  nginx:
    image: nginx:alpine
    container_name: olivebaby-nginx-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ssl_certs:/etc/letsencrypt:ro
      - certbot_www:/var/www/certbot
    networks:
      - olivebaby-network
    depends_on:
      - web

  certbot:
    image: certbot/certbot
    container_name: olivebaby-certbot
    volumes:
      - ssl_certs:/etc/letsencrypt
      - certbot_www:/var/www/certbot
    networks:
      - olivebaby-network

volumes:
  ssl_certs:
  certbot_www:

networks:
  olivebaby-network:
    external: true
'@

$dockerCompose = $dockerComposeContent -replace '{API_URL}', $API_URL

$dockerCompose | Out-File -FilePath "$tempDir/docker-compose.yml" -Encoding UTF8

Write-Host "Arquivos preparados" -ForegroundColor Green

# Step 4: Criar ZIP
Write-Host "`nStep 4/5: Criando pacote de deploy..." -ForegroundColor Cyan

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$archiveName = "olive-baby-web_$timestamp.zip"

# Criar ZIP excluindo arquivos desnecessários
$excludePatterns = @(
    "node_modules",
    ".git",
    ".vscode",
    "e2e",
    "playwright-report",
    "test-results",
    "*.log",
    ".env*",
    "deploy-temp",
    "*.zip",
    "*.tar.gz"
)

# Usar Compress-Archive
Get-ChildItem -Path . -Exclude $excludePatterns | 
    Where-Object { $_.Name -ne "node_modules" -and $_.Name -ne ".git" } |
    Compress-Archive -DestinationPath $archiveName -Force

# Adicionar docker-compose.yml
Compress-Archive -Path "$tempDir/docker-compose.yml" -Update -DestinationPath $archiveName

$archiveSizeMB = [math]::Round((Get-Item $archiveName).Length / 1MB, 2)
$sizeText = "$archiveSizeMB MB"
Write-Host "Pacote criado: $archiveName ($sizeText)" -ForegroundColor Green

# Step 5: Informações finais
Write-Host "`nStep 5/5: Informacoes de deploy" -ForegroundColor Cyan
Write-Host "`nArquivo pronto: $archiveName" -ForegroundColor Yellow
Write-Host "VPS ID: $VPS_ID" -ForegroundColor Yellow
Write-Host "`nPara fazer o deploy, use:" -ForegroundColor Cyan
Write-Host "  Deploy olive-baby-web usando o arquivo $archiveName" -ForegroundColor White

# Limpeza
Write-Host "`nLimpando arquivos temporarios..." -ForegroundColor Cyan
Remove-Item -Recurse -Force $tempDir

Write-Host ""
Write-Host "Deploy preparado com sucesso!" -ForegroundColor Green
