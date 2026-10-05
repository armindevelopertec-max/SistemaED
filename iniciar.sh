#!/bin/bash

echo "=== SMIA - Iniciando todos los servicios ==="

BASE_DIR="/home/arminserver/SistemaED"

# Verificar que los contenedores estén corriendo
echo ""
echo "--- Verificando contenedores Podman ---"
cd "$BASE_DIR"
podman ps --format "table {{.Names}}\t{{.Status}}" | grep -E "postgres|redis|minio" || {
    echo "Contenedores no encontrados. Levantando..."
    podman-compose up -d
}

# Limpiar procesos previos en puertos
echo ""
echo "--- Liberando puertos ---"
fuser -k 3003/tcp 2>/dev/null && echo "Puerto 3003 liberado" || echo "Puerto 3003 libre"
fuser -k 3002/tcp 2>/dev/null && echo "Puerto 3002 liberado" || echo "Puerto 3002 libre"

# Verificar cloudflared
echo ""
echo "--- Verificando Cloudflared ---"
if ! pgrep -f "cloudflared.*config.yml" > /dev/null; then
    echo "Cloudflared no está corriendo. Iniciando..."
    cloudflared --config /home/arminserver/.cloudflared/config.yml tunnel run 9c10117d-e974-4194-8bc8-32f772aea14e > /tmp/cloudflared.log 2>&1 &
    echo "Cloudflared iniciado"
else
    echo "Cloudflared ya está corriendo"
fi

# Verificar que PostgreSQL esté listo
echo ""
echo "--- Esperando PostgreSQL ---"
for i in {1..20}; do
    if podman exec smia-postgres pg_isready -U smia > /dev/null 2>&1; then
        echo "PostgreSQL listo!"
        break
    fi
    sleep 1
done

# Reiniciar backend
echo ""
echo "--- Reiniciando Backend ---"
cd "$BASE_DIR/backend"
npm run build > /dev/null 2>&1
pm2 restart smia-backend 2>/dev/null || pm2 start dist/main.js --name smia-backend
sleep 3

# Verificar backend
for i in {1..10}; do
    if curl -s http://localhost:3003/api/auth/inicio-sesion > /dev/null 2>&1; then
        echo "Backend listo!"
        break
    fi
    sleep 1
done

# Reiniciar frontend
echo ""
echo "--- Reiniciando Frontend ---"
cd "$BASE_DIR/frontend"
npm run build > /dev/null 2>&1
pm2 restart smia-frontend 2>/dev/null || pm2 start npm --name smia-frontend -- start
sleep 3

echo ""
echo "=== Servicios iniciados ==="
echo "Frontend: https://smia.segtecam.space"
echo "Backend:  http://localhost:3003"
echo "API Docs: http://localhost:3003/api/docs"
echo ""
pm2 list
