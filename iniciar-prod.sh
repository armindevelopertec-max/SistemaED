#!/bin/bash

set -e

echo "=== SistemaED - Iniciando Producción (Podman) ==="

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_success() { echo -e "${GREEN}✓ $1${NC}"; }
log_info() { echo -e "${YELLOW}→ $1${NC}"; }
log_error() { echo -e "${RED}✗ $1${NC}"; }

# Verificar Podman
log_info "Verificando Podman..."
if ! command -v podman &> /dev/null || ! podman info &> /dev/null; then
    log_error "Podman no disponible"
    exit 1
fi
log_success "Podman OK"

# Verificar podman-compose
if ! command -v podman-compose &> /dev/null; then
    log_error "podman-compose no instalado"
    exit 1
fi

COMPOSE_CMD="podman-compose"

# Detener contenedores anteriores
log_info "Deteniendo contenedores anteriores..."
$COMPOSE_CMD down 2>/dev/null || true

# Iniciar servicios de datos
log_info "Iniciando PostgreSQL, MinIO y Redis..."
$COMPOSE_CMD up -d

# Esperar PostgreSQL
log_info "Esperando PostgreSQL..."
for i in {1..30}; do
    if podman exec smia_postgres pg_isready -U smia_user -d smia_db -p 5432 &> /dev/null; then
        log_success "PostgreSQL listo"
        break
    fi
    if [ $i -eq 30 ]; then log_error "PostgreSQL no respondió"; exit 1; fi
    sleep 1
done

# Esperar MinIO
log_info "Esperando MinIO..."
for i in {1..30}; do
    if curl -s http://localhost:9020/minio/health/live &> /dev/null; then
        log_success "MinIO listo"
        break
    fi
    if [ $i -eq 30 ]; then log_error "MinIO no respondió"; exit 1; fi
    sleep 1
done

# Backend - Build
log_info "Building backend..."
cd backend
npm ci
npm run build

# Generar Prisma Client y migraciones
log_info "Generando Prisma Client..."
npx prisma generate

log_info "Ejecutando migraciones..."
npx prisma migrate deploy

cd ..

# Frontend - Build
log_info "Building frontend..."
cd frontend
npm ci
npm run build

cd ..

echo ""
echo "========================================"
log_success "Build completado - Listo para producción"
echo "========================================"
echo ""
echo "Para iniciar en producción:"
echo "  cd backend && npm run start:prod &"
echo "  cd frontend && npm run start &"
echo ""
echo "O usar PM2 / systemd para gestión de procesos"
echo ""

# Verificar builds
if [ -d "backend/dist" ] && [ -d "frontend/.next/standalone" ]; then
    log_success "Builds verificados correctamente"
else
    log_error "Builds incompletos"
    exit 1
fi