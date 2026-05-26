# ============================================
# Olive Baby Web - Deploy Hostinger via SSH
# ============================================
# Script de deploy direto via SSH (sem MCP)
# Estrategia: git push -> SSH no VPS -> rebuild container -> health check
#
# Pre-requisitos:
#   - Chave SSH ~/.ssh/id_ed25519 (anexada ao VPS como "cursor-vtaoNote-2026")
#   - Git remoto: https://github.com/vtaotito/olive-baby-web.git (branch master)
#   - VPS 1188492 (oliecare.cloud / 72.62.11.30)
#
# Uso:
#   .\deploy-hostinger.ps1                  # Deploy completo (push + rebuild)
#   .\deploy-hostinger.ps1 -SkipPush        # Pula git push (usa codigo ja no GitHub)
#   .\deploy-hostinger.ps1 -SkipBuild       # So reinicia o nginx (sem rebuild)
#   .\deploy-hostinger.ps1 -CheckOnly       # Apenas valida ambiente + chave SSH
#   .\deploy-hostinger.ps1 -DryRun          # Mostra acoes sem executar
# ============================================

[CmdletBinding()]
param(
    [switch]$SkipPush,
    [switch]$SkipBuild,
    [switch]$CheckOnly,
    [switch]$DryRun,
    [string]$CommitMessage = "",
    [string]$Branch = "master",
    [int]$BuildTimeoutSec = 600
)

$ErrorActionPreference = 'Stop'

# ============================================
# Configuracao
# ============================================
$VPS_HOST       = '72.62.11.30'
$VPS_USER       = 'root'
$VPS_ID         = 1188492
$SSH_KEY        = Join-Path $HOME '.ssh\id_ed25519'
$PROJECT_DIR    = '/docker/olivebaby-web'
$WEB_CONTAINER  = 'olivebaby-web-server'
$BUILDER_NAME   = 'olivebaby-web-builder'
$HEALTH_URL     = 'https://oliecare.cloud'
$API_HEALTH_URL = 'https://oliecare.cloud/api/v1/health'
$LOCAL_REPO     = (Get-Location).Path

$SSH_OPTS = @(
    '-i', $SSH_KEY,
    '-o', 'BatchMode=yes',
    '-o', 'ConnectTimeout=15',
    '-o', 'ServerAliveInterval=30',
    '-o', 'StrictHostKeyChecking=accept-new'
)

# ============================================
# Helpers de saida
# ============================================
function Write-Step($msg)    { Write-Host "`n[STEP] $msg" -ForegroundColor Cyan }
function Write-Ok($msg)      { Write-Host "  [OK]   $msg" -ForegroundColor Green }
function Write-Warn2($msg)   { Write-Host "  [WARN] $msg" -ForegroundColor Yellow }
function Write-Fail($msg)    { Write-Host "  [FAIL] $msg" -ForegroundColor Red }
function Write-Info2($msg)   { Write-Host "  [INFO] $msg" -ForegroundColor Gray }

function Invoke-Ssh {
    param(
        [Parameter(Mandatory)][string]$Command,
        [switch]$Quiet
    )
    if ($DryRun) {
        Write-Info2 "DRY-RUN ssh> $Command"
        return ''
    }
    $sshArgs = @() + $SSH_OPTS + @("$VPS_USER@$VPS_HOST", $Command)
    if ($Quiet) {
        $output = & ssh @sshArgs 2>&1
    } else {
        $output = & ssh @sshArgs 2>&1
    }
    if ($LASTEXITCODE -ne 0) {
        throw "SSH falhou (exit $LASTEXITCODE) ao executar: $Command`n$output"
    }
    return ($output -join "`n")
}

function Show-Banner {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "  OLIVE BABY WEB - DEPLOY HOSTINGER (via SSH)" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "  VPS    : $VPS_USER@$VPS_HOST (ID $VPS_ID)" -ForegroundColor Gray
    Write-Host "  Branch : $Branch" -ForegroundColor Gray
    Write-Host "  Chave  : $SSH_KEY" -ForegroundColor Gray
    if ($DryRun)    { Write-Host "  Modo   : DRY-RUN (nao executa mudancas)" -ForegroundColor Yellow }
    if ($CheckOnly) { Write-Host "  Modo   : CHECK-ONLY (apenas validacoes)" -ForegroundColor Yellow }
    Write-Host ""
}

# ============================================
# 1. Validacao do ambiente local + chave SSH
# ============================================
function Test-Environment {
    Write-Step "1/6 Validando ambiente local"

    if (-not (Test-Path "$LOCAL_REPO\package.json")) {
        throw "package.json nao encontrado em $LOCAL_REPO. Execute o script na raiz do olive-baby-web."
    }
    Write-Ok "Diretorio do projeto OK ($LOCAL_REPO)"

    foreach ($bin in @('ssh','git')) {
        if (-not (Get-Command $bin -ErrorAction SilentlyContinue)) {
            throw "'$bin' nao esta no PATH. Instale antes de continuar."
        }
    }
    Write-Ok "ssh e git encontrados no PATH"

    if (-not (Test-Path $SSH_KEY)) {
        throw @"
Chave SSH nao encontrada em $SSH_KEY.
Esta e a chave anexada ao VPS como 'cursor-vtaoNote-2026'.
Gere ou copie a chave correta antes de continuar.
"@
    }
    Write-Ok "Chave SSH presente: $SSH_KEY"

    $fingerprint = & ssh-keygen -l -f $SSH_KEY 2>$null
    if ($fingerprint) { Write-Info2 "Fingerprint: $fingerprint" }
}

# ============================================
# 2. Teste de conectividade SSH
# ============================================
function Test-SshConnectivity {
    Write-Step "2/6 Testando conexao SSH com o VPS"

    try {
        $remote = Invoke-Ssh -Command "echo OK && hostname && uname -sr && docker --version"
    } catch {
        Write-Fail "Falha ao conectar via SSH."
        Write-Info2 "Diagnostico rapido:"
        Write-Info2 "  ssh -i $SSH_KEY -vvv $VPS_USER@$VPS_HOST"
        throw $_
    }

    foreach ($line in ($remote -split "`n")) {
        Write-Ok $line.Trim()
    }
}

# ============================================
# 3. Validacao do Git local e push
# ============================================
function Sync-Git {
    Write-Step "3/6 Sincronizando codigo com o GitHub"

    Push-Location $LOCAL_REPO
    try {
        $currentBranch = (git rev-parse --abbrev-ref HEAD).Trim()
        if ($currentBranch -ne $Branch) {
            Write-Warn2 "Branch atual '$currentBranch' difere do alvo '$Branch'."
            $resp = Read-Host "Continuar mesmo assim? (s/N)"
            if ($resp -notmatch '^[sSyY]') { throw "Deploy cancelado pelo usuario." }
        } else {
            Write-Ok "Branch atual: $currentBranch"
        }

        $shortSha = (git rev-parse --short HEAD).Trim()
        $authorLine = (git log -1 --pretty=format:'%an <%ae> | %s').Trim()
        Write-Info2 "HEAD : $shortSha"
        Write-Info2 "Autor: $authorLine"

        $dirty = (git status --porcelain) -join ''
        if ($dirty) {
            Write-Warn2 "Existem mudancas nao commitadas:"
            git status --short
            if ($CommitMessage) {
                if ($DryRun) {
                    Write-Info2 "DRY-RUN git> commit -am '$CommitMessage'"
                } else {
                    git add -A
                    git commit -m $CommitMessage
                    Write-Ok "Commit criado: $CommitMessage"
                }
            } else {
                $resp = Read-Host "Continuar sem commit? (s/N)"
                if ($resp -notmatch '^[sSyY]') { throw "Deploy cancelado pelo usuario." }
            }
        }

        if ($SkipPush) {
            Write-Warn2 "Push pulado (-SkipPush). O VPS usara o codigo ja no GitHub."
            return
        }

        if ($DryRun) {
            Write-Info2 "DRY-RUN git> push origin $Branch"
        } else {
            Write-Info2 "Executando git push origin $Branch ..."
            git push origin $Branch
            if ($LASTEXITCODE -ne 0) { throw "git push falhou (exit $LASTEXITCODE)." }
            Write-Ok "Push concluido para origin/$Branch"
        }
    } finally {
        Pop-Location
    }
}

# ============================================
# 4. Rebuild remoto (container builder + nginx)
# ============================================
function Invoke-RemoteRebuild {
    Write-Step "4/6 Executando rebuild remoto no VPS"

    if ($SkipBuild) {
        Write-Warn2 "Build pulado (-SkipBuild). Apenas reiniciando o nginx."
        Invoke-Ssh -Command "cd $PROJECT_DIR && docker compose restart web" | Out-Null
        Write-Ok "Container web reiniciado."
        return
    }

    $logFile = "/var/log/olivebaby-web-deploy-$(Get-Date -Format yyyyMMdd_HHmmss).log"

    $remoteScript = @"
set -e
cd $PROJECT_DIR
echo '>>> Acionando container builder (git pull + npm build)...'
docker compose up -d --force-recreate builder 2>&1 | tee $logFile
echo '>>> Aguardando builder finalizar...'
TIMEOUT=$BuildTimeoutSec
START=`$(date +%s)
while true; do
  STATE=`$(docker inspect -f '{{.State.Status}}' $BUILDER_NAME 2>/dev/null || echo 'gone')
  if [ "`$STATE" = "exited" ] || [ "`$STATE" = "gone" ]; then
    break
  fi
  NOW=`$(date +%s)
  ELAPSED=`$((NOW - START))
  if [ "`$ELAPSED" -gt "`$TIMEOUT" ]; then
    echo "ERRO: build excedeu `${TIMEOUT}s"
    docker logs --tail 80 $BUILDER_NAME || true
    exit 124
  fi
  sleep 5
done
EXITCODE=`$(docker inspect -f '{{.State.ExitCode}}' $BUILDER_NAME 2>/dev/null || echo 1)
echo ">>> Builder finalizado (exit=`$EXITCODE)"
if [ "`$EXITCODE" != "0" ]; then
  echo '>>> Tail dos logs do builder:'
  docker logs --tail 60 $BUILDER_NAME || true
  exit 1
fi
echo '>>> Reiniciando container web (nginx)...'
docker compose restart web
sleep 3
docker ps --filter 'name=olivebaby-web' --format 'table {{.Names}}\t{{.Status}}'
"@

    if ($DryRun) {
        Write-Info2 "DRY-RUN ssh remoto:"
        $remoteScript -split "`n" | ForEach-Object { Write-Info2 "  $_" }
        return
    }

    $output = Invoke-Ssh -Command $remoteScript
    $output -split "`n" | ForEach-Object {
        if ($_ -match '^>>>')           { Write-Info2 $_.Trim() }
        elseif ($_ -match 'ERRO|error') { Write-Fail $_.Trim() }
        elseif ($_.Trim())              { Write-Host "    $($_.Trim())" -ForegroundColor DarkGray }
    }
    Write-Ok "Rebuild remoto concluido"
}

# ============================================
# 5. Health check remoto + HTTP
# ============================================
function Test-Health {
    Write-Step "5/6 Validando health pos-deploy"

    Start-Sleep -Seconds 5

    $statusCmd = "docker ps --filter 'name=olivebaby-' --format '{{.Names}}|{{.Status}}'"
    $rawStatus = Invoke-Ssh -Command $statusCmd
    foreach ($line in ($rawStatus -split "`n" | Where-Object { $_ })) {
        $parts = $line -split '\|'
        $name  = $parts[0]
        $stat  = $parts[1]
        if ($stat -match 'healthy|Up')      { Write-Ok "$name -> $stat" }
        elseif ($stat -match 'unhealthy')   { Write-Warn2 "$name -> $stat" }
        else                                { Write-Fail "$name -> $stat" }
    }

    $endpoints = @(
        @{ Name = 'Site (HTTPS)';   Url = $HEALTH_URL;     ExpectMatch = '<html' },
        @{ Name = 'API /health';    Url = $API_HEALTH_URL; ExpectMatch = $null }
    )

    foreach ($ep in $endpoints) {
        try {
            if ($DryRun) {
                Write-Info2 "DRY-RUN HTTP> GET $($ep.Url)"
                continue
            }
            $resp = Invoke-WebRequest -Uri $ep.Url -Method Get -TimeoutSec 20 -UseBasicParsing
            if ($resp.StatusCode -eq 200) {
                if ($ep.ExpectMatch -and ($resp.Content -notmatch $ep.ExpectMatch)) {
                    Write-Warn2 "$($ep.Name) HTTP 200 mas conteudo inesperado."
                } else {
                    Write-Ok "$($ep.Name) HTTP 200 ($([int]$resp.RawContentLength) bytes)"
                }
            } else {
                Write-Warn2 "$($ep.Name) HTTP $($resp.StatusCode)"
            }
        } catch {
            Write-Warn2 "$($ep.Name) indisponivel: $($_.Exception.Message)"
        }
    }
}

# ============================================
# 6. Resumo final
# ============================================
function Show-Summary {
    Write-Step "6/6 Resumo"

    if ($CheckOnly) {
        Write-Host ""
        Write-Host "  Modo CHECK-ONLY: ambiente e SSH validados, nada foi alterado." -ForegroundColor Yellow
        Write-Host ""
        return
    }

    Write-Host ""
    Write-Host "  Deploy concluido com sucesso." -ForegroundColor Green
    Write-Host "  Site : $HEALTH_URL" -ForegroundColor Gray
    Write-Host "  API  : $API_HEALTH_URL" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Para acompanhar logs em tempo real:" -ForegroundColor Gray
    Write-Host "    ssh -i $SSH_KEY $VPS_USER@$VPS_HOST 'docker logs -f $WEB_CONTAINER'" -ForegroundColor DarkGray
    Write-Host ""
}

# ============================================
# Pipeline principal
# ============================================
try {
    Show-Banner
    Test-Environment
    Test-SshConnectivity

    if ($CheckOnly) {
        Show-Summary
        exit 0
    }

    Sync-Git
    Invoke-RemoteRebuild
    Test-Health
    Show-Summary
    exit 0
} catch {
    Write-Host ""
    Write-Fail $_.Exception.Message
    Write-Host ""
    exit 1
}
