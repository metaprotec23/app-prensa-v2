# Guía de instalación y operación

Esta guía explica cómo preparar MetaPress, arrancarlo en local, trabajar con la base de datos y desplegarlo en el servidor de Metaprotec.

## 1. Requisitos

- Git.
- Node.js `24.x`.
- Docker Desktop con Docker Compose.
- `pnpm` `10.15.1`, activado mediante Corepack.
- Visual Studio Code es recomendable, pero no obligatorio.

Comprobar herramientas:

```bash
git --version
node -v
docker --version
docker compose version
```

Activar `pnpm`:

```bash
corepack enable
corepack prepare pnpm@10.15.1 --activate
pnpm -v
```

Si `pnpm` no está disponible, sustituye `pnpm` por `corepack pnpm`.

## 2. Preparar el proyecto

Todos los comandos deben ejecutarse desde la raíz del repositorio.

```bash
cd ruta/al/app-prensa-v2
corepack pnpm install
```

Crear los archivos locales de variables:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env
```

Los archivos `.env` contienen configuración local y no deben subirse al repositorio.

## 3. Variables de entorno

El archivo raíz `.env.example` agrupa la configuración general:

- PostgreSQL: `POSTGRES_*` y `DATABASE_URL`.
- API: `PORT` y `APP_BASE_URL`.
- Autenticación: secretos, sesiones y recuperación de contraseña.
- SMTP y MailHog: envío de correo local o externo.
- Worker: `API_BASE_URL` y `CRON_SECRET`.
- Integraciones: Metricool, OpenAI, búsqueda y Telegram.
- Frontend: variables `VITE_*`.

Para desarrollo local, los valores esenciales son:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/prensa_app?schema=public
PORT=3001
VITE_API_URL=http://localhost:3001
SMTP_HOST=localhost
SMTP_PORT=1025
APP_BASE_URL=http://localhost:5173
```

`AUTH_TOKEN_SECRET` y `TOTP_ENCRYPTION_KEY` deben existir y tener al menos 32 caracteres. En producción deben ser secretos nuevos, largos y distintos de los valores de desarrollo.

## 4. Primer arranque local

### 4.1 Levantar servicios base

```bash
docker compose up -d postgres mailhog
docker compose ps
```

PostgreSQL debe aparecer como `healthy`.

### 4.2 Aplicar migraciones y seed

```bash
corepack pnpm --filter @prensa-app/api db:migrate
corepack pnpm --filter @prensa-app/api db:seed
```

El seed crea datos de desarrollo, incluido el usuario:

```text
Usuario:    admin@prensaapp.dev
Contraseña: dev123456
```

### 4.3 Arrancar la aplicación

```bash
corepack pnpm dev
```

Este comando inicia API, web y worker. Mantén abierta esa terminal.

Comprobaciones:

```bash
curl http://localhost:3001/health
```

Después abre:

- http://localhost:5173
- http://localhost:8025

## 5. Comandos habituales

```bash
corepack pnpm dev
corepack pnpm test
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
corepack pnpm --filter @prensa-app/api dev
corepack pnpm --filter @prensa-app/web dev
corepack pnpm --filter @prensa-app/worker dev
corepack pnpm --filter @prensa-app/api db:migrate
corepack pnpm --filter @prensa-app/api db:seed
corepack pnpm --filter @prensa-app/api db:generate
```

## 6. Prisma y PostgreSQL

Prisma define el modelo de datos, genera el cliente y aplica migraciones.

Archivos principales:

```text
apps/api/prisma/schema.prisma
apps/api/prisma/migrations/
apps/api/prisma/seed.ts
```

Ejecuta migraciones después de clonar, actualizar una rama con cambios de Prisma o cambiar a una rama que incluya migraciones nuevas:

```bash
corepack pnpm --filter @prensa-app/api db:migrate
```

No edites ni borres migraciones ya compartidas. Para un cambio de esquema, modifica `schema.prisma` y crea una migración nueva.

### Dominios del esquema

- **Identidad y acceso**: usuarios, sesiones, TOTP, roles y permisos.
- **Organizaciones**: organizaciones, delegaciones y membresías.
- **Editorial**: notas, versiones, adjuntos, solicitudes y decisiones de aprobación.
- **Distribución**: contactos, grupos, emails programados y destinatarios.
- **Colaboración**: conversaciones, participantes, mensajes y notificaciones.
- **Social e inteligencia**: cuentas sociales, publicaciones, perfiles de marca, feeds y noticias.
- **Referencia y auditoría**: comunidades, provincias, municipios y registros de auditoría.

El esquema usa UUID, fechas `createdAt`/`updatedAt`, tablas SQL en `snake_case`, campos Prisma en `camelCase` y `citext` para emails sin distinción de mayúsculas.

### Reiniciar la base de datos local

Esto borra el volumen y todos los datos locales:

```bash
docker compose down -v
docker compose up -d postgres mailhog
corepack pnpm --filter @prensa-app/api db:migrate
corepack pnpm --filter @prensa-app/api db:seed
```

## 7. Diagnóstico

### La web no abre

Comprueba que `corepack pnpm dev` sigue ejecutándose. Si Vite cambia al puerto `5174` o `5175`, utiliza la URL que muestre la terminal.

### La API no responde

```bash
curl http://localhost:3001/health
docker compose logs -f postgres
```

Revisa también que `PORT`, `DATABASE_URL`, `AUTH_TOKEN_SECRET` y `TOTP_ENCRYPTION_KEY` existan.

### Error de conexión con PostgreSQL

```bash
docker compose ps
docker compose logs postgres
```

En ejecución local, `DATABASE_URL` debe apuntar a `localhost:5432`. Dentro de Docker, el host es el nombre del servicio configurado en Compose.

### Error de login o CORS

1. Comprueba `/health`.
2. Confirma que migraciones y seed se ejecutaron.
3. Revisa `VITE_API_URL` y `APP_BASE_URL`.
4. Reinicia la API y el frontend después de cambiar variables.

### Puerto ocupado

Los puertos habituales son `3001`, `5173`, `5432`, `8025` y `1025`. Cierra el proceso que los utiliza o cambia la configuración local de forma coordinada.

## 8. Detener servicios

Para detener API, web y worker, pulsa `Ctrl+C` en la terminal donde ejecutaste `pnpm dev`.

Para detener PostgreSQL y MailHog:

```bash
docker compose down
```

No uses `docker compose down -v` salvo que quieras borrar la base de datos local.

## 9. Despliegue en Metaprotec

El despliegue usa `deploy/metaprotec/compose.metaprotec.yaml`, `Dockerfile.web`, `nginx.conf` y `env.production.example`.

La arquitectura recomendada es same-origin:

```text
navegador -> proxy/TLS -> nginx web -> /api/* -> API Fastify -> PostgreSQL
```

Así se evitan CORS y preflight entre frontend y API. El contenedor web sirve los estáticos compilados y hace proxy de `/api/*` al backend.

Pasos:

```bash
cp deploy/metaprotec/env.production.example .env.production

docker compose \
  -f deploy/metaprotec/compose.metaprotec.yaml \
  --env-file .env.production build

docker compose \
  -f deploy/metaprotec/compose.metaprotec.yaml \
  --env-file .env.production up -d
```

`APP_BASE_URL` debe coincidir exactamente con el origen público, sin barra final. El proxy TLS debe dirigir el dominio al puerto publicado por el contenedor web, normalmente `8080`.

El compose de producción mantiene PostgreSQL en la red interna y ejecuta el worker como servicio separado. No expongas la base de datos al host salvo que sea estrictamente necesario.

## 10. Reglas de trabajo

- Trabaja siempre desde la raíz del repositorio.
- No subas `.env`, `.env.production` ni credenciales.
- Rota cualquier secreto que haya sido expuesto.
- No borres volúmenes Docker si necesitas conservar datos locales.
- No modifiques migraciones antiguas compartidas.
- Antes de pedir ayuda, comparte el comando ejecutado, el error exacto y la salida de `docker compose ps`.