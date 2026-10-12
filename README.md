# RB Repuestos Chorry — Repuestos en General

Landing + catálogo cotizable por WhatsApp para el negocio **RB Repuestos Chorry** (Chorrillos, Lima).
Stack: **Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · TypeScript · Framer Motion**.

## Qué hace

- **Hero con buscador vehicular** (marca + sistema + texto/código OEM) que filtra el catálogo vía URL (`/?marca=Toyota&categoria=Frenos&q=48190#catalogo`). Los filtros son compartibles y con back-button.
- **Catálogo** con búsqueda tolerante a tildes, filtros por marca / categoría / disponibilidad y badges activos.
- **Cotizador**: lista de repuestos persistida en `localStorage` (solo `{id, qty}`, rehidratada desde el catálogo) que genera un mensaje de cotización formal por WhatsApp.
- **Ficha técnica** (quick view) por producto + consulta individual por WhatsApp.
- Secciones de confianza, taller/retiro en tienda, métricas, proceso, testimonios, FAQ y CTA.

## Empezar

```bash
npm install
cp .env.example .env.local   # completar número y URL reales
npm run dev                  # http://localhost:3000
```

```bash
npm run lint                 # ESLint
npm test                     # Vitest (29 tests de lib/ + carrito)
npx tsc --noEmit             # chequeo de tipos
```

## Configuración

| Variable | Dónde | Ejemplo |
|---|---|---|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `lib/config.ts` | `51934892800` (51 + 9 dígitos, sin `+`) |
| `NEXT_PUBLIC_SITE_URL` | `app/layout.tsx`, `robots.ts`, `sitemap.ts` | `https://repuestoschorry.pe` |

Datos del negocio (nombre, teléfono visible, dirección, horarios): `lib/config.ts`.
Catálogo y marcas: `data/products.ts`, `data/brands.ts`. Textos demo (métricas, pasos, testimonios, FAQs): `data/content.ts`.

> ⚠️ Antes de producción: reemplazar las fotos remotas de Unsplash por fotos reales,
> confirmar los conteos (“+1,200 repuestos”) y los testimonios con datos del negocio.

## Arquitectura

```
app/            layout (metadata + JSON-LD) · page (server) · robots · sitemap
components/     secciones servidor por defecto; islas cliente: Hero, Catalog,
                Navbar, FAQ, Metricas, WhatsAppFloat, QuoteDrawer,
                ProductQuickView + Reveal (animación) + MotionProvider
context/        QuoteContext (carrito {id, qty} validado con Zod)
lib/            config (env) · whatsapp (mensajes) · catalog-filters (URL + paginación) ·
                product-schema (Zod, fuente de verdad) · products (repositorio)
data/           products (origen estático actual) · brands · content
types/          product (Category, Availability, Product, CartItem)
```

**Convenciones:**

- Server Components por defecto. `"use client"` solo donde hay estado/eventos/Browser APIs.
- Filtros del catálogo viven en la URL (`lib/catalog-filters.ts`), no en eventos globales.
- Nunca se persiste el `Product` completo: el carrito guarda `{id, qty}` y rehidrata desde `PRODUCTS`.
- Enlaces de WhatsApp siempre vía `whatsappLink()` (nunca `wa.me` hardcodeado).
- Modales (`QuoteDrawer`, `ProductQuickView`) con `dynamic(ssr:false)`;
  `FAQ` y `WorkshopLocation` quedan en SSR por su valor SEO.

## Pendiente conocido (fuera del P0)

- Fotos reales de productos, paginación del catálogo, tests, CI de lint/tipos.
- 3 imágenes `Gemini_Generated_Image_*` en la raíz: elegir hero definitivo o eliminarlas.
