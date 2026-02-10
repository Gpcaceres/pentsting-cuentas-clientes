# Docker Compose - Sistema Completo Cooperativa

Este archivo orquesta todos los servicios del sistema de la cooperativa.

## 🚀 Servicios Incluidos

### Bases de Datos
- **MySQL** (Puerto 3306) - Base de datos para Cuentas
- **PostgreSQL** (Puerto 5432) - Base de datos para Socios

### Backends
- **backend-cuentas** (Puerto 3000) - Microservicio NestJS
- **backend-socios** (Puerto 8080) - Microservicio Spring Boot

### Frontends
- **frontend-cuentas** (Puerto 4000) - Interfaz React para Cuentas
- **frontend-socios** (Puerto 4001) - Interfaz React para Socios

### Herramientas de Administración
- **phpMyAdmin** (Puerto 8081) - Administración MySQL
- **pgAdmin** (Puerto 8082) - Administración PostgreSQL

## 📦 Uso

### Iniciar todo el sistema:
```bash
docker-compose up -d
```

### Ver logs:
```bash
docker-compose logs -f
```

### Ver logs de un servicio específico:
```bash
docker-compose logs -f backend-cuentas
docker-compose logs -f frontend-socios
```

### Detener el sistema:
```bash
docker-compose down
```

### Detener y eliminar volúmenes (CUIDADO: elimina datos):
```bash
docker-compose down -v
```

### Reconstruir servicios:
```bash
docker-compose up -d --build
```

### Reconstruir un servicio específico:
```bash
docker-compose up -d --build frontend-cuentas
```

## 🌐 URLs de Acceso

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend Cuentas | http://localhost:4000 | Interfaz para gestión de cuentas |
| Frontend Socios | http://localhost:4001 | Interfaz para gestión de socios |
| API Cuentas | http://localhost:3000/api | Backend NestJS |
| API Socios | http://localhost:8080/api | Backend Spring Boot |
| phpMyAdmin | http://localhost:8081 | Administración MySQL |
| pgAdmin | http://localhost:8082 | Administración PostgreSQL |

## 🔐 Credenciales

### MySQL
- **Usuario**: cooperativa_user
- **Contraseña**: cooperativa123
- **Base de datos**: cooperativa_cuentas

### PostgreSQL
- **Usuario**: postgres
- **Contraseña**: postgres
- **Base de datos**: cooperativa_socios

### phpMyAdmin
- **Usuario**: cooperativa_user
- **Contraseña**: cooperativa123

### pgAdmin
- **Email**: admin@cooperativa.com
- **Contraseña**: admin123

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│                 cooperativa-network                      │
│                                                          │
│  ┌──────────────┐     ┌──────────────┐                 │
│  │  Frontend    │     │  Frontend    │                 │
│  │  Cuentas     │     │  Socios      │                 │
│  │  :4000       │     │  :4001       │                 │
│  └──────┬───────┘     └──────┬───────┘                 │
│         │                    │                          │
│         ▼                    ▼                          │
│  ┌──────────────┐     ┌──────────────┐                 │
│  │  Backend     │     │  Backend     │                 │
│  │  Cuentas     │     │  Socios      │                 │
│  │  (NestJS)    │     │  (Spring)    │                 │
│  │  :3000       │     │  :8080       │                 │
│  └──────┬───────┘     └──────┬───────┘                 │
│         │                    │                          │
│         ▼                    ▼                          │
│  ┌──────────────┐     ┌──────────────┐                 │
│  │   MySQL      │     │  PostgreSQL  │                 │
│  │   :3306      │     │   :5432      │                 │
│  └──────────────┘     └──────────────┘                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🔍 Healthchecks

Todos los servicios tienen healthchecks configurados:
- MySQL: Verifica ping del servidor
- PostgreSQL: Verifica pg_isready
- Backend Cuentas: Endpoint /health
- Backend Socios: Endpoint /actuator/health

## 📝 Orden de Inicio

1. **Bases de datos** (mysql, postgres)
2. **Backends** (backend-cuentas, backend-socios)
3. **Frontends** (frontend-cuentas, frontend-socios)
4. **Herramientas** (mysql-admin, pgadmin)

El sistema espera automáticamente a que cada servicio esté listo usando `depends_on` y `healthcheck`.

## 🛠️ Comandos Útiles

### Ejecutar comando en un contenedor:
```bash
docker-compose exec backend-cuentas sh
docker-compose exec backend-socios sh
```

### Ver recursos:
```bash
docker-compose ps
docker-compose top
```

### Reiniciar un servicio:
```bash
docker-compose restart backend-cuentas
```

### Escalar servicios (si es necesario):
```bash
docker-compose up -d --scale backend-cuentas=2
```

## 🔧 Desarrollo

Para desarrollo local sin Docker, usa los comandos tradicionales:

```bash
# Backend Cuentas
cd microservicio-cuentas
npm install
npm run start:dev

# Backend Socios
cd socios
mvnw spring-boot:run

# Frontend Cuentas
cd frontend-cuentas
npm install
npm start

# Frontend Socios
cd frontend-socios
npm install
npm start
```

## 📊 Volúmenes

- `mysql_data`: Datos persistentes de MySQL
- `postgres_data`: Datos persistentes de PostgreSQL

## 🌍 Variables de Entorno

Puedes crear archivos `.env` en cada directorio para personalizar:

### frontend-cuentas/.env
```
REACT_APP_API_URL=http://localhost:3000/api/cuentas
```

### frontend-socios/.env
```
REACT_APP_API_URL=http://localhost:8080/api/socios
```

## 🚨 Troubleshooting

### Puerto ya en uso:
```bash
# Ver puertos en uso
netstat -ano | findstr :3000
netstat -ano | findstr :8080

# Matar proceso
taskkill /PID <PID> /F
```

### Reconstruir desde cero:
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Ver detalles de red:
```bash
docker network inspect taller-pruebas-unitarias_cooperativa-network
```

---

**Fecha**: Enero 2025  
**Stack**: React + NestJS + Spring Boot + MySQL + PostgreSQL + Docker
