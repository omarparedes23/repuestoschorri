-- =============================================================================
-- Verificación de seguridad de 20261017000000_chorri_admin.sql
-- Cada bloque corre en transacción y termina en ROLLBACK: no deja datos.
-- Reemplazar antes de ejecutar:
--   <OTRO_USER>  = uuid de un usuario existente que NO esté en chorri_admins
--   <ADMIN_UUID> = uuid de un usuario que SÍ esté en chorri_admins
-- Nota: storage.objects tiene el trigger protect_objects_delete, que impide
-- borrados directos por SQL; por eso ningún bloque borra objetos (el rollback basta).
-- =============================================================================

-- A) NO ADMIN autenticado: todo debe fallar o afectar 0 filas
begin;
select set_config('request.jwt.claims',
  '{"sub":"<OTRO_USER>","role":"authenticated"}', true);
set local role authenticated;
do $$
declare n int; cat text;
begin
  select id into cat from public.chorri_categorias limit 1;
  begin
    insert into public.chorri_productos (id, slug, nombre, codigo, oem, categoria_id, compatibilidad, garantia)
      values ('zz-test', 'zz-test', 't', 't', 't', cat, 't', 't');
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
    insert into storage.objects (bucket_id, name) values ('chorri-productos', 'productos/zz.webp');
    raise exception 'FALLO: Storage INSERT permitido';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.chorri_producto_marcas values ('x', 'y');
    raise exception 'FALLO: INSERT producto_marcas permitido';
  exception when insufficient_privilege then null; end;
  if (select count(*) from public.chorri_productos where not activo) <> 0 then
    raise exception 'FALLO: ve inactivos'; end if;
  raise notice 'OK: no-admin bloqueado';
end $$;
rollback;

-- B) ANON no ejecuta la función de pertenencia
begin;
set local role anon;
do $$ begin
  begin perform public.chorri_is_admin(); raise exception 'FALLO: anon ejecuta';
  exception when insufficient_privilege then raise notice 'OK: anon bloqueado'; end;
end $$;
rollback;

-- C) ADMIN: crear, editar (incluido inactivo), reemplazar marcas, subir a Storage; sin DELETE
begin;
select set_config('request.jwt.claims',
  '{"sub":"<ADMIN_UUID>","role":"authenticated"}', true);
set local role authenticated;
do $$
declare cat text; mar text;
begin
  if not public.chorri_is_admin() then raise exception 'FALLO: no es admin'; end if;
  select id into cat from public.chorri_categorias limit 1;
  select id into mar from public.chorri_marcas limit 1;
  perform public.chorri_guardar_producto(jsonb_build_object('id', 'zz-test', 'slug', 'zz-test',
    'nombre', 't', 'codigo', 't', 'oem', 't', 'categoria_id', cat, 'compatibilidad', 't',
    'disponibilidad', 'Bajo pedido', 'garantia', 't', 'activo', false), array[mar], true);
  perform public.chorri_guardar_producto(jsonb_build_object('id', 'zz-test', 'nombre', 't2',
    'codigo', 't', 'oem', 't', 'categoria_id', cat, 'compatibilidad', 't',
    'disponibilidad', 'Bajo pedido', 'garantia', 't', 'activo', false), '{}', false);
  if not exists (select 1 from public.chorri_productos where id = 'zz-test' and nombre = 't2' and not activo)
    then raise exception 'FALLO: admin no ve/edita inactivo'; end if;
  if exists (select 1 from public.chorri_producto_marcas where producto_id = 'zz-test')
    then raise exception 'FALLO: marcas no reemplazadas'; end if;
  insert into storage.objects (bucket_id, name) values ('chorri-productos', 'productos/zz.webp');
  begin
    delete from public.chorri_productos where id = 'zz-test';
    if found then raise exception 'FALLO: DELETE permitido'; end if;
  exception when insufficient_privilege then null; end;
  raise notice 'OK: admin';
end $$;
rollback;

-- D) Inspección de privilegios (solo lectura)
select table_name, grantee, string_agg(privilege_type, ',' order by privilege_type) as privs
from information_schema.role_table_grants
where table_schema = 'public' and table_name like 'chorri_%' and grantee in ('anon', 'authenticated')
group by table_name, grantee order by table_name, grantee;

-- E) ADMIN: atomicidad e integridad (FK inexistente => 23503 sin huérfanos; id duplicado => 23505)
begin;
select set_config('request.jwt.claims',
  '{"sub":"<ADMIN_UUID>","role":"authenticated"}', true);
set local role authenticated;
do $$
declare cat text; existente text;
begin
  select id into cat from public.chorri_categorias limit 1;
  select id into existente from public.chorri_productos limit 1;
  begin
    perform public.chorri_guardar_producto(jsonb_build_object('id', 'zz-e1', 'slug', 'zz-e1',
      'nombre', 't', 'codigo', 't', 'oem', 't', 'categoria_id', 'no-existe', 'compatibilidad', 't',
      'disponibilidad', 'Bajo pedido', 'garantia', 't'), '{}', true);
    raise exception 'FALLO: categoria inexistente aceptada';
  exception when foreign_key_violation then null; end;
  begin
    perform public.chorri_guardar_producto(jsonb_build_object('id', 'zz-e2', 'slug', 'zz-e2',
      'nombre', 't', 'codigo', 't', 'oem', 't', 'categoria_id', cat, 'compatibilidad', 't',
      'disponibilidad', 'Bajo pedido', 'garantia', 't'), array['marca-no-existe'], true);
    raise exception 'FALLO: marca inexistente aceptada';
  exception when foreign_key_violation then null; end;
  if exists (select 1 from public.chorri_productos where id in ('zz-e1', 'zz-e2'))
    then raise exception 'FALLO: quedo producto sin sus marcas (no atomico)'; end if;
  begin
    perform public.chorri_guardar_producto(jsonb_build_object('id', existente, 'slug', 'zz-dup',
      'nombre', 't', 'codigo', 't', 'oem', 't', 'categoria_id', cat, 'compatibilidad', 't',
      'disponibilidad', 'Bajo pedido', 'garantia', 't'), '{}', true);
    raise exception 'FALLO: id duplicado aceptado';
  exception when unique_violation then null; end;
  raise notice 'OK: atomicidad e integridad';
end $$;
rollback;
