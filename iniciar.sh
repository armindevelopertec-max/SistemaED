#!/bin/bash

set -e

echo "=== SMIA - Iniciando Sistema ==="

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Funciones
log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Verificar Docker
log_info "Verificando Docker..."
if ! command -v docker &> /dev/null; then
    log_error "Docker no está instalado"
    exit 1
fi

if ! docker info &> /dev/null; then
    log_error "Docker no está corriendo"
    exit 1
fi
log_success "Docker OK"

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose no está instalado"
    exit 1
fi

# Detener contenedores existentes
log_info "Deteniendo contenedores anteriores..."
docker-compose down 2>/dev/null || true

# Iniciar servicios con Docker Compose
log_info "Iniciando PostgreSQL, MinIO y Redis..."
docker-compose up -d

# Esperar a que PostgreSQL esté listo
log_info "Esperando PostgreSQL..."
for i in {1..30}; do
    if docker exec smia_postgres pg_isready -U smia_user -d smia_db -p 5432 &> /dev/null; then
        log_success "PostgreSQL listo"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "PostgreSQL no respondió a tiempo"
        exit 1
    fi
    sleep 1
done

# Esperar MinIO (verificar con curl al API)
log_info "Esperando MinIO..."
for i in {1..30}; do
    if curl -s http://localhost:9010/minio/health/live &> /dev/null; then
        log_success "MinIO listo"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "MinIO no respondió a tiempo"
        exit 1
    fi
    sleep 1
done

# Backend
log_info "Instalando dependencias del backend..."
cd backend
npm install

log_info "Generando Prisma Client..."
npx prisma generate

log_info "Sincronizando base de datos..."
npx prisma db push

# Crear usuario admin inicial si no existe
log_info "Verificando usuario admin..."
ADMIN_EXISTS=$(docker exec smia_postgres psql -U smia_user -d smia_db -t -c "SELECT COUNT(*) FROM users WHERE role = 'ADMINISTRADOR';" 2>/dev/null || echo "0")
ADMIN_EXISTS=$(echo $ADMIN_EXISTS | tr -d ' ')

if [ "$ADMIN_EXISTS" = "0" ]; then
    log_info "Creando usuario admin inicial..."
    docker exec smia_postgres psql -U smia_user -d smia_db -c "
    INSERT INTO users (email, password, nombre, role, activo, \"createdAt\", \"updatedAt\")
    VALUES (
        'admin@smia.com',
        '\$2a\$10\$N9qo8uLOickgx2ZMRZoHKuQxpmwPPRITBfqH7iVFMGaPRB6vKq.C',
        'Administrador',
        'ADMINISTRADOR',
        true,
        NOW(),
        NOW()
    );" 2>/dev/null || log_info "Usuario admin ya existe o error al crear"
    log_success "Usuario admin: admin@smia.com / admin123"
else
    log_success "Usuario admin ya existe"
fi

# Frontend
log_info "Instalando dependencias del frontend..."
cd ../frontend
npm install

echo ""
echo "========================================"
log_success "Sistema SMIA iniciado"
echo "========================================"
echo ""
echo "Servicios:"
echo "  PostgreSQL:  localhost:5434"
echo "  MinIO:       localhost:9010 (API) / localhost:9011 (Console)"
echo "  Redis:       localhost:6380"
echo ""
echo "Aplicaciones:"
echo "  Backend:     http://localhost:3001"
echo "  Frontend:    http://localhost:3000"
echo "  API Docs:    http://localhost:3001/api/docs"
echo ""
echo "Credenciales iniciales:"
echo "  MinIO:       smia_minio_root / smia_minio_password"
echo "  Admin:       admin@smia.com / admin123"
echo ""
echo "========================================"
echo ""
log_info "Iniciando backend en segundo plano..."
cd ../backend
npm run start:dev &
BACKEND_PID=$!

log_info "Iniciando frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
log_success "Todos los servicios están corriendo"
log_info "Presiona Ctrl+C para detener"

# Cleanup
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker-compose down; exit" SIGINT SIGTERM

wait