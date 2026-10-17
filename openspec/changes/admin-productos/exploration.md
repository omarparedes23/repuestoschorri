## Exploration: admin-productos (panel /admin para crear/editar productos y fotos)

### Current State

**Catalogo publico (verificado en codigo)**
- `app/page.tsx` envuelve `<CatalogSection/>` en `<Suspense>`. `CatalogSection` llama `getProducts()` (lib/products.ts) SIN `"use cache"`, SIN `cacheTag`, SIN `unstable_cache`. Con `cacheComponents`, un fetch no cacheado va en el "agujero dinamico": se ejecuta en cada request y el shell estatico queda intacto.
- CONCLUSION CLAVE: hoy NO hay cache de datos del catalogo. Una edicion en el admin se vera en la web publica en la siguiente carga SIN necesidad de `revalidateTag`/`updateTag`. Solo habria que invalidar si en el futuro se anade `"use cache"` + `cacheTag("catalogo")` a `getProducts` (opcion de optimizacion, no requisito). Recomendacion: dejarlo sin cache ahora (30 productos, 1 query) y documentar el punto de extension: si se cachea, usar `cacheTag("catalogo")` y en las Server Actions de admin `updateTag("catalogo")` (read-your-own-writes; solo valido en Server Actions, confirmado en `01-app/03-api-reference/04-functions/updateTag.md`). `revalidateTag(tag, "max")` es stale-while-revalidate y para Route Handlers.
- `lib/supabase.ts`: cliente unico cacheado a nivel de modulo, `persistSession:false`, solo publishable key. NO sirve para el admin (singleton compartido entre requests = fuga de sesion si se le inyectara un token). El admin necesita un cliente por request.
- `lib/product-schema.ts`: `productSchema` (dominio en ingles), `rowToProduct`, `PRODUCT_SELECT` (solo lectura). Falta el camino inverso (formulario -> fila) y un esquema de formulario.
- `lib/price.ts` existe; los precios no se muestran en la UI publica hoy.
- `supabase/` EXISTE en el repo: `migrations/20261012000000_chorri_catalogo.sql` (tablas, indices, funcion `chorri_unaccent`, trigger `chorri_touch_actualizado_en`, RLS solo SELECT) y `seed.sql`. Las migraciones nuevas deben seguir este formato de nombre (`2026MMDDHHMMSS_*.sql`).
- Datos reales (consultados, solo lectura): `chorri_productos.id` y `slug` NO tienen default (la app debe generarlos; ids actuales tipo slug-kebab: `amortiguador-delantero`); `activo` default true; `creado_en` default now(); 3 productos, solo 1 con imagen (R2).

**Next 16.4 (docs reales en node_modules/next/dist/docs)**
- `middleware` esta DEPRECADO: se llama `proxy.ts` en la raiz (junto a `app/`), exporta `proxy` o default, runtime Node.js por defecto (no se puede fijar `runtime`). Hoy no existe proxy.ts en el repo.
- Guia de auth (`02-guides/authentication.md` y `authentication-with-cache-components.md`): el proxy sirve solo para chequeos OPTIMISTAS (leer cookie, redirigir); NO es la unica defensa; la autorizacion real va junto a los datos (Data Access Layer). Con cacheComponents, leer `cookies()` fuera de `<Suspense>` es error de build; los componentes que leen sesion deben ir tras `<Suspense>` o la pagina/layout `export const instant = false` (permite bloquear). `"use cache"` no puede llamar `cookies()`; `"use cache: private"` si (solo navegador).
- Los route segment configs `dynamic`/`revalidate`/`fetchCache` ERRORAN con cacheComponents: no usarlos en /admin.
- Server Actions: validacion CSRF por Origin/Host (`allowedOrigins`); limite de body por defecto 1MB (`serverActions.bodySizeLimit`, doc lo muestra bajo `experimental.serverActions` en el ejemplo de allowedOrigins; VERIFICAR la ruta exacta de la opcion en 03-api-reference/05-config/01-next-config-js/serverActions.md antes de usarla). Una foto de celular excede 1MB: relevante para el enfoque (b).
- Esta app tiene `app/layout.tsx` raiz sin Suspense y sin `cookies()`: /admin debe vivir en su propio arbol (`app/admin/...`) con layout propio y `<Suspense>` alrededor de lo que lee sesion, sin tocar el shell publico. Se debe marcar `robots: noindex` en /admin (y excluirlo de sitemap, que hoy solo lista "/").

**Supabase (hallazgos ya dados + verificados ahora)**
- Paquetes: `@supabase/supabase-js` 2.117.3 instalado; falta `@supabase/ssr` (ultima: 0.12.7 en npm). Doc oficial Next + SSR: clientes `createServerClient` (por request, cookies getAll/setAll) y `createBrowserClient`; `proxy.ts` (Next 16) refresca sesion con `supabase.auth.getClaims()`; para decisiones de autorizacion usar `getClaims()` (verifica firma del JWT) o `getUser()` (red), NUNCA `getSession()`; env: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (ya existen en el proyecto, mismos nombres). No cachear respuestas que setean cookies de sesion.
- NUEVO HALLAZGO IMPORTANTE (bucket `products`): tiene politicas `Authenticated can upload/update/delete product images` con condicion solo `bucket_id='products'`. Como auth.users es comun a ~15 apps, CUALQUIER usuario autenticado de cualquier app puede subir/modificar/borrar en ese bucket. Confirma que NO se debe reutilizar `products`; usar bucket propio `chorri-productos` con politicas ligadas a `chorri_admins`. (Aviso colateral: es un riesgo preexistente de las otras apps; informar al usuario pero fuera de alcance.) El bucket `products` permite mime jpeg/png/webp/avif y 10MB: usar la misma lista como referencia para el bucket nuevo.

### Affected Areas
- `proxy.ts` (NUEVO) — refresco de sesion Supabase + redireccion optimista de `/admin/*` sin sesion hacia `/admin/login`. Matcher solo `/admin/:path*`.
- `app/admin/**` (NUEVO) — login, listado, crear, editar; layout propio, `noindex`, Suspense para lectura de sesion.
- `lib/supabase/server.ts`, `lib/supabase/browser.ts` (NUEVO) — clientes por request via `@supabase/ssr`. `lib/supabase.ts` (publico) se deja intacto.
- `lib/admin/auth.ts` (NUEVO, `server-only`) — DAL: `requireAdmin()` = `getClaims()`/`getUser()` + verificacion en `chorri_admins`; se invoca en CADA Server Action y pagina admin.
- `lib/admin/product-form.ts` (NUEVO) — esquema Zod del formulario, mapeo formulario<->fila (`productToRow`), generacion de `id`/`slug`, normalizacion de especificaciones. Logica pura = Strict TDD.
- `lib/admin/image.ts` (NUEVO) — validacion de tipo/tamano, nombre de objeto (`{productId}/{hash}.webp`), construccion de URL publica. Pura = TDD.
- `lib/admin/actions.ts` (NUEVO, `"use server"`) — createProduct / updateProduct / setProductActive (+ `updateTag` solo si se cachea el catalogo).
- `lib/product-schema.ts` — posible extension (select admin incluye `activo`, `categoria_id`, ids de marcas); mantener `rowToProduct` publico sin cambios.
- `next.config.ts` — anadir `remotePatterns` para `axcrubvtpqcyscizgoee.supabase.co` con `pathname: "/storage/v1/object/public/chorri-productos/**"` (hostname del proyecto; verificar URL exacta con `get_project_url`). Posible `serverActions.bodySizeLimit` solo si se elige Server Action para imagenes.
- `supabase/migrations/2026…_chorri_admin.sql` (NUEVO) — `chorri_admins`, funcion `chorri_is_admin()`, politicas de escritura, bucket + politicas storage.
- `app/sitemap.ts` / robots — confirmar que `/admin` queda fuera (robots.ts: `disallow /admin`).
- `components/CatalogSection.tsx`, `lib/products.ts` — sin cambios necesarios (sin cache hoy). Productos con `activo=false` ya se ocultan por RLS y `.eq("activo", true)`.
- Variables Vercel: eliminar `SUPABASE_SERVICE_ROLE_KEY` y `DATABASE_URL` (sin uso).

### Approaches

#### (a) Proteccion de rutas admin
1. **Defensa en profundidad: proxy optimista + DAL por accion/pagina + RLS** (recomendado)
   - Proxy: refresca sesion (`getClaims`) y redirige a `/admin/login` si no hay claims. Cada pagina/Server Action llama `requireAdmin()` (verifica allowlist). RLS rechaza escrituras de no-admin aunque se salten las capas 1 y 2.
   - Pros: sigue la guia oficial de Next (proxy = optimista, DAL = real); RLS es la barrera final; sesion se refresca (si no, se desloguea al usuario).
   - Cons: tres capas que mantener; el proxy exige `@supabase/ssr`.
   - Effort: Medium.
2. **Solo DAL en paginas (sin proxy)**
   - Pros: menos archivos.
   - Cons: la sesion NO se refresca en Server Components (no pueden setear cookies) -> deslogueos aleatorios; Supabase lo desaconseja.
   - Effort: Low.
3. **Solo RLS + UI cliente**
   - Cons: UX deficiente, filtra la estructura del panel; descartable.

#### (b) Subida de imagenes
1. **Cliente -> Storage directo con RLS (browser client con sesion del admin)** (recomendado)
   - El navegador sube a `chorri-productos` con `createBrowserClient`; la politica de storage exige `chorri_is_admin()`. Luego la Server Action guarda solo la URL/ruta en `chorri_productos.imagen`.
   - Pros: evita el limite de 1MB del body de Server Actions y el tope de payload de Vercel (4.5MB en funciones); el archivo no pasa por la funcion; menos codigo servidor; RLS hace de barrera.
   - Cons: la Server Action debe validar que la URL de `imagen` pertenezca a nuestro bucket (prefijo), porque el cliente la envia; riesgo de objetos huerfanos si se sube y no se guarda (mitigable: nombre unico + limpieza manual/posterior); necesita sesion en el navegador (cookies de `@supabase/ssr` lo manejan).
   - Effort: Medium.
2. **Server Action con FormData (File)**
   - Pros: todo validado en servidor, un solo viaje, credenciales nunca en el cliente.
   - Cons: `bodySizeLimit` 1MB por defecto (subirlo es un parche); tope Vercel ~4.5MB; el redimensionado en servidor requiere `sharp` (ya incluido por Next para next/image, pero no es dependencia declarada).
   - Effort: Medium.
3. **URL firmada (signed upload URL) emitida por Server Action**
   - Pros: servidor decide ruta y autoriza; archivo va directo a Storage.
   - Cons: un viaje extra, mas complejidad para el beneficio; RLS ya cumple la funcion con un bucket exclusivo.
   - Effort: Medium-High.

#### (c) Redimension de imagen
1. **Cliente (canvas/`createImageBitmap` -> WebP ~1200px, calidad 0.8) antes de subir** (recomendado)
   - Pros: sin dependencias nuevas; fotos de celular de 4-8MB bajan a ~100-250KB antes de salir (mejor en redes moviles del taller); compatible con la opcion (b)1.
   - Cons: depende del navegador (WebP via canvas.toBlob soportado en navegadores actuales; Safari antiguo cae a JPEG: manejar fallback); EXIF/orientacion: `createImageBitmap(file, {imageOrientation:"from-image"})`; no es verificable con Vitest (necesita DOM/canvas).
   - Effort: Low-Medium.
2. **Servidor con sharp en Server Action/Route Handler**
   - Pros: resultado uniforme y verificable.
   - Cons: obliga a pasar el original por la funcion (limites de body) y a declarar `sharp`; mas lento.
   - Effort: Medium.
3. **No redimensionar; confiar en `next/image`**
   - Pros: cero codigo.
   - Cons: Storage guarda originales de varios MB; `next/image` optimiza al servir pero cada variante se transforma bajo demanda (costo/cuota de Vercel Image Optimization); sube lento. Aceptable solo como red de seguridad: de todos modos imponer `file_size_limit` (p.ej. 5MB) y lista de mimes en el bucket.
   - Effort: Low.

#### Modelo de seguridad en BD (resumen del diseno preferido, validado)
- `chorri_admins(user_id uuid primary key references auth.users, email text, creado_en)` con RLS activada y SIN politicas de escritura para anon/authenticated (se administra por migracion/SQL editor). Politica SELECT opcional solo para el propio `auth.uid()`.
- `chorri_is_admin()` `SECURITY DEFINER`, `STABLE`, `set search_path = ''`, `exists(select 1 from public.chorri_admins where user_id = (select auth.uid()))`; `REVOKE EXECUTE … FROM public, anon` y `GRANT` solo a `authenticated` (evita ejecucion anonima de funciones SECURITY DEFINER expuestas por PostgREST). Usar `(select auth.uid())` en politicas para que el planner lo evalue una vez.
- Politicas: INSERT/UPDATE (sin DELETE) en `chorri_productos` y `chorri_producto_marcas` (esta si necesita DELETE para reemplazar marcas: DELETE+INSERT, o hacerlo en una RPC) con `to authenticated using/with check (chorri_is_admin())`. Ademas politica SELECT para admin sobre productos `activo=false` (hoy RLS publica oculta los inactivos; el admin debe verlos para reactivarlos).
- Storage: bucket `chorri-productos` publico (lectura via URL publica, no requiere politica SELECT), `file_size_limit` 5MB, mimes jpeg/png/webp/avif; politicas INSERT/UPDATE/DELETE en `storage.objects` con `bucket_id='chorri-productos' and chorri_is_admin()`.
- Usuario admin: auth.users NO tiene repuestoschorrycalidad@gmail.com. Pasos: crearlo (Dashboard > Auth > Add user, con password, o invitacion por email) y luego insertar su `id` en `chorri_admins`. Esto es un paso MANUAL/operativo (no se puede migrar de forma determinista el uuid). Recomendacion: desactivar el signup publico no es posible sin afectar a las otras 15 apps (config de Auth es global): por eso la allowlist es OBLIGATORIA, y el login admin NO debe ofrecer registro. Verificar (en Dashboard) si "Confirm email" esta activo: afecta como se crea el admin.
- Transaccionalidad: crear producto + marcas son 2 escrituras; con el cliente JS no hay transaccion. Alternativa: RPC `chorri_guardar_producto(jsonb)` `SECURITY INVOKER` (RLS aplica) que haga upsert de producto y reemplazo de marcas atomicamente. Tradeoff: SQL mas complejo y menos testeable con Vitest, pero evita productos sin marcas ante fallo parcial. Para 30 productos, aceptable hacer dos pasos con orden definido (producto primero; marcas despues; en edicion, upsert de nuevas y delete de removidas) y reintento manual; decidir en diseno.

### Precio en el panel
Recomendado SI capturar `precio` (opcional, numerico >= 0, `moneda` default PEN, `precio_nota` opcional) desde ya, porque el modelo lo mantiene y rellenarlo despues para 30 productos es retrabajo. Dejarlo claramente marcado "no se muestra en la web por ahora" y que NO afecte el render publico (la UI actual ya no lo muestra; confirmar que `ProductCard` no lo pinta por defecto). Costo marginal: 3 campos.

### Testing con Vitest (node, `**/*.test.ts`, sin DOM)
Se PUEDE probar (Strict TDD, `lib/`):
- Esquema Zod del formulario (obligatorios, longitudes, disponibilidad enum, precio opcional/negativo, especificaciones label/value, trims, URL de imagen debe pertenecer al bucket).
- Mapeo formulario -> fila (`productToRow`) y fila -> valores del formulario (ida y vuelta consistente con `rowToProduct`).
- Utilidades: `slugify` (acentos/ñ/espacios), generacion de `id`, colision (sufijo), nombre de objeto de imagen, validacion tipo/tamano (sobre objetos con `type`/`size`), construccion/validacion de URL publica.
- Logica de diff de marcas (a insertar/a borrar).
- Funciones puras de autorizacion (p.ej. decidir redireccion a partir de claims/resultado de allowlist) si se extraen del framework.
NO se puede probar (sin @testing-library, sin E2E, sin DOM): componentes .tsx del formulario, redimension con canvas, flujo de login/proxy, politicas RLS y Server Actions reales (dependen de Next y Supabase). Mitigacion: verificacion manual guiada + consultas SQL de prueba de RLS (con `set local role authenticated` + `request.jwt.claims`) documentadas en el plan de verificacion; opcionalmente anadir `@vitest/coverage-v8`. Mockear Supabase en unit tests tiene bajo valor; preferir funciones puras.

### Recommendation
- **Arquitectura**: `/admin` en la misma app, Supabase Auth con `@supabase/ssr`, escritura con la sesion del admin bajo RLS; SIN `service_role`.
- **(a)** Proxy optimista + `requireAdmin()` (allowlist) en cada accion/pagina + RLS.
- **(b)** Subida directa cliente->Storage al bucket propio `chorri-productos`; la Server Action valida el prefijo de la URL.
- **(c)** Redimension en cliente (canvas -> WebP ~1200px) + limites duros en el bucket como segunda red.
- **Cache**: no cachear `getProducts` por ahora (no hay nada que invalidar); documentar `cacheTag`+`updateTag` como paso futuro.
- **Etapa 1 de entrega sugerida**: (1) migracion SQL + usuario admin; (2) lib puras con TDD (schema, slug, mapeo, imagen); (3) clientes Supabase + proxy + login; (4) listado/crear/editar/activar-desactivar + subida; (5) `remotePatterns` + robots; (6) limpieza de variables Vercel.
- Paquetes nuevos: solo `@supabase/ssr` (~0.12.7). Opcional: `@vitest/coverage-v8` (dev). `sharp` NO necesario con la opcion c1.

### Risks
- **Auth compartido**: cualquier usuario de otras apps puede autenticarse; la allowlist `chorri_admins` + RLS es la unica barrera real. Un error en las politicas (p.ej. `to authenticated` sin `chorri_is_admin()`) abre escritura a todos. Mitigar con pruebas SQL de RLS (rol authenticated no-admin debe fallar) antes de publicar.
- **Bucket `products` ya inseguro** (cualquier autenticado escribe): no usarlo; avisar al dueño del proyecto compartido. Fuera de alcance corregirlo.
- **Funciones SECURITY DEFINER** expuestas por PostgREST: fijar `search_path`, revocar a anon/public. Ejecutar `get_advisors` (security) tras aplicar la migracion.
- **Proyecto/tablas compartidas**: migraciones solo con prefijo `chorri_`; no alterar objetos de otras apps. Nombres de politica unicos con prefijo. Orden: (1) tabla+funcion, (2) politicas tablas, (3) bucket+politicas storage, (4) crear usuario admin y fila allowlist, (5) desplegar app. Rollback: `drop policy`/`drop function`/`drop table chorri_admins`, vaciar y `delete` del bucket `chorri-productos`; la app publica no depende de nada de esto, asi que el rollback no afecta el catalogo. La migracion es aditiva (no modifica politicas SELECT existentes), salvo anadir una SELECT para admin sobre inactivos.
- **Usuario admin inexistente**: hay que crearlo manualmente; confirmar politica de password y correo de confirmacion; recuperar contraseña requiere SMTP/plantillas compartidas del proyecto (los emails de Auth son globales y pueden llevar marca de otra app: verificar).
- **Escritura no atomica** producto+marcas (ver RPC como alternativa).
- **Imagenes huerfanas** al reemplazar foto o abandonar formulario; limpieza manual aceptable a esta escala (30 productos).
- **Cache/Next**: leer cookies en /admin sin Suspense rompe el build con cacheComponents; no usar `dynamic`/`revalidate` exports; el proxy no debe correr en rutas publicas (matcher `/admin/:path*`) para no impactar el prefetch/estatico del home. Singleton `lib/supabase.ts` no debe reutilizarse para el admin.
- **Seguridad de Server Actions**: son endpoints publicos; verificar admin en cada una, validar con Zod todo input (incluida la URL de imagen), no confiar en el proxy.
- **Fotos de celular**: HEIC (iPhone) no lo soporta canvas en todos los navegadores; el input debe `accept="image/*"` y mostrar error claro si no se puede decodificar.
- No se pudo verificar sin acceso al Dashboard: config de Auth (signup/confirm email/SMTP), y la ruta exacta de `bodySizeLimit` en esta version (solo relevante si se elige b2).

### Open Questions (solo si bloquean)
1. Metodo de acceso del admin: email+contraseña (recomendado, simple) vs magic link. Requiere que el usuario cree/confirme la cuenta repuestoschorrycalidad@gmail.com en el Dashboard (paso manual que solo el dueño puede hacer o autorizar). No bloquea la implementacion del codigo, si bloquea la verificacion end-to-end.
2. Atomicidad: aceptar dos escrituras (producto + marcas) o usar RPC. Es decision de diseno, se puede resolver en sdd-design con la recomendacion de dos pasos ordenados.

### Ready for Proposal
Yes. Decirle al usuario: el catalogo publico NO esta cacheado hoy, por lo que las ediciones se veran sin invalidacion; se requiere un unico paquete nuevo (`@supabase/ssr`); el bucket `products` existente NO es seguro de reutilizar (cualquier usuario autenticado de las otras apps puede escribir), por eso se crea `chorri-productos`; y despues de desplegar habra que crear manualmente el usuario admin y registrarlo en `chorri_admins`.
