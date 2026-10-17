# Skill Registry

**Solo para delegadores.** Quien lanza sub-agentes lee este registro, resuelve las reglas compactas e inyecta el texto en el prompt del sub-agente. Los sub-agentes NO leen este registro ni los SKILL.md.

Proyecto: repuestoschorri (Next.js 16 / React 19 / Tailwind 4 / Zod 4 / Supabase). Generado: 2026-10-17.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| Next.js: routing, Server Actions, data fetching | nextjs-15 | C:\Users\omarp_v5mqor0\.claude\skills\nextjs-15\SKILL.md |
| Escribir componentes React | react-19 | C:\Users\omarp_v5mqor0\.claude\skills\react-19\SKILL.md |
| Estilos con Tailwind | tailwind-4 | C:\Users\omarp_v5mqor0\.claude\skills\tailwind-4\SKILL.md |
| Escribir TypeScript: tipos, interfaces, generics | typescript | C:\Users\omarp_v5mqor0\.claude\skills\typescript\SKILL.md |
| Validacion con Zod | zod-4 | C:\Users\omarp_v5mqor0\.claude\skills\zod-4\SKILL.md |
| UI accesible, shadcn/ui, layouts responsive, dark mode | ui-styling | C:\Users\omarp_v5mqor0\.claude\skills\ui-styling\SKILL.md |
| Diseno UI/UX (paletas, tipografia, landing, e-commerce) | ui-ux-pro-max | C:\Users\omarp_v5mqor0\.claude\skills\ui-ux-pro-max\SKILL.md |
| Crear PR | branch-pr, github-pr | C:\Users\omarp_v5mqor0\.claude\skills\branch-pr\SKILL.md ; C:\Users\omarp_v5mqor0\.claude\skills\github-pr\SKILL.md |
| Crear issue | issue-creation | C:\Users\omarp_v5mqor0\.claude\skills\issue-creation\SKILL.md |
| "judgment day", review adversarial | judgment-day | C:\Users\omarp_v5mqor0\.claude\skills\judgment-day\SKILL.md |
| Crear nuevas skills | skill-creator | C:\Users\omarp_v5mqor0\.claude\skills\skill-creator\SKILL.md |
| Tests en Go / Bubbletea (NO aplica a este proyecto) | go-testing | C:\Users\omarp_v5mqor0\.claude\skills\go-testing\SKILL.md |
| Banners, marca, identidad, slides, design system (no centrales) | banner-design, brand, design, design-system, slides | C:\Users\omarp_v5mqor0\.claude\skills\<nombre>\SKILL.md |
| Verificar paginas en navegador headless | browser-automation | C:\Users\omarp_v5mqor0\.claude\skills\browser-automation\SKILL.md |

## Compact Rules

### nextjs-15 (el proyecto usa Next 16.4: PRIORIDAD a node_modules/next/dist/docs/)
- Antes de escribir codigo leer la guia relevante en node_modules/next/dist/docs/ (AGENTS.md): las APIs cambiaron respecto a Next 15.
- next.config.ts usa cacheComponents y partialPrefetching: respetar sus reglas de cache/Suspense.
- Server Components por defecto; fetch en paralelo con Promise.all; streaming con Suspense.
- Server Actions con "use server"; revalidatePath/redirect tras mutar.
- `import "server-only"` en modulos con secretos; los componentes con ssr:false deben vivir en un Client Component.
- Metadata via export metadata / generateMetadata.

### react-19
- Sin useMemo/useCallback manuales (React Compiler).
- Imports nombrados de "react"; nunca `import React`.
- Server Components por defecto; "use client" solo para estado, efectos, eventos, APIs de navegador.
- ref es prop normal (sin forwardRef); use() para promesas/contexto; useActionState para formularios.

### tailwind-4
- Nunca var() ni colores hex en className; usar clases semanticas/de paleta.
- cn() (clsx + twMerge) solo para clases condicionales o mezcla; no para clases estaticas.
- Valores dinamicos via style={{}}; var() solo en constantes para librerias sin className.

### typescript
- Patron const object + `as const` y derivar el tipo (no uniones literales directas).
- Interfaces planas (un nivel); objetos anidados en interfaz propia.
- Nunca `any`: unknown + type guards o generics.
- `import type` para tipos.

### zod-4
- Validadores top-level: z.email(), z.uuid(), z.url(); no z.string().email().
- Mensajes con `{ error: "..." }` (no required_error); z.string().min(1) en vez de nonempty().
- safeParse para entradas externas; z.infer para tipos; z.record(z.string(), valor) con dos argumentos.
- Codigo existente: lib/product-schema.ts.

### ui-styling
- Tailwind mobile-first; componentes accesibles (roles, foco, contraste); dark mode via tokens.
- shadcn/ui NO esta instalado en el proyecto: no asumir @/components/ui/*.

### ui-ux-pro-max
- Usar para decisiones de diseno (paleta, tipografia, jerarquia); cumplir accesibilidad y responsive; respetar la identidad actual (logo nuevo, navbar claro).

### branch-pr / github-pr / issue-creation
- Conventional commits en espanol; sin atribucion de IA; PR enlazado a issue; NO hacer push/commit salvo que el usuario lo pida.

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| AGENTS.md | D:\tempo\claudecode\repuestoschorri\AGENTS.md | Next.js con cambios incompatibles: leer node_modules/next/dist/docs/ antes de codificar |
| README.md | D:\tempo\claudecode\repuestoschorri\README.md | Info general |
| openspec/config.yaml | D:\tempo\claudecode\repuestoschorri\openspec\config.yaml | Contexto SDD, testing y reglas por fase |

Reglas globales del usuario: nunca ejecutar build; sin Co-Authored-By/atribucion IA; responder en el idioma del usuario.
