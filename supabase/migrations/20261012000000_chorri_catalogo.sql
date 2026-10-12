-- =============================================================================
-- RB Repuestos Chorry — Esquema del catálogo (Supabase / Postgres)
-- Todas las tablas con prefijo `chorri_`.
-- Origen de datos actual: data/products.ts (24 productos mock) + data/brands.ts.
-- =============================================================================

-- Extensiones: búsqueda sin tildes (unaccent) y tolerante a errores (trigram).
create extension if not exists unaccent;
create extension if not exists pg_trgm;

-- -----------------------------------------------------------------------------
-- Categorías (lookup). Un producto pertenece a UNA categoría -> FK simple.
-- -----------------------------------------------------------------------------
create table if not exists chorri_categorias (
  id         text primary key,                 -- 'pernos', 'suspension', 'frenos'...
  nombre     text not null,                    -- lo que ve la UI: 'Pernos y Fijaciones'
  orden      int  not null default 0,
  activa     boolean not null default true,
  creado_en  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Marcas (lookup). El logo NO vive en la DB: va en /public/brands (data/brands.ts).
-- -----------------------------------------------------------------------------
create table if not exists chorri_marcas (
  id         text primary key,                 -- 'toyota', 'nissan'...
  nombre     text not null unique,             -- 'Toyota', 'Mercedes-Benz'
  activa     boolean not null default true,
  creado_en  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Productos.
-- -----------------------------------------------------------------------------
create table if not exists chorri_productos (
  id              text primary key,            -- 'p01' (estable: lo referencia el carrito)
  slug            text unique,                 -- para URLs SEO
  nombre          text not null,
  codigo          text not null,               -- PE-1450 (código interno)
  oem             text not null,               -- 48190-02050 (código OEM)
  categoria_id    text not null references chorri_categorias (id),
  compatibilidad  text not null,
  disponibilidad  text not null default 'Bajo pedido'
                    check (disponibilidad in (
                      'En stock inmediato',
                      'Envío hoy',
                      'Bajo pedido'
                    )),
  imagen          text,
  precio          numeric(10,2),               -- número; NULL = "consultar precio"
  moneda          char(3) not null default 'PEN',
  precio_nota     text,                        -- '(par)', '(juego x4)'
  garantia        text not null,
  especificaciones jsonb not null default '[]'::jsonb,  -- [{label, value}, ...]
  descripcion     text,
  activo          boolean not null default true,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Relación N:M Producto <-> Marca (compatibilidad con varias marcas de vehículo).
-- -----------------------------------------------------------------------------
create table if not exists chorri_producto_marcas (
  producto_id text not null references chorri_productos (id) on delete cascade,
  marca_id    text not null references chorri_marcas     (id) on delete cascade,
  primary key (producto_id, marca_id)
);

-- -----------------------------------------------------------------------------
-- Búsqueda sin tildes.
-- `unaccent()` es STABLE, no IMMUTABLE -> no sirve directo en columna generada.
-- Wrapper IMMUTABLE para poder indexar.
-- -----------------------------------------------------------------------------
create or replace function chorri_unaccent(p_text text)
returns text
language sql
immutable
parallel safe
strict
as $$
  select public.unaccent('public.unaccent', p_text)
$$;

alter table chorri_productos
  add column if not exists busqueda text
  generated always as (
    chorri_unaccent(
      lower(nombre || ' ' || codigo || ' ' || oem || ' ' || compatibilidad)
    )
  ) stored;

-- -----------------------------------------------------------------------------
-- Índices.
-- -----------------------------------------------------------------------------
create index if not exists chorri_productos_categoria_idx
  on chorri_productos (categoria_id);
create index if not exists chorri_productos_disponibilidad_idx
  on chorri_productos (disponibilidad);
create index if not exists chorri_productos_activo_idx
  on chorri_productos (activo) where activo;

-- Búsqueda por trigram (tolerante a errores de tipeo y sin tildes).
create index if not exists chorri_productos_busqueda_trgm
  on chorri_productos using gin (busqueda gin_trgm_ops);
create index if not exists chorri_productos_codigo_trgm
  on chorri_productos using gin (codigo gin_trgm_ops);
create index if not exists chorri_productos_oem_trgm
  on chorri_productos using gin (oem gin_trgm_ops);

create index if not exists chorri_producto_marcas_marca_idx
  on chorri_producto_marcas (marca_id);

-- -----------------------------------------------------------------------------
-- Trigger: mantener actualizado_en al vuelo.
-- -----------------------------------------------------------------------------
create or replace function chorri_touch_actualizado_en()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

drop trigger if exists chorri_productos_touch on chorri_productos;
create trigger chorri_productos_touch
  before update on chorri_productos
  for each row execute function chorri_touch_actualizado_en();

-- -----------------------------------------------------------------------------
-- RLS: lectura pública solo de filas activas; escritura solo con secret key
-- (la secret key salta RLS -> no hace falta policy de escritura).
-- -----------------------------------------------------------------------------
alter table chorri_categorias       enable row level security;
alter table chorri_marcas           enable row level security;
alter table chorri_productos        enable row level security;
alter table chorri_producto_marcas  enable row level security;

drop policy if exists "lectura publica categorias" on chorri_categorias;
create policy "lectura publica categorias"
  on chorri_categorias for select
  to anon, authenticated
  using (activa);

drop policy if exists "lectura publica marcas" on chorri_marcas;
create policy "lectura publica marcas"
  on chorri_marcas for select
  to anon, authenticated
  using (activa);

drop policy if exists "lectura publica productos" on chorri_productos;
create policy "lectura publica productos"
  on chorri_productos for select
  to anon, authenticated
  using (activo);

drop policy if exists "lectura publica producto_marcas" on chorri_producto_marcas;
create policy "lectura publica producto_marcas"
  on chorri_producto_marcas for select
  to anon, authenticated
  using (
    exists (
      select 1 from chorri_productos p
      where p.id = producto_id and p.activo
    )
  );
