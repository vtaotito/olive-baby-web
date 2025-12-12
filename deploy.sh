#!/bin/bash

# ============================================
# 🚀 Olive Baby Web - Script de Deploy Automatizado
# ============================================
# Bash Script para Linux/Mac
# Autor: Olive Baby Team
# Versão: 1.0.0
# ============================================

set -e  # Exit on error

# Configurações
PROJECT_NAME="olivebaby-web"
VPS_ID=1188492
API_URL="https://oliecare.cloud/api/v1"
DEPLOY_DIR="/docker/$PROJECT_NAME"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Funções de output
print_step() {
    echo -e "\n${CYAN}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# ============================================
# Início do Deploy
# ============================================
echo -e "${GREEN}"
cat << "EOF"

╔══════════════════════════════════════════╗
║   🚀 OLIVE BABY WEB - DEPLOY SCRIPT      ║
╚══════════════════════════════════════════╝

EOF
echo -e "${NC}"

print_info "Ambiente: production"
print_info "Projeto: $PROJECT_NAME"
print_info "VPS ID: $VPS_ID"
echo ""

# ============================================
# STEP 1: Validações Iniciais
# ============================================
print_step "1/7 - Validando ambiente..."

# Verificar se está na pasta correta
if [ ! -f "package.json" ]; then
    print_error "Erro: Execute este script na raiz do projeto olive-baby-web"
    exit 1
fi

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker não está instalado"
    exit 1
fi
print_success "Docker encontrado: $(docker --version)"

# Verificar se git está instalado
if ! command -v git &> /dev/null; then
    print_error "Git não está instalado"
    exit 1
fi
print_success "Git encontrado: $(git --version)"

# Verificar se zip está instalado
if ! command -v zip &> /dev/null; then
    print_error "zip não está instalado. Instale com: sudo apt-get install zip"
    exit 1
fi
print_success "zip encontrado"

# ============================================
# STEP 2: Verificar mudanças não commitadas
# ============================================
print_step "2/7 - Verificando status do Git..."

if [ -n "$(git status --porcelain)" ]; then
    print_info "Existem mudanças não commitadas:"
    git status --short
    read -p "Deseja continuar mesmo assim? (s/N): " response
    if [[ ! "$response" =~ ^[Ss]$ ]]; then
        print_info "Deploy cancelado pelo usuário."
        exit 0
    fi
fi

CURRENT_BRANCH=$(git branch --show-current)
CURRENT_COMMIT=$(git rev-parse --short HEAD)
print_success "Branch: $CURRENT_BRANCH"
print_success "Commit: $CURRENT_COMMIT"

# ============================================
# STEP 3: Criar arquivo temporário de deploy
# ============================================
print_step "3/7 - Preparando arquivos para deploy..."

# Criar diretório temporário
TEMP_DIR="./deploy-temp"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Criar docker-compose.yml para deploy
cat > "$TEMP_DIR/docker-compose.yml" << 'DOCKERCOMPOSE'
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VITE_API_URL: https://oliecare.cloud/api/v1
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
              proxy_set_header Host \$$host;
              proxy_set_header X-Real-IP \$$remote_addr;
              proxy_set_header X-Forwarded-For \$$proxy_add_x_forwarded_for;
              proxy_set_header X-Forwarded-Proto \$$scheme;
              proxy_read_timeout 90s;
          }
          
          location / {
              proxy_pass http://web:80;
              proxy_http_version 1.1;
              proxy_set_header Host \$$host;
              proxy_set_header X-Real-IP \$$remote_addr;
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
DOCKERCOMPOSE

print_success "docker-compose.yml criado"

# ============================================
# STEP 4: Criar lista de exclusões
# ============================================
print_step "4/7 - Criando lista de exclusões..."

cat > "$TEMP_DIR/.deployignore" << 'DEPLOYIGNORE'
node_modules/
dist/
build/
.git/
.vscode/
e2e/
playwright-report/
test-results/
*.log
.env*
deploy-temp/
*.zip
*.tar.gz
DEPLOYIGNORE

print_success "Lista de exclusões criada"

# ============================================
# STEP 5: Criar pacote de deploy
# ============================================
print_step "5/7 - Criando pacote de deploy..."

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE_NAME="olive-baby-web_${TIMESTAMP}.zip"

print_info "Compactando arquivos do projeto..."

# Criar zip excluindo arquivos desnecessários
zip -r "$ARCHIVE_NAME" . \
    -x "node_modules/*" \
    -x "dist/*" \
    -x "build/*" \
    -x ".git/*" \
    -x ".vscode/*" \
    -x "e2e/*" \
    -x "playwright-report/*" \
    -x "test-results/*" \
    -x "*.log" \
    -x ".env*" \
    -x "deploy-temp/*" \
    -x "*.zip" \
    -x "*.tar.gz" \
    > /dev/null 2>&1

# Adicionar docker-compose.yml do temp
zip -j "$ARCHIVE_NAME" "$TEMP_DIR/docker-compose.yml" > /dev/null 2>&1

ARCHIVE_SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)
print_success "Pacote criado: $ARCHIVE_NAME ($ARCHIVE_SIZE)"

# ============================================
# STEP 6: Informações de deploy
# ============================================
print_step "6/7 - Preparando deploy no VPS..."

print_info "Arquivo pronto para deploy: $ARCHIVE_NAME"
print_info "VPS ID: $VPS_ID"
print_info "Projeto: $PROJECT_NAME"
echo ""
print_info "Para fazer o deploy, use o Cursor Agent com:"
echo -e "${CYAN}    Deploy olive-baby-web usando o arquivo $ARCHIVE_NAME${NC}"
echo ""
print_info "Ou use o comando curl para fazer upload manual:"
echo -e "${CYAN}    # Comando será fornecido pela API Hostinger${NC}"

# ============================================
# STEP 7: Limpeza
# ============================================
print_step "7/7 - Limpeza..."

read -p "Deseja manter o arquivo $ARCHIVE_NAME? (s/N): " response
if [[ ! "$response" =~ ^[Ss]$ ]]; then
    rm -f "$ARCHIVE_NAME"
    print_success "Arquivo temporário removido"
else
    print_info "Arquivo mantido: $ARCHIVE_NAME"
fi

rm -rf "$TEMP_DIR"
print_success "Arquivos temporários removidos"

# ============================================
# Finalização
# ============================================
echo -e "\n${GREEN}"
cat << "EOF"

╔══════════════════════════════════════════╗
║   ✓ SCRIPT DE DEPLOY CONCLUÍDO           ║
╚══════════════════════════════════════════╝

EOF
echo -e "${NC}"

print_info "Próximos passos:"
echo -e "${CYAN}  1. Use o Cursor Agent para fazer o deploy real${NC}"
echo -e "${CYAN}  2. Verifique os logs do projeto${NC}"
echo -e "${CYAN}  3. Acesse: https://oliecare.cloud${NC}"
echo ""
print_success "Deploy preparado com sucesso! 🎉"
