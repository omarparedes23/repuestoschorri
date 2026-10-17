# Admin Imagenes Specification

## Purpose

Subida de fotos de producto al bucket propio `chorri-productos`, con redimension en cliente y validaciones en cliente, Server Action y bucket.

Leyenda: **[V]** Vitest (`lib/admin/image.ts`), **[M]** manual/SQL (canvas, Storage, RLS).

## Requirements

### Requirement: Bucket propio con escritura solo admin

El bucket `chorri-productos` MUST ser de lectura publica, con limite 5MB y mimes jpeg/png/webp/avif. INSERT/UPDATE/DELETE en `storage.objects` MUST exigir `chorri_is_admin()`. El bucket `products` MUST NOT usarse.

#### Scenario: Lectura publica [M]
- GIVEN un objeto en `chorri-productos`
- WHEN un anonimo abre su URL publica
- THEN se sirve la imagen

#### Scenario: No admin sube [M, SQL]
- GIVEN un usuario autenticado no admin
- WHEN intenta subir, reemplazar o borrar un objeto
- THEN Storage lo rechaza

#### Scenario: Limites del bucket [M]
- GIVEN un admin
- WHEN sube un archivo >5MB o con mime no permitido directamente
- THEN Storage lo rechaza

### Requirement: Validacion de archivo en cliente

Antes de subir, el sistema MUST validar tipo (jpeg/png/webp/avif) y tamano (<=5MB) con mensajes en espanol.

#### Scenario: Archivo valido [V]
- GIVEN `{type:"image/jpeg", size:2MB}`
- WHEN se valida
- THEN es aceptado

#### Scenario: Demasiado grande [V]
- GIVEN `size` > 5MB
- WHEN se valida
- THEN se rechaza con "La imagen supera los 5 MB"

#### Scenario: Tipo no permitido [V]
- GIVEN `type:"application/pdf"`
- WHEN se valida
- THEN se rechaza con mensaje de formato no permitido

### Requirement: Redimension en cliente

El sistema MUST redimensionar a WebP, lado mayor ~1200px, calidad ~0.8, respetando la orientacion EXIF y sin ampliar imagenes menores. SHOULD usar JPEG como respaldo si el navegador no genera WebP.

#### Scenario: Foto grande de celular [M]
- GIVEN una foto de 4000x3000 y 6MB
- WHEN se procesa
- THEN el resultado es WebP con lado mayor 1200px y peso muy inferior

#### Scenario: Imagen pequena [M]
- GIVEN una imagen de 800px
- WHEN se procesa
- THEN no se amplia

#### Scenario: HEIC o no decodificable [M]
- GIVEN un archivo que el navegador no puede decodificar (p. ej. HEIC)
- WHEN se intenta procesar
- THEN se muestra "No se pudo leer la imagen; use JPG, PNG o WebP" y no se sube nada

### Requirement: Nombre de objeto y URL publica

Cada subida MUST usar un nombre unico `{productId}/{hash}.webp`; la URL publica MUST construirse con el prefijo del bucket.

#### Scenario: Nombre unico [V]
- GIVEN dos subidas del mismo producto
- WHEN se generan los nombres
- THEN difieren y ambos empiezan por `{productId}/`

#### Scenario: Construccion de URL [V]
- GIVEN un nombre de objeto
- WHEN se construye la URL
- THEN empieza con `<SUPABASE_URL>/storage/v1/object/public/chorri-productos/`

### Requirement: Validacion de URL de imagen en el servidor

La Server Action MUST rechazar un `imagen` que no tenga el prefijo del bucket `chorri-productos`. Vacio/null MUST ser valido (producto sin foto).

#### Scenario: URL propia [V]
- GIVEN URL con prefijo del bucket
- WHEN se valida
- THEN es aceptada

#### Scenario: URL externa o de otro bucket [V]
- GIVEN `https://evil.com/x.png` o una URL del bucket `products`
- WHEN se valida
- THEN se rechaza con mensaje en espanol

#### Scenario: Prefijo enganoso [V]
- GIVEN `https://evil.com/storage/v1/object/public/chorri-productos/x`
- WHEN se valida
- THEN se rechaza (se compara host y ruta completos)

#### Scenario: Sin imagen [V]
- GIVEN imagen vacia
- WHEN se valida
- THEN es valida y se guarda `null`

### Requirement: Reemplazo y huerfanas

El admin MUST poder reemplazar la imagen; la nueva URL sustituye a la anterior. El sistema MAY dejar objetos huerfanos (limpieza manual).

#### Scenario: Reemplazar [M]
- GIVEN un producto con imagen
- WHEN el admin sube otra y guarda
- THEN la web muestra la nueva y el producto referencia solo la nueva URL

#### Scenario: Subida sin guardar [M]
- GIVEN una imagen subida y formulario abandonado
- WHEN se cierra
- THEN el producto no cambia y el objeto queda huerfano sin afectar el catalogo

### Requirement: Imagenes remotas en next/image

`next.config.ts` MUST permitir solo el host del proyecto con `pathname` `/storage/v1/object/public/chorri-productos/**`.

#### Scenario: Render de imagen subida [M]
- GIVEN un producto con imagen del bucket
- WHEN se muestra en la web
- THEN `next/image` la renderiza sin error de host no configurado
