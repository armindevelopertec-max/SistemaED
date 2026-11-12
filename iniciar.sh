#!/bin/bash
# =====================================================
#  SMIA - Iniciar todos los servicios (Podman + PM2)
#  - Contenedores: PostgreSQL, Redis, MinIO
#  - Cloudflared Tunnel (servicio systemd)
#  - Backend NestJS  (pm2, puerto 3003)
#  - Frontend Next.js (pm2, puerto 3002)
# =====================================================
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT/backend"
FRONTEND_DIR="$ROOT/frontend"

info() { echo -e "\e[1;34m[INFO]\e[0m $1"; }
ok()   { echo -e "\e[1;32m[OK]\e[0m   $1"; }
fail() { echo -e "\e[1;31m[ERROR]\e[0m $1"; exit 1; }

# --------------------------------------------
# 1) Cloudflared (túnel compartido con AAM)
# --------------------------------------------
info "Verificando Cloudflared..."
if systemctl is-active --quiet cloudflared-aam.service; then
    ok "Cloudflared ya está corriendo"
else
    info "Iniciando Cloudflared (servicio systemd)..."
    sudo systemctl start cloudflared-aam.service || fail "No se pudo iniciar cloudflared"
    sleep 3
    systemctl is-active --quiet cloudflared-aam.service || fail "cloudflared no quedó activo"
    ok "Cloudflared iniciado"
fi

# --------------------------------------------
# 2) Contenedores
# --------------------------------------------
info "Levantando contenedores..."
cd "$ROOT"
podman-compose up -d postgres redis minio 2>&1 | tail -3 || fail "No se pudieron iniciar los contenedores"

for i in $(seq 1 60); do
    bad=0
    for c in smia_postgres smia_redis smia_minio; do
        if ! podman ps -q -f name="^${c}$" | grep -q .; then
            bad=1; break
        fi
        h=$(podman inspect --format '{{.State.Health.Status}}' "$c" 2>/dev/null || echo "unknown")
        [ "$h" = "healthy" ] || { bad=1; break; }
    done
    if [ "$bad" -eq 0 ]; then
        ok "Contenedores healthy"
        break
    fi
    [ "$i" = "60" ] && fail "Contenedores no quedaron healthy (revisa: podman ps -a)"
    sleep 2
done

# --------------------------------------------
# 3) Backend - PM2
# --------------------------------------------
info "Preparando backend..."
cd "$BACKEND_DIR"
[ -f .env ] || fail "No existe backend/.env"

[ -d node_modules ] || { info "Instalando dependencias backend..."; npm ci --no-audit --no-fund || fail "Falló npm ci"; }
[ -f dist/main.js ] || { info "Compilando backend..."; npm run build || fail "Falló el build del backend"; }

info "Sincronizando schema Prisma..."
npx prisma db push --skip-generate >/dev/null || fail "Falló prisma db push"

pm2 delete smia-backend >/dev/null 2>&1 || true
info "Iniciando smia-backend en pm2..."
pm2 start dist/main.js --name smia-backend

for i in $(seq 1 120); do
    if curl -sf -o /dev/null http://127.0.0.1:3003/api/docs 2>/dev/null; then
        ok "Backend listo"
        break
    fi
    [ "$i" = "120" ] && fail "Backend no respondió a tiempo (revisa: pm2 logs smia-backend)"
    sleep 1
done

# --------------------------------------------
# 4) Frontend - PM2
# --------------------------------------------
info "Preparando frontend..."
cd "$FRONTEND_DIR"

[ -f .env ] || printf 'NEXT_PUBLIC_API_URL=/api\n' > .env
[ -d node_modules ] || { info "Instalando dependencias frontend..."; npm ci --no-audit --no-fund || fail "Falló npm ci"; }
[ -f .next/BUILD_ID ] || { info "Compilando frontend..."; NEXT_TELEMETRY_DISABLED=1 npm run build || fail "Falló el build del frontend"; }

pm2 delete smia-frontend >/dev/null 2>&1 || true
info "Iniciando smia-frontend en pm2..."
pm2 start npm --name smia-frontend -- start

for i in $(seq 1 60); do
    if curl -sf -o /dev/null http://127.0.0.1:3002 2>/dev/null; then
        ok "Frontend listo"
        break
    fi
    [ "$i" = "60" ] && fail "Frontend no respondió a tiempo (revisa: pm2 logs smia-frontend)"
    sleep 1
done

pm2 save

echo ""
echo "==================================================="
echo "  SMIA INICIADO"
echo "==================================================="
echo "  Frontend : https://smia.segtecam.space"
echo "  Backend  : http://localhost:3003"
echo "  API Docs : http://localhost:3003/api/docs"
echo "==================================================="
pm2 list
