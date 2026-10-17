# Proposal: admin-productos

## Intent

El dueño no puede crear ni editar productos ni fotos sin tocar la BD. Se necesita un panel `/admin` dentro de la app Next para gestionar ~30 productos de forma autonoma y segura (las tablas y `auth.users` son compartidos con ~15 apps).

## Scope

### In Scope
- Login email+contraseña (Supabase Auth) para el admin unico `repuestoschorrycalidad@gmail.com`.
- Listado, crear, editar y activar/desactivar productos (`activo=false`, sin borrado).
- Seleccion de categoria y marcas existentes; precio opcional (PEN, `precio_nota`), no visible en la web publica.
- Subida de fotos a bucket propio `chorri-productos` (redimension en cliente a WebP ~1200px).
- Migracion SQL aditiva: allowlist, RLS de escritura, bucket y politicas.

### Out of Scope
- Gestion de categorias y marcas (etapa 2); mostrar precios en la web; borrado fisico.
- Cachear el catalogo (documentar `cacheTag`/`updateTag` como paso futuro).
- Corregir el bucket `products` (riesgo externo, ver Riesgos); `sharp`, `service_role`, magic link.

## Capabilities

### New Capabilities
- `admin-auth`: login, proxy optimista, `requireAdmin()` y allowlist `chorri_admins`.
- `admin-productos-crud`: listado, alta, edicion, activar/desactivar, marcas, precio opcional.
- `admin-imagenes`: subida, validacion y redimension de fotos; bucket y politicas.

### Modified Capabilities
- None (el catalogo publico no cambia de comportamiento).

## Approach

Defensa en profundidad: `proxy.ts` (matcher `/admin/:path*`, `getClaims`) + `requireAdmin()` en cada pagina y Server Action + RLS con `chorri_is_admin()` (SECURITY DEFINER, `search_path` fijo, revoke a anon/public). Escritura con la sesion del admin, sin `service_role`. Subida directa cliente->Storage; la Server Action valida el prefijo de la URL. Unico paquete nuevo: `@supabase/ssr`. `id`/`slug` generados por la app. Atomicidad producto+marcas (dos pasos vs RPC) se decide en design.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `supabase/migrations/20261012...` | New | admins, funcion, politicas, bucket |
| `proxy.ts` | New | refresco de sesion y redireccion |
| `app/admin/**` | New | login, listado, crear, editar |
| `lib/supabase/`, `lib/admin/` | New | clientes, DAL, esquema, slug, imagen, acciones (TDD) |
| `components/admin/` | New | formulario y subida |
| `next.config.ts`, `app/robots.ts` | Modified | `remotePatterns`; `disallow /admin` |
| `package.json` | Modified | `@supabase/ssr` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Politica RLS erronea abre escritura a usuarios de otras apps | Med | Pruebas SQL con rol authenticated no-admin antes de publicar; `get_advisors` |
| Usuario admin inexistente | High | Paso manual: crear cuenta en Dashboard > Auth e insertar su id en `chorri_admins` |
| Bucket `products` existente inseguro (cualquier autenticado escribe) | High | Fuera de alcance; avisar al dueño del proyecto; no reutilizarlo |
| Escritura no atomica producto+marcas | Med | Orden definido o RPC (design) |
| Imagenes huerfanas / HEIC no decodificable | Med | Nombre unico, limpieza manual; error claro |
| `cookies()` sin Suspense rompe build | Med | Arbol `/admin` propio con Suspense |

## Rollback Plan

La app publica no depende de nada de esto. Revertir: quitar `proxy.ts` y `app/admin` (revert del commit); en BD `drop policy` (con prefijo `chorri_`), `drop function chorri_is_admin`, `drop table chorri_admins`; vaciar y borrar el bucket `chorri-productos`; eliminar el usuario admin si se desea. Migracion aditiva: no altera politicas existentes salvo anadir un SELECT admin.

## Dependencies

- Cuenta admin creada manualmente en Supabase; confirmar "Confirm email" y SMTP.
- Eliminar `SUPABASE_SERVICE_ROLE_KEY` y `DATABASE_URL` de Vercel (sin uso).

## Success Criteria

- [ ] Un usuario no admin autenticado recibe rechazo en INSERT/UPDATE y en Storage (prueba SQL).
- [ ] El admin crea, edita y desactiva un producto con foto y se ve en la web sin invalidacion.
- [ ] `/admin/*` sin sesion redirige a login; noindex y fuera de sitemap.
- [ ] `npm test`, `npm run lint` y `npx tsc --noEmit` pasan; logica de `lib/` con TDD.

## Fases entregables y despliegue

1. BD + seguridad (migracion, pruebas RLS, usuario admin).
2. Auth + shell admin (clientes, proxy, login, robots).
3. CRUD de productos (esquema, slug, mapeo, acciones).
4. Imagenes (bucket, redimension, `remotePatterns`).
Orden: tabla+funcion, politicas, bucket, usuario admin, despliegue de la app.
