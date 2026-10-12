-- =============================================================================
-- Seed inicial de productos REALES.
-- Origen: repuestosallende (ra_catalogo_repuestos, catalogo Mercedes-Benz Sprinter).
-- Los precios son de REFERENCIA para poder probar el repo (Supabase no los trae).
-- =============================================================================

-- Categorías necesarias (subset del catálogo de Chorry).
insert into chorri_categorias (id, nombre, orden) values
  ('suspension', 'Suspensión', 2),
  ('motor',      'Motor',      3)
on conflict (id) do nothing;

-- Marcas necesarias.
insert into chorri_marcas (id, nombre) values
  ('mercedes-benz', 'Mercedes-Benz')
on conflict (id) do nothing;

-- Productos.
insert into chorri_productos
  (id, slug, nombre, codigo, oem, categoria_id, compatibilidad, disponibilidad,
   imagen, precio, moneda, precio_nota, garantia, especificaciones, descripcion)
values
  (
    'amortiguador-delantero',
    'amortiguador-delantero-sprinter',
    'Amortiguador Delantero',
    'MB-AM-001',
    'A9063200230',
    'suspension',
    'Mercedes-Benz Sprinter 313/413/515/516',
    'En stock inmediato',
    'https://pub-ffd42694eda64a2f8f58d0f4b85d68be.r2.dev/AmortiguadorDelantero.png',
    210.00,
    'PEN',
    null,
    '12 meses',
    '[{"label":"Posición","value":"Eje delantero"},{"label":"Tipo","value":"Gas de doble tubo"}]'::jsonb,
    'Amortiguador de gas de doble tubo para eje delantero. Mejora la estabilidad y el confort de conducción en ruta y ciudad.'
  ),
  (
    'rotula-inferior-suspension',
    'rotula-inferior-suspension-sprinter',
    'Rótula Inferior de Suspensión',
    'MB-RT-002',
    'A9063330027',
    'suspension',
    'Mercedes-Benz Sprinter 313/413/515/516',
    'Envío hoy',
    null,
    72.00,
    'PEN',
    null,
    '12 meses',
    '[{"label":"Posición","value":"Trapecio inferior delantero"},{"label":"Material","value":"Acero forjado con fuelle"}]'::jsonb,
    'Rótula de suspensión inferior delantera. Permite el movimiento articulado entre el muñón y el triángulo de suspensión.'
  ),
  (
    'bomba-agua-mercedes',
    'bomba-agua-mercedes-sprinter',
    'Bomba de Agua',
    'MB-BA-003',
    'A6512000201',
    'motor',
    'Mercedes-Benz Sprinter 315/415/515/516',
    'Bajo pedido',
    null,
    210.00,
    'PEN',
    null,
    '12 meses',
    '[{"label":"Impulsor","value":"Acero inoxidable"},{"label":"Caudal","value":"110 L/min"}]'::jsonb,
    'Bomba de agua con impulsor de acero inoxidable. Caudal 110 L/min. Incluye junta de montaje.'
  )
on conflict (id) do nothing;

-- Relación N:M producto <-> marca.
insert into chorri_producto_marcas (producto_id, marca_id) values
  ('amortiguador-delantero',      'mercedes-benz'),
  ('rotula-inferior-suspension',  'mercedes-benz'),
  ('bomba-agua-mercedes',         'mercedes-benz')
on conflict do nothing;
