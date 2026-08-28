# @areia/cmd

Command palette island for Areia applications.

Declare actions, links, and schema-driven input commands once. People open the palette from a trigger or `Cmd+K` / `Ctrl+K`. Selected input commands open a generated Areia form. Opt-in `webmcp` registers the same `run` callback as a WebMCP tool in the current page.

## Installation

```bash
npm install @areia/cmd
```

Peers for the default entry: `areia`, `ilha`, `@areia/slots`, `@areia/form`. Install `@standard-schema/spec` when you declare input commands; your schema library implements it.

## Standalone bundle

Use this when you do not want to install Ilha, Areia, `@areia/form`, or Tailwind. The bundle includes those runtimes and ships compiled CSS.

```bash
npm install @areia/cmd
```

```tsx
import "@areia/cmd/standalone.css";
import { CommandPalette, html, ilha } from "@areia/cmd/standalone";

const AppCommands = CommandPalette(
  [
    {
      id: "refresh_dashboard",
      label: "Refresh dashboard",
      run: ({ signal }) => refreshDashboard({ signal }),
    },
  ],
  {
    hotkey: false,
    trigger: html`<button type="button">Open commands</button>`,
  },
);

export default ilha(() => <AppCommands />);
```

Do not mix `@areia/cmd` and `@areia/cmd/standalone` in the same page — you would load two copies of Ilha.

## Usage

```tsx
import { html, ilha } from "ilha";
import { CommandPalette } from "@areia/cmd";

const AppCommands = CommandPalette(
  [
    {
      id: "refresh_dashboard",
      label: "Refresh dashboard",
      run: ({ signal }) => refreshDashboard({ signal }),
    },
    {
      id: "open_billing",
      label: "Open billing settings",
      href: "/settings/billing",
    },
  ],
  {
    hotkey: false,
    trigger: html`<button type="button">Open commands</button>`,
  },
);

export default ilha(() => <AppCommands />);
```

Docs: [CommandPalette](https://areia.ilha.build/components/command-palette).

## Architecture

Part of the Areia monorepo. Bundled with `tsdown` (ESM + `.d.ts`) like the other packages.
