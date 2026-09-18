# session3_kiro

Repositorio de prueba para validar la conexión entre Kiro, GitHub y AWS (cuenta sandbox `493263629840`).

## Estado de conexiones
- GitHub: remote `origin` configurado -> https://github.com/sebastianym/session3_kiro.git
- AWS: perfil `AWSAdministratorAccess-493263629840` (SSO, cuenta sandbox)

## Tasks App (Next.js)

App de tareas con CRUD básico, login con JWT en cookie httpOnly, y un endpoint de demo sin seguridad para fines educativos.

### Setup
```
npm install
copy .env.example .env.local   # y ajustar AUTH_SECRET, AUTH_SALT, DEMO_USER, DEMO_PASSWORD
npm run dev
```

Login demo: usuario/contraseña definidos en `.env.local` (`DEMO_USER` / `DEMO_PASSWORD`).

### Endpoints
- `POST /api/auth/login` — login, setea cookie de sesión (JWT, httpOnly). Público por diseño, con rate limiting básico.
- `POST /api/auth/logout` — borra la cookie de sesión.
- `GET /api/auth/me` — info del usuario autenticado.
- `GET /api/tasks`, `POST /api/tasks` — listar/crear tareas. Protegidos por middleware.
- `GET/PATCH/DELETE /api/tasks/[id]` — leer/actualizar/eliminar una tarea. Protegidos por middleware.
- `GET /api/tasks/unsafe-demo` — **inseguro a propósito**, sin autenticación. Solo para demostrar el monitoreo de seguridad.

### Seguridad
- Sesión vía JWT firmado (HS256) en cookie httpOnly, `SameSite=Lax`, secure en producción.
- Middleware (`middleware.ts`) protege `/api/tasks/*` y `/dashboard/*`.
- Headers de seguridad básicos (`X-Frame-Options`, `X-Content-Type-Options`, etc.) en `next.config.mjs`.
- Rate limiting básico en `/api/auth/login` contra fuerza bruta.
- `scripts/security-check.mjs` audita estáticamente que todo endpoint en `app/api` esté protegido, sea público por diseño (auth), o esté documentado como excepción intencional (demo insegura). Se ejecuta automáticamente vía hook al crear/guardar un `route.ts`, y en el pipeline de CI.

### Hooks de Kiro
- `.kiro/hooks/endpoint-security-monitor-create.json` y `endpoint-security-monitor.json`: corren la auditoría de seguridad cada vez que se crea o guarda un `route.ts` en `app/api`, y avisan en consola si algo queda desprotegido.

### CI/CD (`.github/workflows/qa-deploy.yml`)
En cada push/PR a `main`:
1. Instala dependencias, lint, auditoría de seguridad de endpoints, build.
2. Genera estadísticas del commit (archivos cambiados, líneas +/-).
3. Publica un resumen en el step summary de GitHub Actions.
4. Comenta en el commit con el estado de seguridad y la lista de endpoints auditados.
5. Falla el pipeline si hay endpoints sin la seguridad adecuada y sin documentar como excepción intencional.
