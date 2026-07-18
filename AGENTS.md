# areia monorepo

Bun workspace with two publishable packages and a docs site:

- `packages/slots` (`@areia/slots`) — headless primitives. Must be **built** (`bun run build`) before anything that imports it works: its `exports` point at `dist/`, and `packages/areia` resolves it through the workspace symlink.
- `packages/areia` (`areia`) — the styled component library, built on `ilha` + Tailwind and `@areia/slots`.
- `apps/website` (`@areia/website`) — Imprensa + Vite documentation site (MDX under `src/pages/(content)`).

## Setup

```sh
bun install
bun run build   # required once after install — builds slots/areia dist/ that the website and tests need
```

## Checks

- `bun run test` (root) or `bun test` inside a package — bun test with happy-dom.
- `bunx tsc --noEmit` inside a package for typecheck; `bun run build` runs `tsc && tsdown` per package in dependency order.
- `bun run lint` — oxlint; `bun run fmt` — oxfmt.
- `bun run docs:dev` / `bun run docs:build` — website (Imprensa). Build packages first.

CI (`.github/workflows/ci.yml`) runs build + test on pushes to main and PRs; publish/docs only on main.
