# SMIA - Sistema de Gestión de Trámites

Sistema de gestión de trámites y certificados con autenticación por roles, almacenamiento de documentos y generación de PDFs.

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Frontend | Next.js 14 (React) |
| Backend | NestJS 10 |
| Base de Datos | PostgreSQL 16 |
| Almacenamiento | MinIO (S3 Compatible) |
| Autenticación | JWT + Passport.js |
| ORM | Prisma |

## Arquitectura

```
[ Frontend: Next.js ] ──(HTTP/JWT)──> [ Backend: NestJS ] ──> [ DB: PostgreSQL ]
                                                  │
                                                  └──(S3 API)──> [ Storage: MinIO ]
```

## Roles de Usuario

- **ADMINISTRADOR**: Gestión completa de trámites, usuarios y documentos
- **VISUALIZADOR**: Solo búsqueda y consulta de trámites

## Requisitos Previos

- Docker y Docker Compose
- Node.js 18+
- npm o yarn

## Inicio Rápido

### 1. Clonar el proyecto

```bash
cd sistemaED
```

### 2. Iniciar servicios con Docker

```bash
docker-compose up -d
```

### 3. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

### 4. Frontend (otra terminal)

```bash
cd frontend
npm install
npm run dev
```

### 5. Crear usuario admin

```bash
cd backend
npx ts-node prisma/seed.ts
```

O usar el script automatizado:

```bash
./iniciar.sh
```

## Credenciales

### Admin (aplicación)
- **Email**: admin@smia.com
- **Contraseña**: admin123

### MinIO Console
- **URL**: http://localhost:9011
- **Access Key**: smia_minio_root
- **Secret Key**: smia_minio_password

## Puertos

| Servicio | Puerto |
|----------|--------|
| Frontend | 3000 |
| Backend API | 3001 |
| API Docs (Swagger) | 3001/api/docs |
| PostgreSQL | 5434 |
| MinIO API | 9010 |
| MinIO Console | 9011 |
| Redis | 6380 |

## Endpoints API

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /auth/login | Iniciar sesión |
| POST | /auth/register | Registrar usuario |
| GET | /auth/profile | Perfil del usuario |

### Trámites

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | /tramites | Listar trámites | Todos |
| GET | /tramites/:id | Obtener trámite | Todos |
| GET | /tramites/buscar | Buscar por Hoja de Ruta o RAI | Todos |
| POST | /tramites | Crear trámite | ADMIN |
| PATCH | /tramites/:id | Actualizar trámite | ADMIN |
| DELETE | /tramites/:id | Eliminar trámite | ADMIN |
| POST | /tramites/:id/pdf | Generar PDF | ADMIN |
| POST | /tramites/:id/documentos | Agregar documento | ADMIN |
| DELETE | /tramites/:id/documentos/:docId | Eliminar documento | ADMIN |
| GET | /tramites/stats | Estadísticas | ADMIN |

### Usuarios

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | /users | Listar usuarios | ADMIN |
| GET | /users/:id | Obtener usuario | ADMIN |
| POST | /users | Crear usuario | ADMIN |
| PATCH | /users/:id | Actualizar usuario | ADMIN |
| DELETE | /users/:id | Desactivar usuario | ADMIN |

### Reportes

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | /reportes/estados | Reporte de estados | ADMIN |
| GET | /reportes/por-vencer | Trámites próximos a vencer | ADMIN |

## Estados de Trámites

- **PENDIENTE**: Trámite creado, aún no vence
- **VIGENTE**: Trámite activo y dentro del plazo
- **POR_VENCER**: Vence en los próximos 3 días
- **VENCIDO**: Fecha de vencimiento superada

## Cron Jobs

El sistema actualiza automáticamente los estados de los trámites:
- **Diario a medianoche**: Evalúa fechas de vencimiento y actualiza estados

## Estructura del Proyecto

```
sistemaED/
├── docker-compose.yml
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── auth/           # Autenticación JWT
│       ├── users/          # Gestión de usuarios
│       ├── tramites/       # Módulo de trámites
│       ├── minio/          # Integración con MinIO
│       ├── reportes/       # Reportes y Cron Jobs
│       └── database/       # Prisma Service
└── frontend/
    └── src/
        ├── app/
        │   ├── admin/      # Panel Administrador
        │   ├── visualizador/ # Panel Visualizador
        │   └── login/      # Página de login
        ├── lib/            # Cliente API
        └── types/          # Tipos TypeScript
```

## Ambiente de Desarrollo

El proyecto está configurado para desarrollo local con:
- Hot reload en ambos proyectos
- Swagger UI en http://localhost:3001/api/docs
- Logs de Prisma en consola

## Producción

Para deploy en producción:

1. Configurar variables de entorno reales en `.env`
2. Usar valores seguros para `JWT_SECRET`
3. Configurar MinIO con SSL
4. Usar PostgreSQL gestionado (no local)
5. Build del frontend: `npm run build`
6. Build del backend: `npm run build`