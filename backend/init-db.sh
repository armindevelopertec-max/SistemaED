#!/bin/bash

set -e

echo "=== SMIA - Inicializando base de datos ==="

for i in {1..30}; do
    if PGPASSWORD=smia_password psql -h localhost -p 5435 -U smia_user -d smia_db -c "SELECT 1" &> /dev/null; then
        echo "PostgreSQL listo"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "Error: PostgreSQL no disponible"
        exit 1
    fi
    sleep 1
done

echo "Ejecutando seed..."
cd /app
npx prisma db push --skip-generate
npx ts-node prisma/seed.ts

echo "Base de datos inicializada"
