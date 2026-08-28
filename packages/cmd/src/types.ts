import type { StandardJSONSchemaV1, StandardSchemaV1 } from "@standard-schema/spec";
import type { UIOverrides } from "@areia/form";
import type { RawHtml } from "ilha";

export type CommandExecutionContext = {
  source: "palette" | "webmcp";
  signal: AbortSignal;
};

export type WebMCPToolAnnotations = {
  readOnlyHint?: boolean;
  untrustedContentHint?: boolean;
};

export type WebMCPExposure = {
  /** Describe the operation and its side effects for an agent. */
  description: string;
  annotations?: WebMCPToolAnnotations;
};

export type CommandBase = {
  /** Stable selection value and WebMCP tool name. */
  id: string;
  label: string;
  description?: string;
  group?: string;
  keywords?: readonly string[];
  shortcut?: string;
  /** Raw HTML or a JSX child rendered before the label. */
  icon?: RawHtml | string;
  disabled?: boolean;

  /** Omitted commands remain private to the human-facing palette. */
  webmcp?: WebMCPExposure;
};

export type ActionCommand = CommandBase & {
  run(context: CommandExecutionContext): unknown | Promise<unknown>;
  href?: never;
};

export type LinkCommand = CommandBase & {
  href: string;
  /** Open in a new tab with `rel="noopener noreferrer"` instead of same-tab navigation. */
  external?: boolean;
  run?: never;
};

export type PaletteCommand = ActionCommand | LinkCommand;

/** A schema that validates object input and exposes JSON Schema for agent discovery. */
export type CommandInputSchema<
  Input = unknown,
  Output extends Record<string, unknown> = Record<string, unknown>,
> = StandardSchemaV1<Input, Output> & StandardJSONSchemaV1<Input, Output>;

/** A command that collects validated input from either a human or an agent. */
export type InputCommand<Schema extends CommandInputSchema = CommandInputSchema> = CommandBase & {
  input: Schema;
  defaultValues?: StandardSchemaV1.InferOutput<Schema>;
  uiOverrides?: UIOverrides;
  submitLabel?: string;
  run(
    input: StandardSchemaV1.InferOutput<Schema>,
    context: CommandExecutionContext,
  ): unknown | Promise<unknown>;
  href?: never;
};

export type CommandItem = PaletteCommand | InputCommand;

export type CommandPaletteOptions = {
  /** Accessible name for the dialog and command input. */
  label?: string;
  placeholder?: string;
  empty?: string;
  /**
   * Content for a click-to-open trigger rendered as `[data-slot="dialog-trigger"]`.
   * Use it together with `hotkey: false` when you open the palette from your own UI.
   */
  trigger?: RawHtml;
  /** Cmd+K or Ctrl+K. Enabled by default. */
  hotkey?: "mod+k" | false;
  /** Wrap command selection from the last item to the first. */
  loop?: boolean;
};
