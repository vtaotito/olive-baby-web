# Script para preparar deploy do frontend com AI Assistant na VPS
$domain = "oliecare.cloud"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$archiveName = "olivebaby-web-ai-deploy-$timestamp.zip"

Write-Host "Preparando deploy do frontend com AI Assistant..." -ForegroundColor Cyan

# Criar diretorio temporario
$tempDir = "deploy-temp"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copiar arquivos necessarios (excluindo node_modules, dist, etc)
Write-Host "Copiando arquivos..." -ForegroundColor Yellow

$excludePatterns = @(
    "node_modules",
    "dist",
    ".git",
    ".vscode",
    "*.log",
    "deploy-temp",
    "*.zip",
    "playwright-report",
    "test-results",
    "e2e"
)

# Copiar estrutura
Get-ChildItem -Path . -Recurse | Where-Object {
    $shouldExclude = $false
    foreach ($pattern in $excludePatterns) {
        if ($_.FullName -like "*$pattern*") {
            $shouldExclude = $true
            break
        }
    }
    return -not $shouldExclude
} | ForEach-Object {
    $relativePath = $_.FullName.Substring((Get-Location).Path.Length + 1)
    $destPath = Join-Path $tempDir $relativePath
    $destDir = Split-Path $destPath -Parent
    
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    
    if (-not $_.PSIsContainer) {
        Copy-Item $_.FullName $destPath -Force
    }
}

# Criar docker-compose.yml para deploy
$dockerCompose = @"
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VITE_API_URL: https://$domain/api/v1
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

networks:
  olivebaby-network:
    external: true
"@

$dockerCompose | Out-File -FilePath "$tempDir\docker-compose.yml" -Encoding UTF8

# Criar zip
Write-Host "Criando arquivo ZIP..." -ForegroundColor Yellow
Compress-Archive -Path "$tempDir\*" -DestinationPath $archiveName -Force

$fileSize = (Get-Item $archiveName).Length / 1MB
Write-Host "Arquivo criado: $archiveName ($([math]::Round($fileSize, 2)) MB)" -ForegroundColor Green

# Limpar temp
Remove-Item -Recurse -Force $tempDir

Write-Host ""
Write-Host "Deploy package ready: $archiveName" -ForegroundColor Green
Write-Host "Domain: $domain" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pronto para deploy via Hostinger MCP!" -ForegroundColor Green

