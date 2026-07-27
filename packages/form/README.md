# @areia/form

Schema-driven, auto-generating form components for the Areia UI kit.

Inspired by Leva, but built on Standard Schema types and Areia's headless vanilla TS primitives.

## Features

- **Schema-first**: Works with any schema library compliant with [Standard Schema](https://standardschema.dev) (Zod, Valibot, ArkType, etc.).
- **Auto-generating**: Infers field types (text, number, boolean, select, color) from schema introspection or runtime values.
- **Headless core**: `createFormState` gives you an ilha-signal store decoupled from the DOM.
- **FloatingForm**: Leva-style floating control panel for procedural scenes and internal tools.
- **Framework-agnostic**: Register the returned island with [ilha `.define()`](https://ilha.build/guide/island/define/) and use it from React, Vue, Svelte, or plain HTML.

## Installation

```bash
bun add @areia/form
```

Peers: `areia`, `ilha`, `@areia/slots`.

## Usage

`Form` and `FloatingForm` are factories — they return an ilha island with the schema captured in closure:

```tsx
import { z } from "zod";
import { Form, FloatingForm } from "@areia/form";

const schema = z.object({
  name: z.string(),
  age: z.number().min(0).max(120),
  theme: z.enum(["light", "dark", "system"]),
  active: z.boolean(),
});

const MyForm = Form(
  schema,
  { name: "John", age: 30, theme: "system", active: true },
  { onSubmit: (values) => console.log(values) },
);

// Inside an ilha island:
// export default ilha.render(() => <MyForm />);

// Or as a custom element for any UI framework:
MyForm.define("areia-settings-form");
// <areia-settings-form></areia-settings-form>
```

Floating panel:

```tsx
const Controls = FloatingForm(
  schema,
  { name: "John", age: 30, theme: "system", active: true },
  { title: "Settings", onChange: (values) => updateScene(values) },
);

Controls.define("areia-scene-controls");
```

## Architecture

Part of the Areia monorepo. Bundled with `tsdown` (ESM + `.d.ts`) like the other packages.
