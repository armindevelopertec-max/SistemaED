# SMIA - Sistema de Gestión Ambiental

**URL de Producción**: https://smia.segtecam.space

Sistema de gestión de expedientes ambientales para unidades industriales con autenticación por roles, almacenamiento de documentos y gestión de expedientes ambientales.

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

- **ADMINISTRADOR**: Gestión completa de expedientes, usuarios y documentos
- **VISUALIZADOR**: Solo búsqueda y consulta de expedientes

## Requisitos Previos

### Windows
- **Docker Desktop** (con WSL2 backend)
- Node.js 18+ (o usar WSL2)
- Git

### Linux/Mac
- Docker y Docker Compose (o Podman)
- Node.js 18+
- Git

## Inicio Rápido

### 1. Clonar el proyecto

```bash
git clone <repo-url>
cd SistemaED
```

### 2. Configurar Docker Desktop (Windows)

Si usas Windows con Docker Desktop:
1. Asegúrate que WSL2 esté habilitado
2. Docker Desktop > Settings > General > Usar backend WSL2
3. Asegúrate que Docker Compose v2 esté habilitado

### 3. Iniciar servicios

Desde PowerShell o WSL2:

```bash
docker-compose up -d
```

O si prefieres Docker Compose v1:

```bash
docker-compose-1 up -d
```

### 4. Esperar a que PostgreSQL esté listo y aplicar schema

```powershell
# Esperar 15 segundos
Start-Sleep -Seconds 15

cd backend
npm install
npx prisma db push
npx ts-node prisma/seed.ts
```

O usar el script automatizado (desde WSL2 o Git Bash):

```bash
./iniciar.sh
```

## Credenciales

### Admin (aplicación)
- **URL**: https://smia.segtecam.space
- **Email**: admin@smia.com
- **Contraseña**: admin123

### MinIO Console
- **URL**: http://localhost:9021
- **Access Key**: smia_minio_root
- **Secret Key**: smia_minio_password

## Puertos

| Servicio | Puerto |
|----------|--------|
| Frontend | 3002 |
| Backend API | 3003 |
| API Docs (Swagger) | 3003/api/docs |
| PostgreSQL | 5435 |
| MinIO API | 9020 |
| MinIO Console | 9021 |

> **Producción**: Frontend accesible en https://smia.segtecam.space

## Módulos del Expediente

### 1. Identificación de Unidad Industrial
Datos básicos de la planta industrial.

### 2. Rubro de Actividad (CAEB)
Actividades económicas de la unidad.

### 3. Registro Ambiental Industrial (RAI)
- Registro inicial
- Historial de actualizaciones, modificaciones y renovaciones

### 4. IRAP Categoría 3
Instrumentos ambientales para industrias de Categoría 3.

### 5. IRAP Categoría 1 y 2
Instrumentos ambientales para industrias de Categoría 1 y 2.

### 6. Informes Ambientales Anuales (IAA)
Gestión de informes anuales con documentos escaneados.

## Endpoints API

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/auth/inicio-sesion | Iniciar sesión |
| POST | /api/auth/registrar | Registrar usuario |
| GET | /api/auth/perfil | Perfil del usuario |

### Expediente

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | /api/expediente/unidades-industriales | Listar unidades | ADMIN |
| POST | /api/expediente/unidades-industriales | Crear unidad | ADMIN |
| GET | /api/expediente/unidades-industriales/:id | Ver unidad | ADMIN |
| PATCH | /api/expediente/unidades-industriales/:id | Actualizar unidad | ADMIN |
| GET | /api/expediente/unidades-industriales/:id/expediente-completo | Expediente completo | ADMIN |
| GET | /api/expediente/unidades-industriales/:id/rai | RAI de unidad | ADMIN |
| POST | /api/expediente/unidades-industriales/:id/rai/registro-inicial | Crear RAI inicial | ADMIN |
| POST | /api/expediente/rai/:id/historial | Agregar historial RAI | ADMIN |
| GET | /api/expediente/unidades-industriales/:id/irap-categoria3 | IRAP Cat 3 | ADMIN |
| POST | /api/expediente/unidades-industriales/:id/irap-categoria3 | Crear IRAP Cat 3 | ADMIN |
| GET | /api/expediente/unidades-industriales/:id/irap-categoria12 | IRAP Cat 1-2 | ADMIN |
| POST | /api/expediente/unidades-industriales/:id/irap-categoria12 | Crear IRAP Cat 1-2 | ADMIN |
| GET | /api/expediente/unidades-industriales/:id/informes-ambientales | IAA | ADMIN |
| POST | /api/expediente/unidades-industriales/:id/informes-ambientales | Crear IAA | ADMIN |

### Subida de Documentos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/expediente/rai/documento/:tipo/:id | Subir documento RAI |
| POST | /api/expediente/irap-categoria3/:id/documento | Subir documento IRAP Cat 3 |
| POST | /api/expediente/irap-categoria12/:id/documento | Subir documento IRAP Cat 1-2 |
| POST | /api/expediente/informes-ambientales/:id/documento | Subir documento IAA |

### Reportes

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | /api/reportes/unidades-industriales | Estadísticas de unidades | ADMIN |
| GET | /api/reportes/rai | Estadísticas RAI | ADMIN |
| GET | /api/reportes/irap | Estadísticas IRAP | ADMIN |
| GET | /api/reportes/iaa | Estadísticas IAA | ADMIN |
| GET | /api/reportes/expediente/:id | Resumen expediente | ADMIN |

### Usuarios

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| GET | /api/users | Listar usuarios | ADMIN |
| GET | /api/users/:id | Obtener usuario | ADMIN |
| POST | /api/users | Crear usuario | ADMIN |
| PATCH | /api/users/:id | Actualizar usuario | ADMIN |
| DELETE | /api/users/:id | Desactivar usuario | ADMIN |

### MinIO

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/minio/subir | Subir archivo |
| GET | /api/minio/url/:fileName | Obtener URL presignada |
| GET | /api/minio/archivos | Listar archivos |
| DELETE | /api/minio/:fileName | Eliminar archivo |

## Estructura del Proyecto

```
SistemaED/
├── docker-compose.yml
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── auth/           # Autenticación JWT
│       ├── users/          # Gestión de usuarios
│       ├── expediente/     # Módulo de expediente ambiental
│       ├── minio/         # Integración con MinIO
│       ├── reportes/       # Reportes y estadísticas
│       └── database/       # Prisma Service
└── frontend/
    └── src/
        ├── app/
        │   ├── admin/      # Panel Administrador
        │   │   ├── expediente/  # Gestión de expedientes
        │   │   └── users/      # Gestión de usuarios
        │   ├── visualizador/ # Panel Visualizador
        │   └── login/      # Página de login
        ├── lib/            # Cliente API
        └── types/          # Tipos TypeScript
```

## Troubleshooting

### Error de puertos en uso (Windows)

```powershell
# Ver qué usa el puerto 3003
netstat -ano | findstr :3003

# Matar proceso por PID
taskkill /PID <pid> /F
```

### Docker Desktop no inicia en WSL2

```powershell
# Reiniciar servicios de Docker
Restart-Service com.Docker.Service

# O desde PowerShell como Admin
docker-compose restart
```

### Problemas de permisos en Git (Windows)

```powershell
git config --global core.autocrlf true
```

## Producción

Para deploy en producción:

1. Configurar variables de entorno reales en `.env`
2. Usar valores seguros para `JWT_SECRET`
3. Configurar MinIO con SSL
4. Usar PostgreSQL gestionado (no local)
5. Build del frontend: `npm run build`
6. Build del backend: `npm run build`
