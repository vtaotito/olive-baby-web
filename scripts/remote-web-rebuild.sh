#!/bin/bash
set -euo pipefail
cd /docker/olivebaby-web
echo ">>> Recreating builder..."
docker compose up -d --force-recreate builder
TIMEOUT=600
START=$(date +%s)
while true; do
  STATE=$(docker inspect -f '{{.State.Status}}' olivebaby-web-builder 2>/dev/null || echo gone)
  if [ "$STATE" = "exited" ] || [ "$STATE" = "gone" ]; then
    break
  fi
  NOW=$(date +%s)
  ELAPSED=$((NOW - START))
  if [ "$ELAPSED" -gt "$TIMEOUT" ]; then
    echo "ERRO: build excedeu ${TIMEOUT}s"
    docker logs --tail 80 olivebaby-web-builder || true
    exit 124
  fi
  sleep 5
done
EXITCODE=$(docker inspect -f '{{.State.ExitCode}}' olivebaby-web-builder 2>/dev/null || echo 1)
echo ">>> Builder exit=$EXITCODE"
if [ "$EXITCODE" != "0" ]; then
  docker logs --tail 60 olivebaby-web-builder || true
  exit 1
fi
echo ">>> Restarting web..."
docker compose restart web
sleep 3
docker ps --filter name=olivebaby-web --format 'table {{.Names}}\t{{.Status}}'
