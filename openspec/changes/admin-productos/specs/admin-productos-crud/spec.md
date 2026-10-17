# Admin Productos CRUD Specification

## Purpose

Gestion de ~30 productos por el admin: listar con busqueda, crear, editar, activar/desactivar. Sin borrado. Validacion Zod 4 con mensajes en espanol.

Leyenda: **[V]** Vitest (`lib/`), **[M]** manual/SQL (Server Actions, UI, RLS).

## Requirements

### Requirement: Listado con busqueda

El sistema MUST listar todos los productos (activos e inactivos) con su estado, y MUST permitir buscar por nombre, codigo u OEM sin distinguir mayusculas ni acentos.

#### Scenario: Listado completo [M]
- GIVEN productos activos e inactivos
- WHEN el admin abre el listado
- THEN ve todos, con indicador de estado

#### Scenario: Busqueda sin acentos [V]
- GIVEN un producto "Amortiguador delantero"
- WHEN se filtra con "AMORTIGUADOR" o "delántero"
- THEN el filtro puro lo incluye

#### Scenario: Sin resultados [V]
- GIVEN un termino sin coincidencias
- WHEN se filtra
- THEN la lista queda vacia y la UI muestra un mensaje de "sin resultados" [M]

### Requirement: Esquema de formulario

El esquema MUST exigir nombre, codigo, categoria y disponibilidad (`"En stock inmediato" | "Envío hoy" | "Bajo pedido"`); oem, compatibilidad, garantia, descripcion y precio_nota MAY ser vacios. Los textos MUST recortarse (trim). Los errores MUST estar en espanol por campo.

#### Scenario: Producto valido [V]
- GIVEN todos los obligatorios con valores validos
- WHEN se hace `safeParse`
- THEN tiene exito con textos recortados

#### Scenario: Obligatorio vacio o solo espacios [V]
- GIVEN nombre "   "
- WHEN se valida
- THEN falla con "El nombre es obligatorio"

#### Scenario: Disponibilidad fuera del enum [V]
- GIVEN disponibilidad "Quizá"
- WHEN se valida
- THEN falla con mensaje en espanol

#### Scenario: Especificaciones [V]
- GIVEN filas `{label,value}` con una fila totalmente vacia y otra con solo label
- WHEN se normaliza
- THEN la vacia se descarta y la incompleta produce error

### Requirement: Precio opcional

El precio MAY omitirse; si existe MUST ser numero >= 0 en PEN. El precio MUST NOT mostrarse en la web publica.

#### Scenario: Sin precio [V]
- GIVEN precio vacio
- WHEN se valida y mapea a fila
- THEN precio es `null` y es valido

#### Scenario: Precio negativo o no numerico [V]
- GIVEN precio -5 o "abc"
- WHEN se valida
- THEN falla con mensaje en espanol

#### Scenario: Web publica no lo muestra [M]
- GIVEN un producto con precio
- WHEN se ve en la web
- THEN el precio no aparece

### Requirement: Generacion de id y slug

`id` y `slug` MUST generarse en la app (sin default en BD). El slug MUST derivarse del nombre (minusculas, sin acentos/ñ, guiones), ser unico y MUST permanecer estable al editar el nombre. Ante colision MUST anadirse un sufijo numerico (`-2`, `-3`).

#### Scenario: Slugify [V]
- GIVEN "Pastillas de Freno Ñandú 2.0"
- WHEN se genera el slug
- THEN es `pastillas-de-freno-nandu-2-0`

#### Scenario: Colision [V]
- GIVEN existe `amortiguador-delantero`
- WHEN se crea otro con el mismo nombre
- THEN el slug es `amortiguador-delantero-2`

#### Scenario: Editar nombre [V]
- GIVEN un producto existente con slug S
- WHEN se cambia el nombre
- THEN el slug sigue siendo S

#### Scenario: Nombre sin caracteres utilizables [V]
- GIVEN nombre "¡¡¡"
- WHEN se genera slug
- THEN se rechaza con error en espanol

### Requirement: Crear producto

La accion MUST ejecutar `requireAdmin()`, validar con Zod, insertar el producto y luego sus marcas. Categoria y marcas MUST ser existentes.

#### Scenario: Alta correcta [M]
- GIVEN admin y datos validos con 2 marcas
- WHEN envia el formulario
- THEN se crea activo, con 2 filas en `chorri_producto_marcas`, y aparece en el listado y en la web sin invalidacion

#### Scenario: Categoria o marca inexistente [M]
- GIVEN un id de categoria/marca que no existe
- WHEN se envia
- THEN se rechaza sin crear el producto

#### Scenario: Fallo parcial [M]
- GIVEN el producto se inserto y las marcas fallan
- WHEN la accion termina
- THEN informa el error en espanol y permite reintentar sin duplicar el producto

### Requirement: Editar producto y marcas

La edicion MUST actualizar los campos y sincronizar marcas calculando altas y bajas (diff).

#### Scenario: Diff de marcas [V]
- GIVEN marcas actuales {A,B} y nuevas {B,C}
- WHEN se calcula el diff
- THEN a insertar {C}, a borrar {A}

#### Scenario: Edicion correcta [M]
- GIVEN un producto existente
- WHEN el admin cambia campos y marcas
- THEN se persisten y el formulario recarga con los valores guardados

#### Scenario: Ida y vuelta fila-formulario [V]
- GIVEN una fila de BD
- WHEN se mapea a formulario y de vuelta a fila
- THEN el resultado es equivalente y consistente con `rowToProduct`

#### Scenario: Producto inexistente [M]
- GIVEN un id que no existe
- WHEN se abre su pagina de edicion
- THEN se muestra no encontrado

### Requirement: Activar/desactivar sin borrado

El sistema MUST permitir alternar `activo` y MUST NOT ofrecer borrado.

#### Scenario: Desactivar [M]
- GIVEN un producto activo
- WHEN el admin lo desactiva
- THEN desaparece de la web publica, sigue en el admin y puede reactivarse

#### Scenario: Sin borrado [M, SQL]
- GIVEN la UI y las politicas RLS
- WHEN se busca un control o permiso de borrado
- THEN no existe en UI y DELETE sobre `chorri_productos` es denegado

### Requirement: Seguridad de las acciones

Las acciones MUST rechazar entradas invalidas sin escribir y MUST NOT confiar en el cliente (el estado `activo`, ids y URL de imagen se revalidan).

#### Scenario: Payload manipulado [M]
- GIVEN un POST directo con campos invalidos
- WHEN el admin lo envia
- THEN la accion devuelve errores de validacion y no escribe

#### Scenario: No admin [M]
- GIVEN un usuario autenticado no admin
- WHEN invoca cualquier accion
- THEN se rechaza en `requireAdmin()` y por RLS
