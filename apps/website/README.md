# Areia website

Documentation site for [Areia](https://github.com/ilhajs/areia), built with [Imprensa](https://imprensa.ilha.build), [Ilha](https://ilha.build), and Vite.

## Develop

From the monorepo root (after `bun install` and `bun run build` for packages):

```bash
bun run --filter @areia/website dev
# or
cd apps/website && bun dev
```

Open http://localhost:5173.

## Build

```bash
bun run --filter @areia/website build
```

Output is in `apps/website/dist/` (static HTML + assets + `llms.txt`).

## Content

MDX lives under `src/pages/(content)/`:

- `components/*.mdx` → `/components/...` (start at `/components/getting-started`)
- `primitives/*.mdx` → `/primitives/...`
