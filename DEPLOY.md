# 🚀 Guia de Deploy - Olive Baby Web

Este guia explica como fazer o deploy da aplicação **Olive Baby Web** no VPS usando os scripts automatizados.

## 📋 Pré-requisitos

### Windows
- PowerShell 5.1 ou superior
- Docker Desktop
- Git
- Cursor IDE com MCP Hostinger configurado

### Linux/Mac
- Bash
- Docker
- Git
- zip/unzip
- Cursor IDE com MCP Hostinger configurado

## 🎯 Scripts Disponíveis

### Windows (PowerShell)
```powershell
.\deploy.ps1
```

### Linux/Mac (Bash)
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📦 O que o script faz?

1. **✅ Validações**
   - Verifica se está na pasta correta
   - Valida instalação do Docker e Git
   - Verifica mudanças não commitadas no Git

2. **📝 Preparação**
   - Cria arquivo docker-compose.yml otimizado
   - Gera lista de exclusões (.dockerignore)
   - Obtém informações do commit atual

3. **📦 Empacotamento**
   - Cria arquivo ZIP com o código fonte
   - Exclui node_modules, dist, e arquivos desnecessários
   - Adiciona configurações de deploy

4. **🚀 Deploy**
   - Prepara pacote para upload no VPS
   - Fornece instruções para deploy via Cursor Agent

5. **🧹 Limpeza**
   - Remove arquivos temporários
   - Opcionalmente mantém o arquivo ZIP criado

## 🔧 Uso Avançado

### Parâmetros do PowerShell

```powershell
# Deploy com todas as opções padrão
.\deploy.ps1

# Deploy verbose (mais informações)
.\deploy.ps1 -Verbose

# Manter backup local
.\deploy.ps1 -SkipBackup

# Ver ajuda
Get-Help .\deploy.ps1 -Detailed
```

### Variáveis de Configuração

Você pode editar as seguintes variáveis no início do script:

```powershell
$PROJECT_NAME = "olivebaby-web"
$VPS_ID = 1188492
$API_URL = "https://oliecare.cloud/api/v1"
```

## 🎮 Workflow Completo de Deploy

### 1. Prepare o código
```bash
# Certifique-se de que está na branch correta
git checkout main

# Atualize o código
git pull origin main

# Commit suas mudanças
git add .
git commit -m "feat: nova funcionalidade"
```

### 2. Execute o script de deploy
```powershell
# Windows
.\deploy.ps1

# Linux/Mac
./deploy.sh
```

### 3. Use o Cursor Agent para deploy
Após o script gerar o arquivo ZIP, use o Cursor Agent:

```
Deploy olive-baby-web usando o arquivo olive-baby-web_20231211_143022.zip no VPS 1188492
```

O Cursor Agent com MCP Hostinger irá:
- Fazer upload do arquivo para o VPS
- Extrair os arquivos no diretório `/docker/olivebaby-web`
- Executar `docker-compose up -d --build`
- Verificar o health dos containers

### 4. Verifique o deploy
```
# Ver status dos containers
cursor> Mostrar status do projeto olivebaby-web

# Ver logs
cursor> Mostrar logs do projeto olivebaby-web

# Testar acesso
curl https://oliecare.cloud
```

## 🔍 Verificação Pós-Deploy

### Checklist de Verificação

- [ ] ✅ Container `olivebaby-web-app` está **running** e **healthy**
- [ ] ✅ Container `olivebaby-nginx-proxy` está **running** e **healthy**
- [ ] ✅ Container `olivebaby-certbot` está **running**
- [ ] ✅ Site acessível via HTTP: http://oliecare.cloud
- [ ] ✅ Site acessível via HTTPS: https://oliecare.cloud
- [ ] ✅ API acessível: https://oliecare.cloud/api/v1/health
- [ ] ✅ SSL válido (cadeado verde no navegador)
- [ ] ✅ Frontend carrega corretamente
- [ ] ✅ Login funciona
- [ ] ✅ Dashboard carrega dados

### Comandos de Verificação via Cursor Agent

```
# Status geral
cursor> Status do projeto olivebaby-web no VPS

# Logs do frontend
cursor> Logs do container olivebaby-web-app

# Logs do Nginx
cursor> Logs do container olivebaby-nginx-proxy

# Restart de um container específico
cursor> Restart container olivebaby-web-app

# Restart do projeto inteiro
cursor> Restart projeto olivebaby-web
```

## 🐛 Troubleshooting

### Problema: Container com status "unhealthy"

**Solução:**
```
cursor> Logs do container [nome-do-container]
cursor> Restart container [nome-do-container]
```

### Problema: Build falhou

**Solução:**
1. Verifique os logs de build
2. Verifique se todas as dependências estão no package.json
3. Verifique se o Dockerfile está correto
4. Tente fazer build local primeiro

### Problema: Nginx retorna 502 Bad Gateway

**Solução:**
- Verifique se o container web está rodando e healthy
- Verifique se a rede `olivebaby-network` existe
- Verifique se a API está acessível: `http://olivebaby-api:4000`

### Problema: SSL não funciona

**Solução:**
- Verifique os logs do certbot
- Verifique se o domínio aponta para o IP do VPS
- Verifique se as portas 80 e 443 estão abertas no firewall

## 📊 Monitoramento

### Ver métricas do VPS
```
cursor> Métricas do VPS 1188492
```

### Ver uso de recursos
```
cursor> Stats dos containers do projeto olivebaby-web
```

## 🔄 Rollback

Se algo der errado, você pode fazer rollback:

1. **Parar o projeto atual:**
```
cursor> Parar projeto olivebaby-web
```

2. **Deploy da versão anterior:**
- Use o arquivo ZIP da versão anterior
- Execute o deploy novamente

3. **Ou restaurar snapshot:**
```
cursor> Restaurar snapshot do VPS 1188492
```

## 🎯 Boas Práticas

1. **Sempre teste localmente antes do deploy**
   ```bash
   npm run build
   npm run preview
   ```

2. **Mantenha um backup do último deploy estável**
   - Os scripts criam arquivos com timestamp
   - Guarde o último arquivo ZIP que funcionou

3. **Use tags de versão no Git**
   ```bash
   git tag -a v1.0.0 -m "Release 1.0.0"
   git push origin v1.0.0
   ```

4. **Monitore após o deploy**
   - Verifique logs por 5-10 minutos após deploy
   - Teste as principais funcionalidades
   - Monitore uso de recursos

5. **Deploy em horários de baixo tráfego**
   - Preferencialmente fora do horário comercial
   - Avise os usuários sobre manutenção

## 📝 Logs e Histórico

### Localização dos Logs no VPS
```
/docker/olivebaby-web/
├── docker-compose.yml
└── logs/
    ├── nginx-access.log
    └── nginx-error.log
```

### Ver histórico de deploys
```bash
# No seu repositório local
git log --oneline --graph --all
```

## 🆘 Suporte

Se encontrar problemas:

1. Verifique este guia primeiro
2. Consulte os logs do container com problema
3. Verifique a documentação do Hostinger MCP
4. Entre em contato com o time de desenvolvimento

## 📞 Contatos

- **Desenvolvedor:** Vitor A. Tito
- **Email:** vitor@titotech.com.br
- **Projeto:** Olive Baby Tracker

---

**Última atualização:** 11/12/2024
**Versão do Script:** 1.0.0
