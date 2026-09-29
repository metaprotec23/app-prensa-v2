# Notra

Notra es una plataforma para crear, revisar, aprobar y distribuir notas de prensa. El repositorio es un monorepo gestionado con `pnpm` y TypeScript.

La guía operativa está en [GUIA_INSTALACIÓN.md](GUIA_INSTALACIÓN.md). Este documento explica la arquitectura, las decisiones técnicas y el estado previsto del producto.

## Inicio rápido

Requisitos: Node.js `24.x`, Docker Desktop y `pnpm` `10.15.1`.

```bash
corepack enable
corepack prepare pnpm@10.15.1 --activate
corepack pnpm install
docker compose up -d postgres mailhog
corepack pnpm --filter @prensa-app/api db:migrate
corepack pnpm --filter @prensa-app/api db:seed
corepack pnpm dev
```

URLs locales:

| Servicio | URL |
| --- | --- |
| Aplicación web | http://localhost:5173 |
| Health de la API | http://localhost:3001/health |
| MailHog | http://localhost:8025 |
| PostgreSQL | localhost:5432 |

## Arquitectura del repositorio

```text
apps/
  api/                 API Fastify, Prisma y PostgreSQL
  web/                 SPA React, Vite y MUI
  worker/              Trabajos en segundo plano y tareas programadas
packages/
  contracts/           Tipos y contratos compartidos
  config-typescript/   Configuración común de TypeScript
  config-eslint/       Configuración común de ESLint
compose.yaml           Servicios locales de desarrollo
```

### Responsabilidades

- `api`: autenticación, permisos, lógica de negocio, correo y acceso a datos.
- `web`: interfaz de usuario y llamadas a la API.
- `worker`: procesamiento asíncrono y futuros envíos programados.
- `contracts`: tipos compartidos entre backend y frontend.
- `prisma`: esquema, migraciones y seed de desarrollo.

## Stack técnico

| Área | Tecnología |
| --- | --- |
| Runtime | Node.js 24 |
| Backend | Fastify + TypeScript |
| Base de datos | PostgreSQL 16 + Prisma |
| Frontend | React + Vite + MUI |
| Datos del servidor | TanStack Query |
| Estado de interfaz | Zustand |
| Validación | Zod |
| Trabajos asíncronos | pg-boss |
| Testing | Vitest + Testing Library |
| Contenedores | Docker Compose |

## Áreas funcionales

- Autenticación, sesiones, 2FA y recuperación de contraseña.
- Organizaciones, delegaciones, usuarios, roles y permisos.
- Creación, edición, revisión, aprobación y exportación de notas de prensa.
- Contactos, grupos, importación y envíos de correo.
- Mensajería interna y notificaciones.
- Publicaciones sociales mediante integraciones externas, incluida Metricool.
- Noticias y feeds RSS.
- Analítica y dashboards.

## Modelo de datos

El esquema está organizado por dominios:

- **Identidad**: `User`, `Session`, `TotpSecret`, roles y permisos.
- **Organizaciones**: `Organization` y `Delegation`.
- **Editorial**: `PressRelease`, versiones, adjuntos y aprobaciones.
- **Distribución**: contactos, grupos, emails programados y destinatarios.
- **Colaboración**: conversaciones, mensajes y notificaciones.
- **Social e inteligencia**: cuentas sociales, publicaciones, feeds RSS y noticias.
- **Referencia y auditoría**: geografía y `AuditLog`.

Las entidades principales usan UUID, fechas comunes y nombres `camelCase` en Prisma. Las tablas SQL se mapean a `snake_case`; los emails usan `citext` para evitar duplicados por mayúsculas y minúsculas.

## Roadmap resumido

### MVP de lanzamiento

1. Plataforma y entorno reproducible.
2. Modelo de datos y migraciones.
3. Autenticación y autorización.
4. Organizaciones y usuarios.
5. Notas de prensa y flujo editorial.
6. Contactos y distribución por email.
7. Testing, seguridad y observabilidad mínima.
8. Migración de datos y lanzamiento.

### Después del MVP

- Mensajería interna y notificaciones.
- Dashboards y métricas de uso.
- Publicación en redes sociales.
- RSS, noticias e inteligencia editorial.
- Edición multimedia avanzada.

La prioridad es cerrar primero el flujo principal: usuario autorizado, nota de prensa, aprobación y distribución.

## Convenciones de desarrollo

- Ejecutar comandos desde la raíz del repositorio.
- Validar permisos en el backend; el frontend solo adapta la experiencia.
- Usar TanStack Query para datos del servidor y Zustand para estado de interfaz.
- Mantener la lógica de negocio en servicios y las rutas HTTP delgadas.
- Crear migraciones Prisma para cambios de base de datos.
- No guardar secretos reales en el repositorio.

## Comandos principales

```bash
corepack pnpm dev          # API, web y worker
corepack pnpm test         # Tests
corepack pnpm lint         # ESLint
corepack pnpm typecheck    # TypeScript
corepack pnpm build        # Build de producción
```

Para instalación detallada, diagnóstico, Prisma y despliegue, consulta [GUIA_INSTALACIÓN.md](GUIA_INSTALACIÓN.md).
