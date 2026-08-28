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
pnpm add areia
yarn add areia
```

Some components use optional peer packages. For example, install `sonner` when using the Sonner/Toaster component:

```bash
npm install sonner
```

Command palettes ship as `@areia/cmd`:

```bash
npm install @areia/cmd
```

## Quick start

```tsx
import { ilha } from "ilha";
import { Button } from "areia";

export default ilha(() => <Button variant="primary">Create project</Button>);
```

Areia also works with Ilha's html literal style:

```ts
import { ilha, html } from "ilha";
import { Button } from "areia";

export default ilha(
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
@plugin "areia";
```

The `@plugin "areia"` directive registers design tokens (`--areia-*` in `:root` and `.dark`), utility mappings (`bg-areia-background`, `text-areia-subtle`, etc.), a `dark:` variant, and automatically scans Areia's built components in `node_modules` for class names. You can also use `@import "areia/tailwind.css"` as a one-line equivalent. Override tokens in your own CSS after the plugin when you need custom branding.

## What's included

Areia ships documented components and lower-level primitives for building product interfaces.

- **34 components:** Badge, Banner, Breadcrumbs, Button, Checkbox, Clipboard Text, Collapsible, Combobox, Context Menu, Date Picker, Dialog, Dropdown, Field, Hover Card, Icon, Input, Label, Layer Card, Link, Pagination, Popover, Progress, Radio, Resizable, Select, Slider, Sonner, Spinner, Switch, Table, Tabs, Textarea, Toggle, Tooltip.
- **23 primitives:** Accordion, Alert Dialog, Checkbox, Collapsible, Combobox, Command, Context Menu, Dialog, Dropdown Menu, Field, Hover Card, Navigation Menu, Popover, Progress, Radio Group, Resizable, Select, Slider, Switch, Tabs, Toggle, Toggle Group, Tooltip.

## Changelog notes

- **Resizable + ilha:** Panel/root/handle markup stamps `data-morph-preserve="style"` by default so dragged sizes survive parent island morphs. Missing sibling `defaultSize` values are filled from remaining % space in the group template.
- **Morph-safe controllers:** Layout/position widgets (Slider, Progress, Tabs, Resizable, Combobox, Dropdown, Dialog, Popover, Hover Card, Tooltip, Context Menu, Collapsible/Accordion, Autocomplete) stamp `style` via `MORPH_CONTROLLER_STYLE`. Shared preserve list also covers value/ARIA attrs (`data-value`, `aria-valuenow`, `data-highlighted`, …). DatePicker stamps the shared attr set.

## Development

```bash
npm install
npm run docs:dev
npm test
npm run build
```

## License

MIT
