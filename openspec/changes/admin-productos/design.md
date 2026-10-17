# Design: admin-productos

## Technical Approach

Panel `/admin` dentro de la misma app Next 16.4. Defensa en profundidad en tres capas: `proxy.ts` (optimista, refresca sesion) + `requireAdmin()` (DAL, en cada pagina y Server Action) + RLS con `chorri_is_admin()` (barrera final). Escritura con la sesion del admin (JWT del usuario), nunca `service_role`. Subida de fotos directa navegador -> Storage. Producto + marcas se guardan con una RPC transaccional `SECURITY INVOKER`.

Versiones fijadas: `@supabase/ssr` `0.12.7` (peer `@supabase/supabase-js ^2.114.0`; instalado 2.117.3 OK), unica dependencia nueva. Sin `sharp`, sin shadcn, sin libs de imagen.

### Guias de Next consultadas (node_modules/next/dist/docs/01-app/)
| Guia | Conclusion aplicada |
|------|---------------------|
| `03-api-reference/03-file-conventions/proxy.md` | `proxy.ts` en la raiz, runtime Node (no se puede fijar `runtime`), `matcher` constante; Server Actions son POST a la ruta de la pagina: si el matcher no cubre la ruta, no hay proxy -> cada accion verifica por si misma (l.249-251) |
| `02-guides/authentication.md` (Optimistic checks, DAL, Server Actions) | Proxy solo lectura de cookie/claims, sin consultas a BD; autorizacion real junto al dato; tratar Server Actions como endpoints publicos |
| `02-guides/authentication-with-cache-components.md` | `cookies()` fuera de `<Suspense>` = error de build; no leer sesion en el top-level de un layout; `use cache` no puede llamar `cookies()`; `redirect()` dentro del DAL |
| `03-api-reference/03-file-conventions/02-route-segment-config/instant.md` | `export const instant = false` solo como escape; `dynamic`/`revalidate` prohibidos con cacheComponents (no se usan) |
| `03-api-reference/04-functions/updateTag.md` | Solo en Server Actions; se documenta como paso futuro (catalogo hoy sin cache) |
| `03-api-reference/04-functions/redirect.md` | En Server Action hace navegacion cliente (push); lanza excepcion: no ponerlo dentro de `try/catch` |
| `02-guides/forms.md` | `useActionState` + Server Action con `prevState` |

Supabase (docs oficiales): clientes `createServerClient` (cookies `getAll/setAll`, uno por request) y `createBrowserClient`; el proxy refresca el token con `supabase.auth.getClaims()` (verifica firma, nunca `getSession()` para decidir autorizacion) y propaga cookies a `request` y `response`. Storage: subir requiere solo politica INSERT; `upsert` exige ademas SELECT+UPDATE; sin politicas no se escribe (access-control).

## Architecture Decisions

### D1. Atomicidad producto + marcas
| Opcion | Ventajas | Contras |
|--------|----------|---------|
| A. Dos escrituras con compensacion | Todo en TS, testeable | Compensar (borrar producto recien creado / restaurar marcas) puede fallar tambien; estados intermedios visibles al publico (producto sin marcas) |
| **B. RPC `chorri_guardar_producto` SECURITY INVOKER (elegida)** | Una transaccion implicita; RLS sigue aplicando al rol real; un solo viaje | SQL fuera de Vitest (se cubre con script SQL) |
| C. RPC SECURITY DEFINER | Menos grants | Salta RLS: un error de chequeo = escritura abierta en tablas compartidas. Descartada |

**Decision: B.** INVOKER: la funcion corre con privilegios del `authenticated` llamante, de modo que las politicas de las tablas siguen siendo la autoridad; ademas la funcion verifica `chorri_is_admin()` al inicio (cinturon y tirantes). `auth.users`/tablas compartidas no se tocan. Sin diff de marcas en TS: la RPC hace `delete ... marca_id <> all(p_marcas)` + `insert ... on conflict do nothing`. `id`/`slug` nunca se modifican en edicion. Colision de `id`/`slug` -> `unique_violation` (23505) que la accion traduce y reintenta una vez.

### D2. Generacion de `id` y `slug`
- **Formato**: `slug = id = slugify(nombre)` (minusculas, NFD sin acentos, `ñ->n`, no alfanumerico -> `-`, colapsa guiones, max 60 chars, vacio -> `producto`). Coincide con ids existentes (`amortiguador-delantero`). `p01` del esquema original es historico.
- **Unicidad**: la accion consulta `select id, slug from chorri_productos where id like 'base%' or slug like 'base%'` (base solo contiene `[a-z0-9-]`, sin comodines) y la funcion pura `nextAvailableSlug(base, taken)` devuelve `base`, `base-2`, `base-3`... comparando contra id Y slug. La carrera se cierra con la restriccion UNIQUE (23505 -> 1 reintento con lista fresca).
- **Renombrar**: `id` y `slug` son INMUTABLES (el carrito persiste `{id,qty}`; URLs/SEO estables). Editar nombre no los cambia.
- Funciones puras en `lib/admin/slug.ts`.

### D3. Clientes Supabase y DAL
Singleton `lib/supabase.ts` intacto (publico). Admin: `lib/supabase/server.ts` (`createServerSupabase()` async, por request, `import "server-only"`), `lib/supabase/browser.ts` (`createBrowserSupabase()`), `lib/supabase/session.ts` (`updateSession(request)` para proxy). `requireAdmin()`: `getClaims()` -> sin claims `redirect("/admin/login")`; luego `rpc("chorri_is_admin")` -> false: `signOut({scope:"local"})` + redirect. Devuelve `{ supabase, userId, email }`. `signOut` SIEMPRE `scope: "local"`: el scope por defecto es global y cerraria la sesion del usuario en las otras ~15 apps.

### D4. Cache Components
`app/admin/layout.tsx` sin lectura de sesion (solo metadata `robots: noindex,nofollow` y `alternates: {}` para no heredar el canonical). Cada `page.tsx` es un componente sincrono que renderiza `<Suspense fallback>` con un hijo async que llama `requireAdmin()` y consulta datos; `params` se pasa como promesa al hijo. El shell (cabecera con logo) es estatico. Login no lee cookies (la redireccion de usuario ya logueado la hace el proxy).

### D5. Imagenes
Subida directa (ya decidida). Ruta del objeto: `productos/{crypto.randomUUID()}.webp` (o `.jpg` si el navegador no produce WebP). Nombre inmutable: sin upsert, cache larga. `imagen` guarda la URL publica completa. Reemplazo: tras guardar OK, la accion borra el objeto anterior (si es propio) de forma best-effort. Politicas: INSERT, SELECT, DELETE para admin; NO UPDATE (sin upsert posible). SELECT es necesario para que `remove()` encuentre la fila.

### D6. Precio
Campos `precio` (opcional >= 0, 2 decimales), `moneda` fija `PEN`, `precio_nota`. UI indica "No se muestra en la web por ahora". `ProductCard` no cambia.

## Data Flow

    Navegador ──► proxy.ts (getClaims, refresca cookies, redirige)
        │              │
        │              ▼
        │       page (Suspense) ──► requireAdmin() ──► Supabase (JWT admin + RLS)
        │
        ├─ foto: canvas->WebP ─► Storage chorri-productos (RLS: chorri_is_admin)
        │                              │ URL publica
        └─ form (useActionState) ─► saveProduct (Server Action)
                 requireAdmin ─► Zod ─► isOwnImageUrl ─► slug unico ─► rpc chorri_guardar_producto
                 ─► borrar foto anterior (best-effort) ─► redirect("/admin")

### Sesion (punto 4)
- `proxy.ts`: `export const config = { matcher: ["/admin/:path*"] }` (`:path*` incluye `/admin`). Crea `createServerClient` sobre `request.cookies`/`response.cookies`, `getClaims()`. Sin claims y ruta != `/admin/login` -> redirect a `/admin/login`; con claims en `/admin/login` -> redirect a `/admin`. En redirects se copian las cookies de refresco a la respuesta. NO consulta la BD (la allowlist se verifica en `requireAdmin`). Decision pura `decideAdminRedirect(pathname, hasClaims)` en `lib/admin/route-guard.ts`.
- Login: Server Action `signIn` (`signInWithPassword`, cookies via `setAll`, permitido en acciones). Tras autenticar verifica `chorri_is_admin()`; si no es admin: `signOut({scope:"local"})` y mensaje generico "Credenciales invalidas o sin acceso" (no revela si la cuenta existe en otra app). Sin enlace de registro ni recuperacion en v1 (los correos de Auth son globales).
- Expiracion: access token (1 h por config global), el proxy rota el refresh token en cada navegacion admin. Si el refresh falla -> login. Una accion con sesion vencida redirige al login (`requireAdmin`); el formulario no conserva borrador (limitacion aceptada).
- Logout: formulario con Server Action `signOutAction` -> `signOut({scope:"local"})` -> redirect login.

### Subida de imagen paso a paso
1. `<input type="file" accept="image/*">`; `validateImageFile({type,size})` (pura): rechaza no-imagen y > 15 MB de origen.
2. `createImageBitmap(file, { imageOrientation: "from-image" })`; si lanza (HEIC en navegador sin soporte): mensaje "No se pudo leer la foto (formato HEIC). Usa 'Mas compatible' en la camara o elige JPG/PNG".
3. `fitWithin(w, h, 1200)` (pura, sin ampliar) -> canvas -> `toBlob("image/webp", 0.82)`; si `blob.type !== "image/webp"` reintenta `image/jpeg` 0.85.
4. `supabase.storage.from("chorri-productos").upload(path, blob, { contentType, cacheControl: "31536000", upsert: false })`.
5. `getPublicUrl(path)` -> estado `imagen` + vista previa. Si ya habia una subida pendiente (no guardada) se intenta borrarla.
6. En submit, el servidor valida `isOwnImageUrl(url, SUPABASE_URL)` (prefijo `/storage/v1/object/public/chorri-productos/productos/`, extension `.webp|.jpg`, sin `..`, sin query) o `null`. El contenido real lo acota el bucket (mimes, 5 MB).
7. Huerfanas por abandono: limpieza manual (30 productos).

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/20261017000000_chorri_admin.sql` | Create | Tabla, funciones, politicas, bucket (SQL abajo) |
| `supabase/verify/chorri_admin_rls.sql` | Create | Scripts de verificacion no-admin / admin (abajo) |
| `proxy.ts` | Create | Refresco de sesion + redirecciones optimistas |
| `lib/supabase/server.ts`, `browser.ts`, `session.ts` | Create | Clientes por request y `updateSession` |
| `lib/admin/auth.ts` | Create | `requireAdmin()` (server-only) |
| `lib/admin/route-guard.ts` | Create | `decideAdminRedirect` (pura) |
| `lib/admin/slug.ts` | Create | `slugify`, `nextAvailableSlug` (pura) |
| `lib/admin/product-form.ts` | Create | Zod `productFormSchema`, `parseProductFormData(FormData)`, `formToRpcPayload`, `rowToFormValues` (pura) |
| `lib/admin/image.ts` | Create | `validateImageFile`, `fitWithin`, `buildObjectPath`, `isOwnImageUrl`, `objectPathFromUrl` (pura) |
| `lib/admin/errors.ts` | Create | `mapDbError(code)` -> mensaje en espanol (pura) |
| `lib/admin/filter.ts` | Create | `filterAdminProducts(items, query)` sin acentos (pura) |
| `lib/admin/queries.ts` | Create | server-only: listar, obtener por id, categorias, marcas, slugs ocupados |
| `lib/admin/actions.ts` | Create | `"use server"`: `saveProduct`, `setProductActive`, `signIn`, `signOutAction` |
| `lib/admin/image-client.ts` | Create | `"use client"`: decodificar, canvas, subir (sin tests) |
| `app/admin/layout.tsx` | Create | noindex, shell estatico |
| `app/admin/login/page.tsx` | Create | Pantalla de login |
| `app/admin/page.tsx` | Create | Listado + busqueda |
| `app/admin/productos/nuevo/page.tsx`, `app/admin/productos/[id]/page.tsx` | Create | Formulario crear/editar |
| `components/admin/{LoginForm,ProductList,ProductForm,ImageUploader,SpecsEditor,BrandPicker,ActiveToggle,SubmitButton,AdminHeader}.tsx` | Create | UI |
| `app/robots.ts` | Modify | `disallow: "/admin"` |
| `next.config.ts` | Modify | `remotePatterns` Supabase: hostname derivado de `NEXT_PUBLIC_SUPABASE_URL`, `pathname: "/storage/v1/object/public/chorri-productos/**"` |
| `package.json` | Modify | `@supabase/ssr@0.12.7` |

## Interfaces / Contracts

```ts
export interface SaveProductState {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
  values?: Record<string, string>; // repoblar el formulario tras error
}
export interface ProductFormInput {
  nombre: string; codigo: string; oem: string; categoriaId: string;
  marcaIds: string[]; compatibilidad: string; disponibilidad: Availability;
  garantia: string; descripcion?: string; imagen: string | null;
  precio: number | null; precioNota?: string; activo: boolean;
  especificaciones: { label: string; value: string }[]; // max 12
}
export function nextAvailableSlug(base: string, taken: ReadonlySet<string>): string;
```
Zod 4: `z.object`, `{ error: "..." }`, `safeParse`; reutiliza `availabilitySchema` de `lib/product-schema.ts`.

### Migracion SQL (`supabase/migrations/20261017000000_chorri_admin.sql`)
```sql
-- RB Repuestos Chorry: administracion de productos. Aditiva. Prefijo chorri_.

-- 1) Allowlist (tabla)
create table if not exists public.chorri_admins (
  user_id   uuid primary key references auth.users (id) on delete cascade,
  email     text not null,
  creado_en timestamptz not null default now()
);
alter table public.chorri_admins enable row level security;  -- sin politicas
revoke all on public.chorri_admins from anon, authenticated;

-- 2) Funcion de pertenencia
create or replace function public.chorri_is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.chorri_admins a where a.user_id = (select auth.uid())) $$;
revoke all on function public.chorri_is_admin() from public, anon;
grant execute on function public.chorri_is_admin() to authenticated;

-- 3) Privilegios de tabla (endurecer; RLS sigue siendo la barrera)
revoke insert, update, delete, truncate, references, trigger
  on public.chorri_categorias, public.chorri_marcas,
     public.chorri_productos, public.chorri_producto_marcas from anon;
revoke delete, truncate, references, trigger
  on public.chorri_categorias, public.chorri_marcas,
     public.chorri_productos, public.chorri_producto_marcas from authenticated;
revoke insert, update on public.chorri_categorias, public.chorri_marcas from authenticated;
grant insert, update on public.chorri_productos to authenticated;
grant insert, delete on public.chorri_producto_marcas to authenticated;

-- 4) Politicas por tabla y operacion (todas to authenticated; sin DELETE en productos)
create policy chorri_admin_select_productos on public.chorri_productos
  for select to authenticated using ((select public.chorri_is_admin()));
create policy chorri_admin_insert_productos on public.chorri_productos
  for insert to authenticated with check ((select public.chorri_is_admin()));
create policy chorri_admin_update_productos on public.chorri_productos
  for update to authenticated
  using ((select public.chorri_is_admin())) with check ((select public.chorri_is_admin()));

create policy chorri_admin_select_producto_marcas on public.chorri_producto_marcas
  for select to authenticated using ((select public.chorri_is_admin()));
create policy chorri_admin_insert_producto_marcas on public.chorri_producto_marcas
  for insert to authenticated with check ((select public.chorri_is_admin()));
create policy chorri_admin_delete_producto_marcas on public.chorri_producto_marcas
  for delete to authenticated using ((select public.chorri_is_admin()));

-- 5) RPC transaccional (INVOKER: las politicas siguen aplicando)
create or replace function public.chorri_guardar_producto(
  p_producto jsonb, p_marcas text[], p_crear boolean)
returns text language plpgsql security invoker set search_path = ''
as $$
declare
  v_id text := p_producto->>'id';
  v_marcas text[] := coalesce(p_marcas, '{}');
begin
  if not (select public.chorri_is_admin()) then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  if p_crear then
    insert into public.chorri_productos
      (id, slug, nombre, codigo, oem, categoria_id, compatibilidad, disponibilidad,
       imagen, precio, moneda, precio_nota, garantia, especificaciones, descripcion, activo)
    values
      (v_id, p_producto->>'slug', p_producto->>'nombre', p_producto->>'codigo',
       p_producto->>'oem', p_producto->>'categoria_id', p_producto->>'compatibilidad',
       p_producto->>'disponibilidad', nullif(p_producto->>'imagen',''),
       (p_producto->>'precio')::numeric, coalesce(p_producto->>'moneda','PEN'),
       nullif(p_producto->>'precio_nota',''), p_producto->>'garantia',
       coalesce(p_producto->'especificaciones','[]'::jsonb),
       nullif(p_producto->>'descripcion',''),
       coalesce((p_producto->>'activo')::boolean, true));
  else
    update public.chorri_productos set
      nombre = p_producto->>'nombre', codigo = p_producto->>'codigo',
      oem = p_producto->>'oem', categoria_id = p_producto->>'categoria_id',
      compatibilidad = p_producto->>'compatibilidad',
      disponibilidad = p_producto->>'disponibilidad',
      imagen = nullif(p_producto->>'imagen',''),
      precio = (p_producto->>'precio')::numeric,
      precio_nota = nullif(p_producto->>'precio_nota',''),
      garantia = p_producto->>'garantia',
      especificaciones = coalesce(p_producto->'especificaciones','[]'::jsonb),
      descripcion = nullif(p_producto->>'descripcion',''),
      activo = coalesce((p_producto->>'activo')::boolean, true)
    where id = v_id;
    if not found then raise exception 'producto no existe' using errcode = 'P0002'; end if;
  end if;
  delete from public.chorri_producto_marcas
    where producto_id = v_id and marca_id <> all (v_marcas);
  insert into public.chorri_producto_marcas (producto_id, marca_id)
    select v_id, m from unnest(v_marcas) as m on conflict do nothing;
  return v_id;
end $$;
revoke all on function public.chorri_guardar_producto(jsonb, text[], boolean) from public, anon;
grant execute on function public.chorri_guardar_producto(jsonb, text[], boolean) to authenticated;

-- 6) Bucket (publico para lectura por URL; 5 MB; mimes acotados)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chorri-productos','chorri-productos', true, 5242880,
        array['image/webp','image/jpeg','image/png'])
on conflict (id) do nothing;

-- 7) Politicas storage.objects (sin UPDATE: no hay upsert; sin acceso anon al listado)
create policy chorri_storage_admin_select on storage.objects
  for select to authenticated
  using (bucket_id = 'chorri-productos' and (select public.chorri_is_admin()));
create policy chorri_storage_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'chorri-productos' and (select public.chorri_is_admin()));
create policy chorri_storage_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'chorri-productos' and (select public.chorri_is_admin()));
```
El `INSERT` en `chorri_admins` NO va en la migracion (uuid del usuario desconocido): paso manual `insert into public.chorri_admins (user_id,email) select id,email from auth.users where email='repuestoschorrycalidad@gmail.com';`. Tras aplicar: `get_advisors` (security).

### Verificacion SQL (`supabase/verify/chorri_admin_rls.sql`; no se ejecuta aqui)
Cada bloque corre en transaccion con `rollback`; `<OTRO_USER>` = uuid de un usuario existente que NO este en `chorri_admins`; `<ADMIN_UUID>` = el admin real.
```sql
-- A) NO ADMIN: todo debe fallar o afectar 0 filas
begin;
select set_config('request.jwt.claims',
  '{"sub":"<OTRO_USER>","role":"authenticated"}', true);
set local role authenticated;
do $$
declare n int; cat text;
begin
  select id into cat from public.chorri_categorias limit 1;
  begin
    insert into public.chorri_productos (id,slug,nombre,codigo,oem,categoria_id,compatibilidad,garantia)
      values ('zz-test','zz-test','t','t','t',cat,'t','t');
    raise exception 'FALLO: INSERT productos permitido';
  exception when insufficient_privilege then null; end;
  update public.chorri_productos set nombre = nombre;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FALLO: UPDATE afecto % filas', n; end if;
  begin
    perform public.chorri_guardar_producto('{"id":"zz"}'::jsonb, '{}', true);
    raise exception 'FALLO: RPC permitida';
  exception when insufficient_privilege then null; end;
  begin
    insert into storage.objects (bucket_id,name) values ('chorri-productos','productos/zz.webp');
    raise exception 'FALLO: Storage INSERT permitido';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.chorri_producto_marcas values ('x','y');
    raise exception 'FALLO: INSERT producto_marcas permitido';
  exception when insufficient_privilege then null; end;
  if (select count(*) from public.chorri_productos where not activo) <> 0 then
    raise exception 'FALLO: ve inactivos'; end if;
  raise notice 'OK: no-admin bloqueado';
end $$;
rollback;

-- B) ANON no ejecuta la funcion
begin; set local role anon;
do $$ begin
  begin perform public.chorri_is_admin(); raise exception 'FALLO: anon ejecuta';
  exception when insufficient_privilege then raise notice 'OK: anon bloqueado'; end;
end $$;
rollback;

-- C) ADMIN: todo funciona (usa rollback: no deja datos)
begin;
select set_config('request.jwt.claims','{"sub":"<ADMIN_UUID>","role":"authenticated"}', true);
set local role authenticated;
do $$
declare cat text; mar text;
begin
  if not public.chorri_is_admin() then raise exception 'FALLO: no es admin'; end if;
  select id into cat from public.chorri_categorias limit 1;
  select id into mar from public.chorri_marcas limit 1;
  perform public.chorri_guardar_producto(jsonb_build_object('id','zz-test','slug','zz-test',
    'nombre','t','codigo','t','oem','t','categoria_id',cat,'compatibilidad','t',
    'disponibilidad','Bajo pedido','garantia','t','activo',false), array[mar], true);
  perform public.chorri_guardar_producto(jsonb_build_object('id','zz-test','nombre','t2',
    'codigo','t','oem','t','categoria_id',cat,'compatibilidad','t',
    'disponibilidad','Bajo pedido','garantia','t','activo',false), '{}', false);
  if not exists (select 1 from public.chorri_productos where id='zz-test' and nombre='t2' and not activo)
    then raise exception 'FALLO: admin no ve/edita inactivo'; end if;
  if exists (select 1 from public.chorri_producto_marcas where producto_id='zz-test')
    then raise exception 'FALLO: marcas no reemplazadas'; end if;
  insert into storage.objects (bucket_id,name) values ('chorri-productos','productos/zz.webp');
  delete from storage.objects where bucket_id='chorri-productos' and name='productos/zz.webp';
  begin delete from public.chorri_productos where id='zz-test';
    if found then raise exception 'FALLO: DELETE permitido'; end if;
  exception when insufficient_privilege then null; end;
  raise notice 'OK: admin';
end $$;
rollback;
-- D) Inspeccion de grants:
-- select grantee, table_name, privilege_type from information_schema.role_table_grants
--  where table_name like 'chorri_%' and grantee in ('anon','authenticated');
```
(Nota: `storage.objects` puede rechazar inserts directos por columnas obligatorias/triggers de Storage; si ocurre, la prueba definitiva de Storage es una subida real desde el panel con un usuario no admin vs admin; el bloque queda como prueba de politica.)

## UI (punto 7)
Mobile-first, identidad actual: fondo `bg-surface`, texto `text-ink`, primario `bg-brand`/`hover:bg-brand-strong`, destructivo/alerta `text-accent`, titulos `font-heading`, tarjetas `rounded-2xl border border-slate-200 bg-white`. Sin `var()`/hex en `className`; `cn()` solo condicional. Sin shadcn.
- **Login** (`/admin/login`): tarjeta centrada con `Logo`, email + contrasena, boton con `pending`, error con `role="alert"`; `autoComplete` correcto; sin registro.
- **Listado** (`/admin`): cabecera (logo, email, "Salir"), buscador (`type="search"`, label visible, filtra por nombre/codigo/OEM sin acentos), boton "Nuevo producto" fijo en movil; filas tipo tarjeta (miniatura, nombre, codigo, categoria, insignia Activo/Oculto, boton Editar); toggle activar/desactivar con confirmacion y `aria-pressed`. Contador de resultados con `aria-live="polite"`.
- **Formulario**: secciones en `fieldset/legend` (Datos, Categoria y marcas, Foto, Especificaciones, Precio opcional, Estado). Labels asociados, errores por campo con `aria-describedby`/`aria-invalid`, foco al primer error, objetivos tactiles >= 44 px, `inputMode="decimal"` en precio, boton Guardar fijo inferior en movil. Foto: boton "Tomar o elegir foto" (`capture` no forzado), vista previa, estado "Procesando/Subiendo", error HEIC claro, boton Quitar.
- Marcas: lista de checkboxes (chips). Especificaciones: filas label/valor con agregar/quitar (max 12).

## Testing Strategy
| Layer | What | Approach |
|-------|------|----------|
| Unit (Vitest, TDD) `lib/admin/slug.test.ts` | acentos, `ñ`, simbolos, vacio, largo; `nextAvailableSlug` base libre, `-2`, `-3`, hueco, compara id y slug | puro |
| Unit `product-form.test.ts` | obligatorios, trims, enum, precio vacio/negativo/decimal, specs vacias descartadas y max 12, `parseProductFormData` con `FormData` de Node, `formToRpcPayload`, ida y vuelta con `rowToFormValues` | puro |
| Unit `image.test.ts` | `validateImageFile` (tipo, tamano), `fitWithin` (horizontal, vertical, ya pequena), `buildObjectPath`, `isOwnImageUrl` (otro host, otro bucket, `..`, query, extension), `objectPathFromUrl` | puro |
| Unit `route-guard.test.ts`, `errors.test.ts`, `filter.test.ts` | redirecciones; 23505/42501/P0002 -> mensajes; busqueda sin acentos | puro |
| SQL | RLS, grants, RPC, Storage (script A/B/C/D) + `get_advisors` | manual en SQL editor/MCP antes de desplegar |
| Manual | login/logout/expiracion, proxy sin sesion, crear/editar/desactivar, foto movil (incl. HEIC), reflejo en web publica, noindex/robots, usuario no admin rechazado | checklist en tasks |
| Estatico | `npm test`, `npm run lint`, `npx tsc --noEmit` (nunca build) | verify |
No probado automaticamente (sin DOM/E2E): componentes .tsx, canvas, proxy, Server Actions.

## Migration / Rollout (punto 9)
| Fase | Despliegue | Rollback |
|------|-----------|----------|
| 1 BD | Aplicar migracion; crear usuario admin en Dashboard (Auth > Add user, password); insertar en `chorri_admins`; correr scripts A/B/C; `get_advisors` | `drop policy chorri_*` (tablas y storage), `drop function chorri_guardar_producto, chorri_is_admin`, `drop table chorri_admins`; `delete from storage.buckets` tras vaciarlo (via Storage API); los `revoke` sobre anon/authenticated son reversibles con `grant` |
| 2 Auth+shell | `npm i @supabase/ssr@0.12.7`, proxy, login, robots, layout | revert del commit (la web publica no depende) |
| 3 CRUD | esquema, slug, acciones, listado/formulario sin foto | revert del commit; datos creados permanecen (inofensivos) |
| 4 Imagenes | `remotePatterns`, uploader | revert; objetos en bucket quedan o se vacian a mano |
Orden: tabla+funcion -> politicas -> RPC -> bucket -> usuario admin -> app. Quitar `SUPABASE_SERVICE_ROLE_KEY` y `DATABASE_URL` de Vercel al cerrar. Cache futura: `getProducts` con `"use cache"` + `cacheTag("catalogo")` y `updateTag("catalogo")` en `saveProduct`/`setProductActive` (no hacerlo hoy).

## Open Questions
- [ ] Confirmar en Dashboard: "Confirm email" y minimo de contrasena (config Auth global compartida).
- [ ] Verificar hostname real del proyecto (se deriva de `NEXT_PUBLIC_SUPABASE_URL`).
- [ ] `storage.objects` en script C: si el insert directo falla por columnas de Storage, validar con subida real.
