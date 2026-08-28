# `@areia/cmd` design decisions

Status: Current (site guide: `apps/website/docs/components/command-palette.mdx`)

## Summary

`@areia/cmd` provides a command-palette island for Areia applications. A developer declares actions, links, and schema-driven input commands, then renders the returned ilha island. People invoke commands through the palette; input commands open a second-step Areia form. Explicitly exposed commands register the same operation with WebMCP in the current page and signed-in session.

The package composes existing code instead of creating another command engine:

- `@areia/slots/command` owns filtering, ranking, selection, keyboard navigation, DOM mutation handling, and ARIA state.
- `@areia/slots/dialog` owns dialog behavior, trigger wiring, and portal lifecycle.
- `areia` supplies styled static dialog/input markup and design tokens.
- `ilha` owns hydration, effects, and cleanup.

## Public API

`src/index.ts` exports exactly:

```ts
export { CommandPalette } from "./CommandPalette.tsx";
export { CommandPaletteBase } from "./CommandPaletteBase.tsx";
export type {
  ActionCommand,
  CommandInputSchema,
  CommandBase,
  CommandExecutionContext,
  CommandItem,
  CommandPaletteOptions,
  InputCommand,
  LinkCommand,
  PaletteCommand,
  WebMCPExposure,
  WebMCPToolAnnotations,
} from "./types.ts";
```

- `CommandPalette` — the styled island factory.
- `CommandPaletteBase` — the same commands, options, controller wiring, hotkey, trigger, and WebMCP exposure with bare, unstyled slot markup.
- `buildBlocks` and `createPalette` are internal module helpers in `CommandPaletteBase.tsx`; they are not part of the public API.
- Do not add aliases, builders such as `defineCommand`, or public rendering helpers.

The factories capture command descriptors and callbacks in their closure and never serialize them through `data-ilha-props`. The returned island retains normal ilha capabilities, including `.define()`.

### Types

```ts
export type CommandExecutionContext = {
  source: "palette" | "webmcp";
  signal: AbortSignal;
};

export type CommandBase = {
  id: string; // stable selection value and default WebMCP tool name
  label: string;
  description?: string;
  group?: string;
  keywords?: readonly string[];
  shortcut?: string; // display text only; no per-command hotkeys
  icon?: unknown; // any raw/JSX child
  disabled?: boolean;
  webmcp?: WebMCPExposure; // omitted commands stay private to the palette
};

export type ActionCommand = CommandBase & {
  run(context: CommandExecutionContext): unknown | Promise<unknown>;
  href?: never;
};

export type LinkCommand = CommandBase & {
  href: string;
  external?: boolean; // new tab with rel="noopener noreferrer"
  run?: never;
};

export type CommandInputSchema<
  Input = unknown,
  Output extends Record<string, unknown> = Record<string, unknown>,
> = StandardSchemaV1<Input, Output> & StandardJSONSchemaV1<Input, Output>;

export type InputCommand<Schema extends CommandInputSchema> = CommandBase & {
  input: Schema;
  defaultValues?: StandardSchemaV1.InferOutput<Schema>;
  uiOverrides?: UIOverrides;
  submitLabel?: string;
  webmcp?: WebMCPExposure;
  run(
    input: StandardSchemaV1.InferOutput<Schema>,
    context: CommandExecutionContext,
  ): unknown | Promise<unknown>;
  href?: never;
};

export type CommandItem = PaletteCommand | InputCommand;

export type CommandPaletteOptions = {
  label?: string; // accessible name for dialog and input
  placeholder?: string;
  empty?: string;
  trigger?: RawHtml; // click-to-open trigger, rendered as [data-slot="dialog-trigger"]
  hotkey?: "mod+k" | false; // Cmd+K or Ctrl+K, enabled by default
  loop?: boolean;
};
```

## Descriptor rules

1. `commands` is static for the lifetime of the factory.
2. Every command requires a non-empty, unique `id`.
3. `id` is both the command primitive value and the default WebMCP tool name; use stable snake_case names for WebMCP.
4. Every command has exactly one execution mode: `run` or `href`. The factory throws synchronously for duplicate IDs, empty IDs, or invalid action/link shapes.
5. Groups preserve the order of their first command; commands preserve authored order inside each group. Commands without `group` render without a heading.
6. Disabled commands render disabled, cannot execute from the palette, and do not register as WebMCP tools.
7. Input commands implement both Standard Schema validation and Standard JSON Schema conversion. They render in the palette, open a generated `@areia/form` step for people, and register the same operation with WebMCP.

## Runtime behavior

- All selection routes through one internal executor shared by palette and WebMCP calls; the source is `"palette"` or `"webmcp"` and each call carries its own `AbortSignal`.
- Palette selection closes the dialog before execution. The application owns progress, success, and failure presentation. Rejected palette actions surface through platform error reporting; WebMCP execution rejects with the original failure.
- The dialog controller owns Escape, outside-click handling, focus management, scroll locking, portal mounting, restoration, and trigger wiring. The package never reimplements controller behavior.
- Opening comes from the hotkey (`metaKey` or `ctrlKey` + `k`), the optional `[data-slot="dialog-trigger"]` click, or a scoped `command-palette:open` / `command-palette:toggle` event on the dialog root. `command-palette:close` closes it. Do not bind the hotkey when `hotkey` is `false`.
- The SSR template must not contain reactive open binds; open state stays on the imperative controller path.
- If required markup is missing, fail with a concise package error naming the missing slot. Never include serialized props, callback values, or user data in errors.
- Cleanup destroys both primitive controllers, removes the hotkey listener, and aborts WebMCP registrations.

## WebMCP behavior

- Progressive enhancement: when `document.modelContext` is unavailable, the palette works fully — nothing throws, warns, or polyfills. Do not touch `document` during SSR.
- Each enabled command with `webmcp` registers one imperative zero-argument tool named after `command.id`. Agent tools register with their converted draft-2020-12 input JSON Schema.
- Input command data is validated through Standard Schema before `run` for both people and agents; validation failure does not execute the operation. The validated output is passed to `run`.
- The action's return value becomes the tool result. If it returns `undefined`, return `{ ok: true, command: command.id }` after success.
- One `AbortController` owns all registrations for a mounted palette; abort it during cleanup. WebMCP execution supplies its own signal to `run`; never replace it with the registration signal.
- Duplicate tool names across independently mounted palettes may be rejected by the browser; report registration failures without breaking the palette.

### Security requirements

- Treat `webmcp` as an exposure boundary, not presentation metadata.
- Preserve the application's existing authentication, authorization, validation, and audit paths inside `run`. Do not add an agent-only implementation that bypasses the human UI's domain function.
- Agent-facing descriptions must state consequential side effects.
- `readOnlyHint` and `untrustedContentHint` are hints, not security controls.
- Never expose a disabled command; never infer or serialize hidden application state into a tool description or result.
- Never log execution inputs, results, user data, or the full command descriptor.

## Accessibility

- Provide an accessible label to the dialog and command input.
- Preserve the command primitive's combobox/listbox relationships and active-descendant state.
- Keep disabled commands non-interactive, icons decorative, and descriptions out of shortcut text.
- Focus the input on open; the dialog controller restores focus on close, including to the trigger when present.
- Support keyboard-only selection and Escape closing.

## Acceptance criteria

- `@areia/cmd` builds and exports the specified API from `dist/`.
- A consumer can define and render an action/link palette with one factory call.
- Cmd+K or Ctrl+K open the palette, and command interaction comes from the existing slot primitives.
- Palette and WebMCP invocation call the same `run` function.
- Only explicit, enabled WebMCP commands and agent tools register; unsupported browsers retain the full human-facing palette.
- Input commands open an Areia form for people. With `webmcp`, they also expose JSON Schema to agents. Both paths use the same validated `run` callback.
- Cleanup removes listeners, controllers, and WebMCP registrations; portaled items are not duplicated across morphs.
- Package tests, repository checks, and documentation build pass.
