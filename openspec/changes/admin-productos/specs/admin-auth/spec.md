# Admin Auth Specification

## Purpose

Acceso al panel `/admin` solo para el admin unico. `auth.users` es compartido con otras apps: autenticado NO implica admin. Autorizacion por allowlist `chorri_admins` y `chorri_is_admin()`.

Leyenda de verificacion: **[V]** Vitest (logica pura en `lib/`), **[M]** manual/SQL (proxy, RLS, Server Actions).

## Requirements

### Requirement: Login con email y contraseña

El sistema MUST autenticar con email+contraseña (Supabase Auth) y mantener la sesion por cookies. La pantalla de login MUST NOT ofrecer registro ni magic link. Los errores MUST mostrarse en espanol y SHALL NOT revelar si el email existe.

#### Scenario: Login correcto del admin [M]
- GIVEN el admin existe en `auth.users` y en `chorri_admins`
- WHEN envia email y contraseña validos en `/admin/login`
- THEN se crea la sesion por cookies y se redirige al listado de productos

#### Scenario: Credenciales invalidas [M]
- GIVEN un email o contraseña incorrectos
- WHEN se envia el formulario
- THEN se muestra un mensaje generico en espanol ("Correo o contraseña incorrectos") sin crear sesion

#### Scenario: Entrada de login malformada [V]
- GIVEN email vacio o con formato invalido, o contraseña vacia
- WHEN se valida con el esquema Zod
- THEN falla con mensajes en espanol por campo, sin llamar a Supabase

#### Scenario: Sin registro [M]
- GIVEN la pagina `/admin/login`
- WHEN se inspecciona
- THEN no existe enlace ni formulario de alta de cuenta

### Requirement: Proxy optimista

`proxy.ts` MUST aplicarse solo a `/admin/:path*`, refrescar la sesion y redirigir a `/admin/login` si no hay sesion. MUST NOT ser la unica defensa. Las rutas publicas MUST NOT pasar por el proxy.

#### Scenario: Sin sesion en ruta protegida [M]
- GIVEN un visitante sin sesion
- WHEN solicita `/admin` o `/admin/productos/x`
- THEN recibe redireccion a `/admin/login`

#### Scenario: Ruta publica intacta [M]
- GIVEN cualquier visitante
- WHEN solicita `/`
- THEN el proxy no se ejecuta y el catalogo se sirve como antes

#### Scenario: Admin ya autenticado en login [M]
- GIVEN una sesion de admin valida
- WHEN visita `/admin/login`
- THEN se redirige al listado

### Requirement: requireAdmin() en cada pagina y Server Action

Toda pagina `/admin` (excepto login) y toda Server Action MUST invocar `requireAdmin()`, que verifica la sesion (firma del JWT, nunca `getSession()`) y la pertenencia a `chorri_admins`. Si falla, MUST rechazar sin ejecutar la operacion.

#### Scenario: Autenticado no admin en pagina [M]
- GIVEN un usuario de otra app, autenticado y fuera de `chorri_admins`
- WHEN abre `/admin`
- THEN es rechazado (redireccion/403) y no ve datos

#### Scenario: Autenticado no admin invoca Server Action [M]
- GIVEN el mismo usuario
- WHEN invoca crear, editar o activar/desactivar directamente
- THEN la accion devuelve rechazo y no se escribe nada

#### Scenario: Sesion ausente invoca Server Action [M]
- GIVEN sin sesion
- WHEN se invoca una Server Action
- THEN se rechaza sin tocar la BD

#### Scenario: Decision de acceso pura [V]
- GIVEN claims ausentes, claims sin fila en allowlist, o claims con fila
- WHEN se evalua la funcion pura de decision
- THEN devuelve respectivamente `login`, `forbidden`, `allow`

### Requirement: Allowlist y RLS como barrera final

`chorri_admins` MUST tener RLS activa y ninguna politica de escritura para `anon`/`authenticated`. `chorri_is_admin()` MUST ser SECURITY DEFINER con `search_path` fijo, ejecutable solo por `authenticated`. Las politicas de escritura de `chorri_productos` y `chorri_producto_marcas` MUST exigir `chorri_is_admin()`; MUST NOT existir politicas DELETE sobre `chorri_productos`.

#### Scenario: No admin intenta escribir [M, SQL]
- GIVEN rol `authenticated` con JWT de usuario no admin
- WHEN hace INSERT/UPDATE en `chorri_productos` o `chorri_producto_marcas`
- THEN la BD lo rechaza (RLS)

#### Scenario: Anonimo y funcion [M, SQL]
- GIVEN rol `anon`
- WHEN ejecuta `chorri_is_admin()` o escribe en `chorri_admins`
- THEN se deniega

#### Scenario: Admin escribe y ve inactivos [M, SQL]
- GIVEN JWT del admin en allowlist
- WHEN hace INSERT/UPDATE y SELECT de productos con `activo=false`
- THEN tiene exito y los inactivos son visibles solo para el admin

#### Scenario: Web publica sin cambios [M, SQL]
- GIVEN rol `anon`
- WHEN consulta `chorri_productos`
- THEN solo ve productos `activo=true`

### Requirement: Admin fuera de indices

`/admin` MUST llevar `noindex`, `robots.ts` MUST declarar `disallow /admin` y el sitemap MUST NOT listarlo.

#### Scenario: Robots y sitemap [M]
- GIVEN la app desplegada
- WHEN se piden `/robots.txt` y `/sitemap.xml`
- THEN robots contiene `Disallow: /admin` y sitemap no incluye `/admin`

### Requirement: Cierre de sesion

El sistema MUST ofrecer cerrar sesion, que elimina las cookies y redirige a login.

#### Scenario: Logout [M]
- GIVEN el admin autenticado
- WHEN pulsa "Cerrar sesion"
- THEN la sesion termina y `/admin` redirige a login
