-- =============================================================================
-- RB Repuestos Chorry — Administración de productos (panel /admin)
-- Aditiva. Solo toca objetos con prefijo `chorri_` y el bucket `chorri-productos`.
-- La base es compartida con otras apps: auth.users es común, por eso
-- "authenticated" NO implica admin; la autorización es la allowlist chorri_admins.
-- El INSERT de los admins NO va aquí (uuid desconocido): ver tasks.md 1.8.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Allowlist de administradores (sin políticas: solo la lee chorri_is_admin)
-- -----------------------------------------------------------------------------
create table if not exists public.chorri_admins (
  user_id   uuid primary key references auth.users (id) on delete cascade,
  email     text not null,
  creado_en timestamptz not null default now()
);
alter table public.chorri_admins enable row level security;
revoke all on public.chorri_admins from anon, authenticated;

-- -----------------------------------------------------------------------------
-- 2) Pertenencia a la allowlist. SECURITY DEFINER para leer chorri_admins;
--    Supabase da EXECUTE a anon por defecto, por eso el revoke explícito.
-- -----------------------------------------------------------------------------
create or replace function public.chorri_is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.chorri_admins a where a.user_id = (select auth.uid())) $$;
revoke all on function public.chorri_is_admin() from public, anon;
grant execute on function public.chorri_is_admin() to authenticated;

-- -----------------------------------------------------------------------------
-- 3) Privilegios de tabla (endurecer; RLS sigue siendo la barrera).
--    Por defecto anon/authenticated tenían todo, incluido TRUNCATE (que RLS no cubre).
-- -----------------------------------------------------------------------------
revoke insert, update, delete, truncate, references, trigger
  on public.chorri_categorias, public.chorri_marcas,
     public.chorri_productos, public.chorri_producto_marcas from anon;
revoke delete, truncate, references, trigger
  on public.chorri_categorias, public.chorri_marcas,
     public.chorri_productos, public.chorri_producto_marcas from authenticated;
revoke insert, update on public.chorri_categorias, public.chorri_marcas from authenticated;
grant insert, update on public.chorri_productos to authenticated;
grant insert, delete on public.chorri_producto_marcas to authenticated;

-- -----------------------------------------------------------------------------
-- 4) Políticas de escritura solo para admins. Sin DELETE en productos
--    (se desactivan con activo = false). El SELECT de admin ve también inactivos.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 5) Guardado transaccional de producto + marcas. SECURITY INVOKER: corre con el
--    rol del llamante, así que las políticas de arriba siguen aplicando.
--    `busqueda` es columna generada y `actualizado_en` lo mantiene un trigger.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 6) Bucket propio (lectura pública por URL; 5 MB; mimes acotados).
--    No se reutiliza `products`: sus políticas dejan escribir a cualquier authenticated.
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chorri-productos', 'chorri-productos', true, 5242880,
        array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- 7) Políticas de storage.objects solo para admins (sin UPDATE: no hay upsert).
-- -----------------------------------------------------------------------------
create policy chorri_storage_admin_select on storage.objects
  for select to authenticated
  using (bucket_id = 'chorri-productos' and (select public.chorri_is_admin()));
create policy chorri_storage_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'chorri-productos' and (select public.chorri_is_admin()));
create policy chorri_storage_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'chorri-productos' and (select public.chorri_is_admin()));
