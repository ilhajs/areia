# Areia

Handcrafted UI for Ilha.

Areia is a practical, Tailwind-native UI kit for building Ilha apps faster without giving up ownership of your components. Start by importing ready-made components, then copy/eject the source later when your product needs deeper customization.

## Features

- **Import first, eject later:** ship quickly, then own the source when a component needs custom behavior.
- **Built for Ilha:** components, primitives, and docs follow Ilha conventions from the start.
- **Vanilla TypeScript core:** framework-light implementation you can read, change, and extend.
- **JSX or html literals:** use either authoring style in the same design system.
- **Tailwind-native styling:** theme with `--areia-*` tokens and Tailwind utilities instead of fighting generated CSS.

## Install

```bash
npm install areia
```

Or with your package manager of choice:

```bash
bun add areia
pnpm add areia
yarn add areia
```

Some components use optional peer packages. For example, install `sonner` when using the Sonner/Toaster component:

```bash
npm install sonner
```

## Quick start

```tsx
import ilha from "ilha";
import { Button } from "areia";

export default ilha.render(() => <Button variant="primary">Create project</Button>);
```

Areia also works with Ilha's html literal style:

```ts
import ilha, { html } from "ilha";
import { Button } from "areia";

export default ilha.render(
  () => html`
    <div class="flex gap-2">
      ${Button({ variant: "primary", children: "Save" })}
      ${Button({ variant: "secondary", children: "Cancel" })}
    </div>
  `,
);
```

## Styles and theming

Areia is handcrafted with Tailwind. First, install and configure Tailwind in your app, then load your app stylesheet in Ilha.

```css
@import "tailwindcss";
```

Components rely on `--areia-*` design tokens exposed to Tailwind via `@theme`. Define them in `:root`, override them in `.dark`, and customize token groups like surfaces, text, borders, focus rings, controls, and semantic colors.

```css
:root {
  --areia-background: #fff;
  --areia-foreground: oklch(21% 0.006 285.885);
  --areia-surface: #fff;
  --areia-surface-muted: oklch(97% 0 0);
  --areia-border: oklch(93.5% 0 0);
  --areia-ring: oklch(0.5772 0.2324 260);
  --areia-primary: oklch(0.5772 0.2324 260);
  --areia-primary-foreground: #fff;
}

@theme {
  --color-areia-background: var(--areia-background);
  --color-areia-foreground: var(--areia-foreground);
  --color-areia-surface: var(--areia-surface);
  --color-areia-surface-muted: var(--areia-surface-muted);
  --color-areia-border: var(--areia-border);
  --color-areia-ring: var(--areia-ring);
  --color-areia-primary: var(--areia-primary);
  --color-areia-primary-foreground: var(--areia-primary-foreground);
}
```

See `docs.css` for the complete token set used by the documentation site.

## What's included

Areia ships documented components and lower-level primitives for building product interfaces.

- **34 components:** Badge, Banner, Breadcrumbs, Button, Checkbox, Clipboard Text, Collapsible, Combobox, Context Menu, Date Picker, Dialog, Dropdown, Field, Hover Card, Icon, Input, Label, Layer Card, Link, Pagination, Popover, Progress, Radio, Resizable, Select, Slider, Sonner, Spinner, Switch, Table, Tabs, Textarea, Toggle, Tooltip.
- **23 primitives:** Accordion, Alert Dialog, Checkbox, Collapsible, Combobox, Command, Context Menu, Dialog, Dropdown Menu, Field, Hover Card, Navigation Menu, Popover, Progress, Radio Group, Resizable, Select, Slider, Switch, Tabs, Toggle, Toggle Group, Tooltip.

## Development

```bash
bun install
bun run docs:dev
bun run test
bun run build
```

## License

MIT
