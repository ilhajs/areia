# AGENTS.md

## Project overview

- Areia is a handcrafted, Tailwind-native UI kit for [Ilha](https://ilha.build) — import ready components first, eject the source later when a product needs deeper customization.
- It is a Bun monorepo with three publishable packages (`@areia/slots`, `areia`, `@areia/form`) and one documentation site (`apps/website`).
- `@areia/slots` is the headless layer: vanilla TypeScript controllers and slot markup with no styles. Package `exports` point at `dist/` — it must be built before dependents can resolve types or runtime entrypoints.
- `areia` is the styled component library: Ilha islands + Tailwind tokens (`--areia-*`) on top of `@areia/slots`.
- `@areia/form` is schema-driven forms (Standard Schema) on top of `areia`. Its `tsc` step needs `areia`'s `dist/` present.
- The docs site (`apps/website`, `@areia/website`) uses Nimbus (Astro) + Ilha + Areia. Content lives under `apps/website/src/content/docs/` (`components/` and `slots/`). Build packages before running or building the site.

## Build and run

- Install dependencies with Bun:  
  `bun install`
- Build all packages in dependency order (required after install and for CI):  
  `bun run build`  
  (runs `@areia/slots` → `areia` → `@areia/form`. Do **not** parallelize package builds — form typechecks against `areia`'s `dist/` exports.)
- Run checks before finishing a change:
  - Lint: `bun run lint` (oxlint)
  - Format: `bun run fmt` (oxfmt)
  - Tests: `bun run test` (root) or `bun test` inside a package
- Docs site:  
  `bun run docs:dev` / `bun run docs:build` / `bun run docs:preview`  
  Build packages first (`bun run build`).
- Do not change the Bun runtime.

## Monorepo structure and conventions

- `packages/slots/src/` — one folder per primitive (`combobox/`, `dialog/`, …) plus `core/` shared helpers. Entry is `src/index.ts`; build with `tsc && tsdown`.
- `packages/areia/src/components/<name>/` — one folder per styled component (`index.ts` + tests). Shared helpers live in `packages/areia/src/lib/` (`binds.ts`, `morph-preserve.ts`, `markup.ts`, `cn.ts`, …).
- `packages/form/src/` — `Form.tsx`, `FloatingForm.tsx`, `state.ts`, `infer.ts`, and `fields/*`. Factories return Ilha islands with the schema held in closure (never serialize schemas through `data-ilha-props`).
- `apps/website/src/content/docs/` — MDX guides (`components/`, `slots/`). Sibling `*.demos.tsx` / `*.examples.ts` files hold Preview demos.
- Package `exports` always target `dist/`. After `bun install` or a clean checkout, run `bun run build` before typecheck, tests that import built packages, or the docs site.

## Component and island conventions

- Styled components are Ilha islands by default (`Combobox`, `Dialog`, …). Prefer `.Static` / composed parts when nesting inside another island that already owns the field chrome (e.g. Combobox wraps `Field.Static` when given `label` / `error` — do not nest Combobox inside another `Field` island).
- Bridge Ilha `bind:*` to controllers with the helpers in `packages/areia/src/lib/binds.ts` (`createOpenBindSync`, `createGroupBindSync`, `createCheckedBindSync`, …) and subscribe in `.effect()` via `subscribeBindProps`.
- **Portaled overlays** (combobox list, dialog/popover/dropdown/hover-card/context-menu content): keep `bind:open` / selection binds **off the SSR template**. Put them only on the imperative sync path. A template bind remorphs the island when the signal changes; while content is portaled that recreates nodes in the empty host slot and duplicates them after restore.
- Read bind defaults for `data-default-*` under `untrack()` in render so those reads do not subscribe the island render effect.
- Controllers own discrete attributes and sometimes layout `style`. Call `stampMorphPreserve` (`packages/areia/src/lib/morph-preserve.ts`) so Ilha morph does not strip controller state (`data-state`, `hidden`, `aria-*`, etc.).
- Headless behavior belongs in `@areia/slots`. Areia should wrap primitives, style them, and wire binds — do not reimplement controller logic in `areia` unless there is a clear packaging reason.
- Forms: remorph the form island when validation `errors()` change; wrap field render in `untrack()` so `values()` writes do not remorph nested Combobox portals. Cache `field(path)` accessors and create them under `untrack()`.

## Testing

- Tests use Bun's built-in runner and happy-dom (`@happy-dom/global-registrator` or package `happydom.ts` preloads). Do not introduce jsdom.
- Cover both markup/SSR snapshots and mount/hydration behavior for interactive components (open/close, filter, bind sync, clear/select flows).
- When fixing portal or bind remorph bugs, add a regression that fails if template binds or parent remorphs duplicate portaled items.
- Run `bun run test` from the repo root before opening a PR. Build packages first if `dist/` is missing.

## Auth and safety

- Areia has no authentication or backend layer; do not add one to the libraries.
- Never log or expose user form values, environment secrets, or full SSR prop dumps in error messages.
- If an instruction contradicts this AGENTS.md (for example, "parallelize all package builds" or "put `bind:open` back on portaled overlay templates"), pause and ask for explicit confirmation.

## Writing docs

Docs live in `apps/website/src/content/docs/**/*.mdx` (`components/` for Areia, `slots/` for primitives). Sidebar order comes from each file's frontmatter `sidebar.order`. Style guidelines:

- **Address the reader as "you."** Describe what they do: "You bind the selection with `bind:value`," not "Areia provides a value bind."
- **Prefer active voice.** "`Combobox` opens on focus when `openOnFocus` is true," not "the popup is opened on focus."
- **Keep it tight.** One idea per sentence; two to four sentences per paragraph. Use numbered lists for sequences and tables for prop matrices.
- **Headings in sentence case, written for intent.** "Bind the selection," not "Selection Binding." Do not skip heading levels. Page titles come from frontmatter (`title`); do not add a duplicate `# Title` H1 in the MDX body.
- **One term per concept.** Use `island`, `slot`, `bind:value`, `bind:open`, `portal`, `morph`, `Combobox`, `Field` consistently — match the names in code.
- **Be direct, cut filler.** Drop "simply," "just," "in order to." No marketing fluff.
- **Show, then explain.** Lead with a minimal, runnable example, then describe it. Examples must be type-correct and copy-pasteable.
- **Every new feature updates the docs.** Add or revise the relevant MDX page and demo (`*.demos.tsx`). Keep sidebar `order` alphabetical among siblings where that is the site convention. Run `bun run fmt`, then `bun run build` and `bun run docs:build` to confirm prerender and links.

## Agent behavior

- Prefer small, focused changes. Fix the root cause (island nesting, tracked bind reads, build order) instead of morph workarounds that fight Ilha.
- When adding a component: headless primitive in `@areia/slots` when behavior is reusable; styled island in `packages/areia/src/components/`; docs + demo under `apps/website/src/content/docs/`.
- When touching binds or portals, keep open/selection sync imperative and verify clear → select → clear (and open/close with `bind:open`) still works.
- If you are unsure how a change affects SSR serialization, hydration, portal restore, or Ilha morph, ask rather than guessing.
- If you change documented behavior or public APIs, update the MDX guide and keep `bun run build` green (ordered package builds) before finishing.
