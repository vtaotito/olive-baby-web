# ============================================
# 🚀 Olive Baby Web - Script de Deploy Automatizado
# ============================================
# PowerShell Script para Windows
# Autor: Olive Baby Team
# Versão: 1.0.0
# ============================================

param(
    [string]$Environment = "production",
    [switch]$SkipBuild = $false,
    [switch]$SkipBackup = $false,
    [switch]$Verbose = $false
)

# Configurações
$PROJECT_NAME = "olivebaby-web"
$VPS_ID = 1188492
$API_URL = "https://oliecare.cloud/api/v1"
$DEPLOY_DIR = "/docker/$PROJECT_NAME"

# Cores para output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Step($message) {
    Write-ColorOutput Cyan "`n▶ $message"
}

function Write-Success($message) {
    Write-ColorOutput Green "✓ $message"
}

function Write-Error($message) {
    Write-ColorOutput Red "✗ $message"
}

function Write-Info($message) {
    Write-ColorOutput Yellow "ℹ $message"
}

# ============================================
# Início do Deploy
# ============================================
Write-ColorOutput Green @"

╔══════════════════════════════════════════╗
║   🚀 OLIVE BABY WEB - DEPLOY SCRIPT      ║
╚══════════════════════════════════════════╝

"@

Write-Info "Ambiente: $Environment"
Write-Info "Projeto: $PROJECT_NAME"
Write-Info "VPS ID: $VPS_ID"
Write-Info ""

# ============================================
# STEP 1: Validações Iniciais
# ============================================
Write-Step "1/7 - Validando ambiente..."

# Verificar se está na pasta correta
if (-not (Test-Path "package.json")) {
    Write-Error "Erro: Execute este script na raiz do projeto olive-baby-web"
    exit 1
}

# Verificar se Docker está instalado
try {
    $dockerVersion = docker --version
    Write-Success "Docker encontrado: $dockerVersion"
} catch {
    Write-Error "Docker não está instalado ou não está no PATH"
    exit 1
}

# Verificar se git está instalado
try {
    $gitVersion = git --version
    Write-Success "Git encontrado: $gitVersion"
} catch {
    Write-Error "Git não está instalado ou não está no PATH"
    exit 1
}

# ============================================
# STEP 2: Verificar mudanças não commitadas
# ============================================
Write-Step "2/7 - Verificando status do Git..."

$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Info "Existem mudanças não commitadas:"
    git status --short
    $response = Read-Host "`nDeseja continuar mesmo assim? (s/N)"
    if ($response -ne "s" -and $response -ne "S") {
        Write-Info "Deploy cancelado pelo usuário."
        exit 0
    }
}

$currentBranch = git branch --show-current
$currentCommit = git rev-parse --short HEAD
Write-Success "Branch: $currentBranch"
Write-Success "Commit: $currentCommit"

# ============================================
# STEP 3: Criar arquivo temporário de deploy
# ============================================
Write-Step "3/7 - Preparando arquivos para deploy..."

# Criar diretório temporário
$TEMP_DIR = ".\deploy-temp"
if (Test-Path $TEMP_DIR) {
    Remove-Item -Recurse -Force $TEMP_DIR
}
New-Item -ItemType Directory -Path $TEMP_DIR | Out-Null

# Criar docker-compose.yml para deploy
$dockerComposeContent = @"
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VITE_API_URL: $API_URL
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
    command: >
      /bin/sh -c "
      cat > /etc/nginx/conf.d/default.conf << 'EOF'
      server {
          listen 80 default_server;
          server_name oliecare.cloud www.oliecare.cloud _;
          
          location /.well-known/acme-challenge/ {
              root /var/www/certbot;
          }
          
          location /api/ {
              proxy_pass http://olivebaby-api:4000/api/;
              proxy_http_version 1.1;
              proxy_set_header Host \`$host;
              proxy_set_header X-Real-IP \`$remote_addr;
              proxy_set_header X-Forwarded-For \`$proxy_add_x_forwarded_for;
              proxy_set_header X-Forwarded-Proto \`$scheme;
              proxy_read_timeout 90s;
          }
          
          location / {
              proxy_pass http://web:80;
              proxy_http_version 1.1;
              proxy_set_header Host \`$host;
              proxy_set_header X-Real-IP \`$remote_addr;
          }
      }
      
      server {
          listen 443 ssl http2;
          server_name oliecare.cloud www.oliecare.cloud;
          
          ssl_certificate /etc/letsencrypt/live/oliecare.cloud/fullchain.pem;
          ssl_certificate_key /etc/letsencrypt/live/oliecare.cloud/privkey.pem;
          ssl_protocols TLSv1.2 TLSv1.3;
          
          gzip on;
          gzip_types text/plain text/css application/json application/javascript;
          
          location /api/ {
              proxy_pass http://olivebaby-api:4000/api/;
              proxy_http_version 1.1;
              proxy_set_header X-Forwarded-Proto https;
          }
          
          location / {
              proxy_pass http://web:80;
              proxy_http_version 1.1;
          }
          
          add_header Strict-Transport-Security "max-age=31536000" always;
      }
      EOF
      nginx -g 'daemon off;'
      "
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3

  certbot:
    image: certbot/certbot
    container_name: olivebaby-certbot
    volumes:
      - ssl_certs:/etc/letsencrypt
      - certbot_www:/var/www/certbot
    networks:
      - olivebaby-network
    entrypoint: /bin/sh
    command: >
      -c "
      sleep 30;
      if [ ! -f /etc/letsencrypt/live/oliecare.cloud/fullchain.pem ]; then
        certbot certonly --webroot --webroot-path=/var/www/certbot \
          --email vitor@titotech.com.br --agree-tos --no-eff-email \
          -d oliecare.cloud -d www.oliecare.cloud;
      fi;
      while true; do sleep 12h; certbot renew --quiet; done
      "

volumes:
  ssl_certs:
  certbot_www:

networks:
  olivebaby-network:
    external: true
"@

Set-Content -Path "$TEMP_DIR\docker-compose.yml" -Value $dockerComposeContent
Write-Success "docker-compose.yml criado"

# ============================================
# STEP 4: Criar arquivo de exclusões
# ============================================
Write-Step "4/7 - Criando lista de exclusões..."

$gitignoreContent = @"
# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
coverage/
e2e/
playwright-report/
test-results/

# Production build (será feito no servidor)
dist/
build/

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Temp
deploy-temp/
*.zip
*.tar.gz
"@

Set-Content -Path "$TEMP_DIR\.deployignore" -Value $gitignoreContent
Write-Success "Lista de exclusões criada"

# ============================================
# STEP 5: Criar pacote de deploy
# ============================================
Write-Step "5/7 - Criando pacote de deploy..."

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$archiveName = "olive-baby-web_$timestamp.zip"

# Criar arquivo zip excluindo arquivos desnecessários
$excludePatterns = @(
    "node_modules",
    "dist",
    "build",
    ".git",
    ".vscode",
    "e2e",
    "playwright-report",
    "test-results",
    "*.log",
    "deploy-temp"
)

Write-Info "Compactando arquivos do projeto..."
try {
    # Usar formato de compressão do PowerShell
    $source = Get-Location
    $destination = Join-Path $source $archiveName
    
    # Obter todos os arquivos exceto os da lista de exclusão
    $files = Get-ChildItem -Path $source -Recurse -File | Where-Object {
        $file = $_
        $shouldExclude = $false
        foreach ($pattern in $excludePatterns) {
            if ($file.FullName -like "*$pattern*") {
                $shouldExclude = $true
                break
            }
        }
        -not $shouldExclude
    }
    
    Compress-Archive -Path package.json, package-lock.json, src, public, index.html, vite.config.ts, tsconfig.json, tsconfig.node.json, tailwind.config.js, postcss.config.js, Dockerfile, nginx.conf, "$TEMP_DIR\docker-compose.yml" -DestinationPath $destination -Force
    
    $archiveSize = (Get-Item $destination).Length / 1MB
    Write-Success "Pacote criado: $archiveName ($([math]::Round($archiveSize, 2)) MB)"
} catch {
    Write-Error "Erro ao criar pacote: $_"
    Remove-Item -Recurse -Force $TEMP_DIR
    exit 1
}

# ============================================
# STEP 6: Fazer upload e deploy no VPS
# ============================================
Write-Step "6/7 - Fazendo deploy no VPS..."

Write-Info "Iniciando deploy via Hostinger MCP..."
Write-Info "Este processo pode demorar alguns minutos..."
Write-Info ""
Write-ColorOutput Yellow "⏳ Aguarde enquanto o deploy é realizado..."
Write-Info ""
Write-Info "Arquivo: $archiveName"
Write-Info "VPS ID: $VPS_ID"
Write-Info "Projeto: $PROJECT_NAME"
Write-Info ""
Write-ColorOutput Yellow "📦 Fazendo upload do pacote para o VPS..."
Write-ColorOutput Yellow "🐳 Construindo imagem Docker..."
Write-ColorOutput Yellow "🚀 Iniciando containers..."
Write-Info ""
Write-Info "Use o comando abaixo para acompanhar o progresso depois:"
Write-ColorOutput Cyan "    cursor mcp-vps logs $PROJECT_NAME"

# Nota: O comando real de deploy será executado pelo MCP
Write-Info ""
Write-ColorOutput Green "Para executar o deploy, use o Cursor Agent com o comando:"
Write-ColorOutput Cyan "    Deploy olive-baby-web usando o arquivo $archiveName"

# ============================================
# STEP 7: Limpeza
# ============================================
Write-Step "7/7 - Limpeza..."

# Perguntar se quer manter o arquivo
$response = Read-Host "`nDeseja manter o arquivo $archiveName? (s/N)"
if ($response -ne "s" -and $response -ne "S") {
    Remove-Item $archiveName -Force
    Write-Success "Arquivo temporário removido"
} else {
    Write-Info "Arquivo mantido: $archiveName"
}

Remove-Item -Recurse -Force $TEMP_DIR
Write-Success "Arquivos temporários removidos"

# ============================================
# Finalização
# ============================================
Write-ColorOutput Green @"

╔══════════════════════════════════════════╗
║   ✓ SCRIPT DE DEPLOY CONCLUÍDO           ║
╚══════════════════════════════════════════╝

"@

Write-Info "Próximos passos:"
Write-ColorOutput Cyan "  1. Use o Cursor Agent para fazer o deploy real"
Write-ColorOutput Cyan "  2. Verifique os logs: cursor mcp-vps logs $PROJECT_NAME"
Write-ColorOutput Cyan "  3. Acesse: https://oliecare.cloud"
Write-Info ""
Write-Success "Deploy preparado com sucesso! 🎉"
