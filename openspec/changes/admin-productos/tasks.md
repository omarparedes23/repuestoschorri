# Tasks: admin-productos

Leyenda: **[V]** Vitest (TDD) · **[SQL]** scripts A/B/C/D(+E) del design · **[M]** manual con pasos concretos · **PC** = PUNTO DE CONTROL (requiere confirmacion explicita del usuario antes de ejecutar). Specs abreviadas: `auth` = admin-auth, `crud` = admin-productos-crud, `img` = admin-imagenes. NUNCA `next build`. Sin commits en estas tareas salvo que el usuario lo pida.

## Reconciliacion spec/design

| # | Contradiccion / hueco | Prevalece | Por que |
|---|---|---|---|
| R1 | URL de imagen: spec compara host+ruta completos; design habla de prefijo | **Spec**: `isOwnImageUrl` parsea con `new URL()`, exige `https`, `origin` igual al de `NEXT_PUBLIC_SUPABASE_URL`, `pathname` que empieza por `/storage/v1/object/public/chorri-productos/productos/`, extension `.webp`/`.jpg`, sin `..`, sin query ni hash | Mas estricto; evita `https://evil.com/storage/...` |
| R2 | Nombre de objeto: spec `{productId}/{hash}.webp`; design `productos/{uuid}.webp` | **Design** | En "nuevo" el id no existe aun al subir. El test "nombre unico" pasa a: dos nombres difieren y empiezan por `productos/` |
| R3 | Limite cliente: spec 5 MB sobre el archivo (y a la vez acepta foto de 6 MB en redimension: contradiccion interna); design 15 MB de origen y 5 MB en bucket | **Design**: origen <= 15 MB, el blob procesado <= 5 MB (bucket) | Spec inconsistente consigo misma. Mensaje: "La imagen supera los 15 MB" |
| R4 | Mimes: spec jpeg/png/webp/avif; design bucket jpeg/png/webp | **Design** para bucket (sin avif); cliente acepta `image/*` (para intentar HEIC) y rechaza no-imagen | Mas estricto en el bucket; la salida nunca es avif |
| R5 | Politicas Storage: spec INSERT/UPDATE/DELETE; design INSERT/SELECT/DELETE sin UPDATE | **Design** | Sin UPDATE no hay upsert/sobrescritura; cumple "no admin no reemplaza" |
| R6 | Mensaje HEIC distinto | **Spec** como texto base: "No se pudo leer la imagen; use JPG, PNG o WebP" + pista "o configure la camara en 'Mas compatible'" | Spec es el criterio verificable |
| R7 | Funcion pura de acceso: spec `login/forbidden/allow` (claims + fila allowlist); design solo `decideAdminRedirect(pathname, hasClaims)` | **Ambas** en `route-guard.ts`: `decideAdminRedirect` (proxy) y `decideAccess(hasClaims, isAdmin)` (requireAdmin) | Spec exige el escenario [V] |
| R8 | Mensaje de login: spec "Correo o contraseña incorrectos"; design "Credenciales invalidas o sin acceso" | **Spec**, el MISMO texto para credenciales malas y para no-admin | Evita enumeracion de cuentas de otras apps |
| R9 | Validacion Zod de login [V] en spec, ausente en design | Crear `lib/admin/login-schema.ts` + test | Escenario "Entrada malformada" |
| R10 | **Hueco real (bucle de redireccion)**: design hace `signOut` dentro de `requireAdmin` en una pagina (Server Component no puede escribir cookies) y el proxy manda `/admin/login` con claims a `/admin`: usuario autenticado no admin => bucle infinito | `requireAdmin` NO llama signOut; para no-admin redirige a `/admin/sin-acceso` (pagina nueva, permitida con claims, con boton "Cerrar sesion" via Server Action `signOutAction`). `signIn` si hace `signOut({scope:"local"})` si no es admin (Server Action puede escribir cookies). `decideAdminRedirect` no redirige `/admin/sin-acceso` | Spec permite "redireccion/403"; evita bucle |
| R11 | signOut scope: design `local`; spec solo "elimina cookies" | **Design** (`scope:"local"` SIEMPRE) | El global cerraria sesiones de ~15 apps |
| R12 | Slug de nombre sin alfanumericos: spec rechaza con error; design cae a `producto` | **Spec**: `slugify` devuelve `""` y el esquema falla con "El nombre debe incluir letras o numeros"; sin fallback | Evita slugs basura |
| R13 | Slug estable y sufijos `-2/-3`: coinciden; design compara contra id Y slug y trunca a 60 | **Design**; el sufijo se aplica tras truncar y el total no pasa de 60 | Compatible con spec |
| R14 | Atomicidad: spec "insertar producto y luego marcas" + escenario "fallo parcial"; design RPC transaccional | **Design (RPC)**. Escenario "fallo parcial" se verifica por [SQL] bloque E (todo o nada) | RPC lo hace inalcanzable por diseno |
| R15 | Diff de marcas [V] en TS (spec) vs "sin diff en TS, lo hace la RPC" (design) | **Design**: sin funcion TS; el escenario se cubre en [SQL] bloques C/E (marcas reemplazadas) | Evita codigo muerto y doble fuente de verdad |
| R16 | Precio "12,50" (teclado decimal movil) no cubierto | Anadir: coma aceptada como separador, max 2 decimales, vacio => `null`; en RPC nunca enviar `""` (cast a numeric fallaria) | Hueco de usabilidad |
| R17 | Imagen en fases 3 vs 4 | Fase 3: `saveProduct` ignora `imagen` del cliente (crear => `null`; editar => conserva la de BD). Fase 4 habilita URL validada | Evita aceptar URL sin validador |
| R18 | Archivo de migracion: proposal `20261012...` vs design `20261017000000` | **Design** (`20261012000000_chorri_catalogo.sql` ya existe; la nueva debe ser posterior) | Orden de migraciones |
| R19 | Aviso: `lib/admin/login-schema.ts` y `/admin/sin-acceso` no estan en la tabla File Changes del design | Se crean aqui (R9, R10) | Alcance menor, sin impacto en arquitectura |

**DECISION DEL USUARIO**: ninguna bloqueante. Confirmar solo (PC) los pasos manuales de Auth (1.6).

## Orden de despliegue y dependencias
Fase 1 (BD, scripts A/B/C/E OK) -> Fase 2 -> Fase 3 -> Fase 4 -> Fase 5 (cierre). Dentro de la fase 1: 1.1-1.2 (archivos) -> 1.3 (revisar grants) -> 1.4 (aplicar) -> 1.5 -> 1.6-1.8 (usuario) -> 1.9-1.10 (scripts). La app (fase 2+) NO se escribe contra la BD hasta que 1.9 pase. Fase 3 depende de 2.x (`requireAdmin`); fase 4 depende de 3.x (formulario) y del bucket de 1.4. Orden de objetos SQL: tabla+funcion -> politicas -> RPC -> bucket -> usuario admin -> app.

---

## Fase 1: BD + seguridad

### 1A Infraestructura
- [x] 1.1 Crear `supabase/migrations/20261017044647_chorri_admin.sql` con el SQL de design secciones 1-7 (sin INSERT en `chorri_admins`). Cubre: auth/Allowlist y RLS, crud/Activar sin borrado, img/Bucket propio.
- [x] 1.2 Crear `supabase/verify/chorri_admin_rls.sql` con bloques A, B, C, D del design mas bloque E: (a) RPC con `categoria_id`/marca inexistente => 23503 y 0 productos creados, (b) `id` duplicado => 23505, (c) rollback. Cubre: crud/Crear (categoria inexistente, fallo parcial), auth/Allowlist. Nota: el bloque C NO borra en `storage.objects` (trigger `protect_objects_delete` lo impide; el rollback basta).

### 1B Implementacion (escriben en BD compartida)
- [x] 1.3 **PC** [SQL solo lectura] ANTES de aplicar: ejecutar consulta D (grants `anon/authenticated` sobre `chorri_%`), listar politicas actuales de las 4 tablas y de `storage.objects`; confirmar PK compuesta en `chorri_producto_marcas`, FKs a categoria/marca, existencia de la politica publica `activo=true`, y que las columnas del INSERT de la RPC existen. Mostrar resultado al usuario; los `revoke` del design no deben romper otras apps (solo tablas `chorri_`).
- [x] 1.4 **PC (ESCRIBE en produccion compartida)**: aplicar la migracion 1.1 (`apply_migration`). Esto crea tabla, funciones, politicas, RPC y bucket `chorri-productos`.
- [x] 1.5 [SQL] Correr `get_advisors` (security) tras 1.4; resolver o documentar cada hallazgo `chorri_`.
- [ ] 1.6 **PC (manual del dueno)**: en Dashboard > Auth revisar "Confirm email" y politica de contrasena (config global compartida con otras apps; no cambiarla sin avisar).
- [ ] 1.7 **PC (manual del dueno)**: crear el usuario `repuestoschorrycalidad@gmail.com` (Auth > Add user, con contrasena).
- [ ] 1.8 **PC (ESCRIBE en produccion)**: DOS admins, mismos permisos (decision del usuario: opcion A, sin roles). Orden: primero correr 1.9 (bloque A) con `petitenfant2014@gmail.com` como `<OTRO_USER>` (aun NO admin); despues `insert into public.chorri_admins (user_id,email) select id,email from auth.users where email in ('petitenfant2014@gmail.com','repuestoschorrycalidad@gmail.com');` y comprobar 2 filas (1 si la cuenta de 1.7 aun no existe; registrarla cuando se cree).

### 1C Testing
- [x] 1.9 **PC** [SQL] Ejecutar bloques A y B (con `<OTRO_USER>` = uuid de un usuario existente NO admin; todo dentro de `rollback`). Esperado: "OK: no-admin bloqueado" y "OK: anon bloqueado". Cubre auth/Allowlist (no admin escribe, anonimo, web publica).
- [x] 1.10 **PC** [SQL] Ejecutar bloques C (con `<ADMIN_UUID>`), D y E. Esperado: "OK: admin"; DELETE en productos denegado; E sin productos huerfanos. Si el INSERT directo a `storage.objects` falla por columnas de Storage, anotarlo: se valida en 4.20. Cubre crud/Crear, crud/Sin borrado, crud/Editar (marcas).
- [x] 1.11 Gate fase 1: `npm test`, `npm run lint`, `npx tsc --noEmit` (sin cambios de codigo: deben seguir verdes).

---

## Fase 2: Auth + shell admin

### 2A Infraestructura
- [x] 2.1 Leer `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` y `02-guides/authentication-with-cache-components.md` antes de codificar.
- [x] 2.2 `npm i @supabase/ssr@0.12.7` (`package.json`, lockfile); comprobar que `server-only` resuelve en el proyecto (si no, `npm i server-only`).
- [x] 2.3 Crear `lib/supabase/server.ts` (`createServerSupabase()`, async, por request, `server-only`), `lib/supabase/browser.ts`, `lib/supabase/session.ts` (`updateSession` con `getClaims()`). [MANUAL] verificar con 2.17.

### 2B Implementacion (TDD en logica pura)
- [x] 2.4 RED `lib/admin/route-guard.test.ts`: `decideAdminRedirect` (sin claims en `/admin` => `/admin/login`; con claims en `/admin/login` => `/admin`; `/admin/sin-acceso` con claims => sin redireccion; sin claims en `/admin/sin-acceso` => login) y `decideAccess` (`login`/`forbidden`/`allow`). Cubre auth/Proxy, auth/requireAdmin "Decision pura" [V].
- [x] 2.5 GREEN `lib/admin/route-guard.ts` minimo para pasar 2.4.
- [x] 2.6 REFACTOR `route-guard.ts` (constantes de rutas, tipos); `npm test` verde.
- [x] 2.7 RED `lib/admin/login-schema.test.ts`: email vacio/invalido, contrasena vacia, valido con trim de email; mensajes en espanol por campo. Cubre auth/Login "malformada" [V].
- [x] 2.8 GREEN `lib/admin/login-schema.ts` (Zod 4: `z.email({ error })`, `{ error }`).
- [x] 2.9 REFACTOR `login-schema.ts`; `npm test` verde.
- [x] 2.10 Crear `lib/admin/auth.ts` `requireAdmin()` (R10): `getClaims()` -> `decideAccess` -> `redirect("/admin/login")` o `redirect("/admin/sin-acceso")`; sin `signOut`; devuelve `{supabase,userId,email}`. [MANUAL 2.17]
- [x] 2.11 Crear `proxy.ts` (matcher `["/admin/:path*"]`, `updateSession`, `decideAdminRedirect`, copiar cookies de refresco en redirects, sin consultar BD). [MANUAL 2.17]
- [x] 2.12 Crear `lib/admin/actions.ts` con `signIn` (valida con login-schema, `signInWithPassword`, verifica `chorri_is_admin()`, si no: `signOut({scope:"local"})` + mensaje unico de R8, `redirect` fuera de try/catch) y `signOutAction` (`scope:"local"`).
- [x] 2.13 Crear `app/admin/layout.tsx` (metadata `robots` noindex/nofollow, `alternates: {}`, shell estatico sin leer sesion) y `components/admin/AdminHeader.tsx` (logo, email, boton "Cerrar sesion" con form + `signOutAction`).
- [x] 2.14 Crear `app/admin/login/page.tsx` y `components/admin/LoginForm.tsx` (`useActionState`, `role="alert"`, `autoComplete`, sin registro ni recuperacion) y `SubmitButton.tsx`.
- [x] 2.15 Crear `app/admin/sin-acceso/page.tsx` (mensaje + boton cerrar sesion) y `app/admin/page.tsx` provisional (Suspense + `requireAdmin()` + texto "Panel").
- [x] 2.16 Modificar `app/robots.ts` (`disallow: "/admin"`); revisar `app/sitemap.ts` (no lista `/admin`).

### 2C Testing
- [x] 2.17 [MANUAL] (2026-10-17: OK automatizado 1, 3, 8, 9, 10, 11 + login con credenciales falsas sin cookies; OK por el usuario 2 y logout => login. NO verificados en navegador: 7 (cubierto por tests de route-guard) y "no cierra sesion en otra app" (codigo revisado: scope local). Fix aplicado: `await connection()` al inicio de `requireAdmin()` por error "unstable value Date.now()" de getClaims con cacheComponents + partialPrefetching.) `npm run dev` y comprobar: (1) `/admin` sin sesion => `/admin/login`; (2) login del admin => `/admin`; (3) clave mala => "Correo o contraseña incorrectos"; (4) usuario de otra app (no admin): mismo mensaje y sin cookies de sesion; (5) abrir `/admin` con sesion no admin (si se logra) => `/admin/sin-acceso`, sin bucle; (6) "Cerrar sesion" => `/admin` redirige a login y NO se cierra la sesion en otra app; (7) admin logueado en `/admin/login` => `/admin`; (8) `/` no ejecuta proxy; (9) sin enlace de registro; (10) `/robots.txt` con `Disallow: /admin`; (11) sin errores de `cookies()`/Suspense en consola. Cubre auth/Login, Proxy, requireAdmin, Fuera de indices, Logout.
- [x] 2.18 Gate fase 2: `npm test`, `npm run lint`, `npx tsc --noEmit`.

---

## Fase 3: CRUD de productos

### 3A Infraestructura
- [ ] 3.1 Leer `02-guides/forms.md` y `03-api-reference/04-functions/redirect.md` (Next) antes de codificar.
- [ ] 3.2 Crear `lib/admin/queries.ts` (server-only): listar todos (activos e inactivos, con categoria), obtener por id, categorias, marcas, `taken` para slug (`id like 'base%' or slug like 'base%'`). [MANUAL 3.30]

### 3B Implementacion (TDD)
- [ ] 3.3 RED `lib/admin/slug.test.ts`: `slugify("Pastillas de Freno Ñandú 2.0")` = `pastillas-de-freno-nandu-2-0`; `"¡¡¡"` => `""`; trunca a 60 sin guion final. Cubre crud/Generacion de id y slug [V].
- [ ] 3.4 GREEN `lib/admin/slug.ts` `slugify`.
- [ ] 3.5 RED en `slug.test.ts`: `nextAvailableSlug` base libre, `-2`, `-3`, hueco (`-2` libre), compara id Y slug, total <= 60.
- [ ] 3.6 GREEN `nextAvailableSlug`; 3.7 REFACTOR `slug.ts`; `npm test` verde.
- [ ] 3.8 RED `lib/admin/errors.test.ts`: `mapDbError` 23505 / 42501 / P0002 / 23503 / desconocido => mensajes en espanol. Cubre crud/Crear, Seguridad.
- [ ] 3.9 GREEN `lib/admin/errors.ts`; 3.10 REFACTOR.
- [ ] 3.11 RED `lib/admin/filter.test.ts`: "AMORTIGUADOR" y "delántero" encuentran "Amortiguador delantero"; busca nombre/codigo/OEM; sin coincidencias => `[]`; vacio => todos. Cubre crud/Listado [V].
- [ ] 3.12 GREEN `lib/admin/filter.ts`; 3.13 REFACTOR.
- [ ] 3.14 RED `lib/admin/product-form.test.ts` (esquema): valido con trim; nombre `"   "` => "El nombre es obligatorio"; nombre "¡¡¡" => "El nombre debe incluir letras o numeros"; disponibilidad "Quizá" falla; specs: fila vacia descartada, solo label => error, max 12. Cubre crud/Esquema [V].
- [ ] 3.15 GREEN `lib/admin/product-form.ts` `productFormSchema` (reutiliza `availabilitySchema` de `lib/product-schema.ts`).
- [ ] 3.16 RED (precio): vacio => `null`, `-5` y `"abc"` fallan, `"12,50"` y `"12.5"` validos, >2 decimales falla. Cubre crud/Precio [V].
- [ ] 3.17 GREEN precio en el esquema.
- [ ] 3.18 RED `parseProductFormData(FormData)` (FormData de Node, `marcaIds` multiples, `activo` checkbox) y `formToRpcPayload` (crear incluye `id`/`slug`; editar NO los incluye; precio `null` no `""`; `imagen` segun R17). Cubre crud/Generacion "Editar nombre" [V].
- [ ] 3.19 GREEN `parseProductFormData` y `formToRpcPayload`.
- [ ] 3.20 RED `rowToFormValues` ida y vuelta consistente con `rowToProduct` (crud/Editar "Ida y vuelta" [V]); 3.21 GREEN; 3.22 REFACTOR `product-form.ts`; `npm test` verde.
- [ ] 3.23 Ampliar `lib/admin/actions.ts`: `saveProduct` (`requireAdmin` -> Zod -> slug unico -> `rpc("chorri_guardar_producto")` -> en 23505 un reintento con `taken` fresco -> `mapDbError` -> `redirect("/admin")`) y `setProductActive` (valida id, `update activo` bajo RLS). `imagen` por R17. Cubre crud/Crear, Seguridad.
- [ ] 3.24 Crear `app/admin/page.tsx` (listado con Suspense, buscador, contador `aria-live`, "sin resultados"), `components/admin/ProductList.tsx`, `ActiveToggle.tsx` (confirmacion, `aria-pressed`; sin control de borrado).
- [ ] 3.25 Crear `app/admin/productos/nuevo/page.tsx` y `app/admin/productos/[id]/page.tsx` (`notFound()` si no existe; `params` como promesa al hijo async).
- [ ] 3.26 Crear `components/admin/ProductForm.tsx`, `SpecsEditor.tsx`, `BrandPicker.tsx` (fieldset/legend, errores por campo, foco al primer error, boton Guardar fijo en movil, nota "No se muestra en la web por ahora"); campo `imagen` oculto con el valor actual.

### 3C Testing
- [ ] 3.27 [MANUAL] Crear producto con 2 marcas: aparece en listado y en la web publica al recargar, precio NO visible. Cubre crud/Crear, Precio.
- [ ] 3.28 [MANUAL] Editar nombre, campos y marcas: slug/id no cambian, la imagen existente se conserva, formulario recarga con lo guardado. Producto inexistente => no encontrado.
- [ ] 3.29 [MANUAL] Desactivar: desaparece de la web, sigue en admin, reactivable. Buscar con acentos. Sin boton de borrado.
- [ ] 3.30 [MANUAL] Payload manipulado: enviar el form con campos invalidos (DevTools) => errores y nada escrito; marca inexistente => error en espanol sin producto creado; colision de nombre => `-2`.
- [ ] 3.31 Gate fase 3: `npm test`, `npm run lint`, `npx tsc --noEmit`.

---

## Fase 4: Imagenes

### 4A Infraestructura
- [ ] 4.1 Verificar hostname real con `get_project_url` (solo lectura) y modificar `next.config.ts`: `remotePatterns` con hostname derivado de `NEXT_PUBLIC_SUPABASE_URL`, `pathname: "/storage/v1/object/public/chorri-productos/**"`. Cubre img/Imagenes remotas.
- [ ] 4.2 (El bucket y sus politicas ya se crearon en 1.4; no hay escritura nueva en BD en esta fase.)

### 4B Implementacion (TDD en `lib/admin/image.ts`)
- [ ] 4.3 RED `lib/admin/image.test.ts` `validateImageFile`: jpeg 2 MB ok; `application/pdf` rechazado (mensaje de formato); > 15 MB => "La imagen supera los 15 MB" (R3). Cubre img/Validacion en cliente [V].
- [ ] 4.4 GREEN `validateImageFile`.
- [ ] 4.5 RED `fitWithin(w,h,1200)`: horizontal, vertical, ya pequena (800 no se amplia). 4.6 GREEN.
- [ ] 4.7 RED `buildObjectPath(ext, uuid)` (`productos/{uuid}.webp|.jpg`, dos uuid distintos difieren; R2) y `buildPublicUrl(supabaseUrl, path)` (prefijo `/storage/v1/object/public/chorri-productos/`). Cubre img/Nombre y URL [V]. 4.8 GREEN.
- [ ] 4.9 RED `isOwnImageUrl` (R1): propia ok; `https://evil.com/x.png`; otro bucket `products`; prefijo enganoso en otro host; `..`; con query/hash; extension `.png`/`.gif`; `null`/vacio valido; y `objectPathFromUrl`. Cubre img/Validacion de URL [V]. 4.10 GREEN. 4.11 REFACTOR `image.ts`; `npm test` verde.
- [ ] 4.12 Crear `lib/admin/image-client.ts` (`"use client"`): `createImageBitmap(file,{imageOrientation:"from-image"})`, canvas, `toBlob("image/webp",0.82)` con respaldo JPEG 0.85, subida con `upsert:false`, `cacheControl:"31536000"`, mensaje HEIC (R6). [MANUAL 4.18-4.20]
- [ ] 4.13 Crear `components/admin/ImageUploader.tsx` (boton "Tomar o elegir foto", vista previa, Procesando/Subiendo, Quitar, borra subida pendiente previa) e integrarlo en `ProductForm.tsx`.
- [ ] 4.14 Modificar `saveProduct`: validar `imagen` con `isOwnImageUrl` (error en espanol si falla), guardar `null` si vacio, y tras guardar OK borrar la imagen anterior propia (best-effort, sin bloquear). Quitar la restriccion R17.

### 4C Testing
- [ ] 4.15 [MANUAL] Foto 4000x3000 de celular: sale WebP con lado mayor 1200 y peso muy inferior; imagen de 800 px no se amplia; orientacion correcta.
- [ ] 4.16 [MANUAL] HEIC o archivo no decodificable: mensaje de R6 y no se sube nada; PDF rechazado.
- [ ] 4.17 [MANUAL] Reemplazar foto: la web muestra la nueva y el producto referencia solo la nueva URL. Subir y abandonar: producto intacto.
- [ ] 4.18 [MANUAL] La imagen subida se ve en la web con `next/image` sin error de host; la URL publica abre sin sesion.
- [ ] 4.19 [MANUAL] Intentar guardar `imagen` con URL externa o del bucket `products` (DevTools) => rechazada.
- [ ] 4.20 **PC** [MANUAL/SQL] Prueba real de Storage: con una sesion de usuario NO admin intentar subir/borrar en `chorri-productos` (debe fallar); con admin funciona; subir >5 MB o mime no permitido directo => rechazo. Cubre img/Bucket.
- [ ] 4.21 Gate fase 4: `npm test`, `npm run lint`, `npx tsc --noEmit`.

---

## Fase 5: Cierre

- [ ] 5.1 **PC (manual del dueno)**: eliminar `SUPABASE_SERVICE_ROLE_KEY` y `DATABASE_URL` de Vercel (sin uso) tras confirmar que la app desplegada funciona.
- [ ] 5.2 **Aviso (fuera de alcance)**: informar al dueno del proyecto compartido que el bucket `products` permite a cualquier usuario autenticado subir/modificar/borrar; no se modifica ni se usa.
- [ ] 5.3 Dejar anotados: cache futura (`cacheTag("catalogo")` + `updateTag`), limpieza manual de imagenes huerfanas, rollback SQL del design.
- [ ] 5.4 Verificacion final: `npm test`, `npm run lint`, `npx tsc --noEmit` y repaso de cada escenario de las 3 specs (sdd-verify).
