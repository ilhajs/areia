import { effect, html, ilha, raw } from "ilha";
import { Command as CommandPrimitive, Dialog as DialogPrimitive } from "@areia/slots";
import { Dialog, MORPH_CONTROLLER_STYLE, stampMorphPreserve } from "areia";
import { Form } from "@areia/form";
import type { RawHtml } from "ilha";
import type { CommandItem, CommandPaletteOptions, InputCommand, PaletteCommand } from "./types.ts";

type ModelContextLike = {
  registerTool(tool: unknown, options?: { signal?: AbortSignal }): Promise<void>;
};

const PACKAGE_ERROR = "[@areia/cmd]";

export type VisibleCommand = PaletteCommand | InputCommand;
export type InputForm = { command: InputCommand; content: unknown };

function isInputCommand(item: CommandItem): item is InputCommand {
  return "input" in item;
}

function assertCommands(commands: readonly CommandItem[]): void {
  const seen = new Set<string>();
  for (const command of commands) {
    if (typeof command?.id !== "string" || command.id.trim() === "") {
      throw new Error(`${PACKAGE_ERROR} Every command requires a non-empty id.`);
    }
    if (seen.has(command.id)) {
      throw new Error(`${PACKAGE_ERROR} Duplicate command id "${command.id}".`);
    }
    seen.add(command.id);

    if (isInputCommand(command)) {
      const standard = command.input?.["~standard"];
      if (
        typeof command.run !== "function" ||
        typeof standard?.validate !== "function" ||
        typeof standard?.jsonSchema?.input !== "function"
      ) {
        throw new Error(
          `${PACKAGE_ERROR} Input command "${command.id}" requires a Standard Schema input.`,
        );
      }
      continue;
    }

    const hasRun = typeof command.run === "function";
    const hasHref = typeof command.href === "string" && command.href.length > 0;
    if (hasRun === hasHref) {
      throw new Error(
        `${PACKAGE_ERROR} Command "${command.id}" must define exactly one of run or href.`,
      );
    }
  }
}

/** Single execution path shared by palette selection and WebMCP tool calls. */
async function executeCommand(
  command: PaletteCommand,
  source: "palette" | "webmcp",
  signal: AbortSignal,
): Promise<unknown> {
  if (command.disabled) {
    throw new Error(`${PACKAGE_ERROR} Command "${command.id}" is disabled.`);
  }
  if (typeof command.run === "function") {
    return command.run({ source, signal });
  }
  if (command.external) {
    // "noopener,noreferrer" features keep the new tab from touching this page.
    window.open(command.href, "_blank", "noopener,noreferrer");
  } else {
    window.location.assign(command.href);
  }
  return { ok: true, command: command.id, href: command.href };
}

function registerWebMcpTools(commands: readonly CommandItem[], signal: AbortSignal): void {
  const modelContext = (document as Document & { modelContext?: ModelContextLike }).modelContext;
  if (typeof modelContext?.registerTool !== "function") return;

  for (const command of commands) {
    if (command.disabled) continue;

    const inputCommand = isInputCommand(command);
    if (!command.webmcp) continue;
    const inputSchema = inputCommand
      ? command.input["~standard"].jsonSchema.input({ target: "draft-2020-12" })
      : { type: "object", properties: {}, additionalProperties: false };

    // Floating promise: registration failures surface through platform error
    // reporting without breaking the human-facing palette.
    void modelContext.registerTool(
      {
        name: command.id,
        title: command.label,
        description: command.webmcp.description,
        inputSchema,
        annotations: command.webmcp.annotations,
        execute: async (input: unknown, { signal: runSignal }: { signal: AbortSignal }) => {
          const result = inputCommand
            ? await executeInputCommand(command, input, "webmcp", runSignal)
            : await executeCommand(command, "webmcp", runSignal);
          return result === undefined ? { ok: true, command: command.id } : result;
        },
      },
      { signal },
    );
  }
}

async function executeInputCommand(
  command: InputCommand,
  input: unknown,
  source: "palette" | "webmcp",
  signal: AbortSignal,
): Promise<unknown> {
  const result = await command.input["~standard"].validate(input);
  if (result.issues) {
    throw new Error(
      `${PACKAGE_ERROR} Invalid input for command "${command.id}": ${result.issues
        .map((issue) => issue.message)
        .join("; ")}`,
    );
  }
  return command.run(result.value, { source, signal });
}

type PaletteBlock =
  | { kind: "item"; command: VisibleCommand }
  | { kind: "group"; name: string; commands: VisibleCommand[] };

/**
 * Internal module helper — groups preserve the order of their first command;
 * commands keep authored order. Not part of the package public API.
 */
export function buildBlocks(commands: readonly VisibleCommand[]): PaletteBlock[] {
  const blocks: PaletteBlock[] = [];
  const groups = new Map<string, VisibleCommand[]>();

  for (const command of commands) {
    if (!command.group) {
      blocks.push({ kind: "item", command });
      continue;
    }
    let group = groups.get(command.group);
    if (!group) {
      group = [];
      groups.set(command.group, group);
      blocks.push({ kind: "group", name: command.group, commands: group });
    }
    group.push(command);
  }

  return blocks;
}

/**
 * Internal module helper — shared island wiring for every CommandPalette
 * flavor: slot lookup, morph preservation, the dialog and command controllers,
 * the hotkey listener, WebMCP registration, and cleanup. `render` supplies the
 * (flavor-specific) static markup — no reactive open binds on the SSR template
 * in any flavor. Not part of the package public API.
 */
export function createPalette(
  commands: readonly CommandItem[],
  options: CommandPaletteOptions,
  render: (
    commands: readonly VisibleCommand[],
    forms: readonly InputForm[],
    options: CommandPaletteOptions,
  ) => RawHtml,
) {
  assertCommands(commands);
  const snapshot = [...commands] as VisibleCommand[];
  const byId = new Map(snapshot.map((command) => [command.id, command] as const));
  const executionSignals = new WeakMap<Element, AbortSignal>();
  const formDialogs = new WeakMap<Element, HTMLElement>();
  const forms = snapshot.filter(isInputCommand).map((command) => {
    const InputFormIsland = Form(command.input, {
      defaultValues: command.defaultValues,
      uiOverrides: command.uiOverrides,
      submitLabel: command.submitLabel,
      onSubmit: (values: Record<string, unknown>, event: Event) => {
        const formHost = (event.target as Element).closest('[data-slot="command-form-island"]');
        const dialogRoot = formHost ? formDialogs.get(formHost) : undefined;
        if (!dialogRoot) return;
        dialogRoot.dispatchEvent(new CustomEvent("command-palette:close"));
        void executeInputCommand(
          command,
          values,
          "palette",
          executionSignals.get(dialogRoot) ?? AbortSignal.abort(),
        );
      },
    });
    return {
      command,
      content: InputFormIsland.key(`command-form-${command.id}`)({}),
    };
  });

  return ilha(() => {
    effect.once(({ host, signal }: { host: Element; signal: AbortSignal }) => {
      const dialogRoot = host.querySelector('[data-slot="dialog"]') as HTMLElement | null;
      const commandRoot = host.querySelector('[data-slot="command"]') as HTMLElement | null;
      if (!dialogRoot) {
        throw new Error(`${PACKAGE_ERROR} CommandPalette markup is missing the "dialog" slot.`);
      }
      if (!commandRoot) {
        throw new Error(`${PACKAGE_ERROR} CommandPalette markup is missing the "command" slot.`);
      }

      stampMorphPreserve(dialogRoot);
      stampMorphPreserve(commandRoot, MORPH_CONTROLLER_STYLE);

      const executions = new AbortController();
      const registrations = new AbortController();
      executionSignals.set(dialogRoot, executions.signal);
      for (const { command } of forms) {
        const formHost = commandRoot.querySelector(
          `[data-slot="command-form-island"][data-command-id="${CSS.escape(command.id)}"]`,
        ) as HTMLElement | null;
        if (formHost) formDialogs.set(formHost, dialogRoot);
      }
      const dialog = DialogPrimitive.createDialog(dialogRoot);
      const main = commandRoot.querySelector('[data-slot="command-main"]') as HTMLElement | null;
      const formScreens = commandRoot.querySelectorAll(
        '[data-slot="command-form"]',
      ) as NodeListOf<HTMLElement>;
      const resetInputStep = () => {
        if (main) main.hidden = false;
        for (const form of formScreens) form.hidden = true;
      };
      const paintSelection = (value: string | null) => {
        for (const item of commandRoot.querySelectorAll(
          '[data-slot="command-item"]',
        ) as NodeListOf<HTMLElement>) {
          const on = value !== null && item.getAttribute("data-value") === value;
          item.style.backgroundColor = on ? "var(--areia-primary-soft)" : "";
          item.style.color = on ? "var(--areia-primary-soft-foreground)" : "";
        }
      };
      const command = CommandPrimitive.createCommand(commandRoot, {
        label: options.label,
        loop: options.loop,
        disablePointerSelection: true,
        onValueChange: paintSelection,
        onSelect: (id: string) => {
          const selected = byId.get(id);
          if (!selected) return;
          if (isInputCommand(selected)) {
            if (main) main.hidden = true;
            const form = commandRoot.querySelector(
              `[data-slot="command-form"][data-command-id="${CSS.escape(id)}"]`,
            ) as HTMLElement | null;
            if (form) form.hidden = false;
            command.setSearch("");
            requestAnimationFrame(() =>
              (form?.querySelector("input,select,textarea") as HTMLElement | null)?.focus(),
            );
            return;
          }
          // Close before execution; progress/failure presentation belongs to
          // the application. Rejections surface as unhandled rejections.
          dialog.close();
          void executeCommand(selected, "palette", executions.signal);
        },
      });
      paintSelection(command.value);

      commandRoot.querySelector('[data-slot="command-list"]')?.addEventListener(
        "pointermove",
        (event: Event) => {
          event.stopImmediatePropagation();
        },
        { capture: true, signal },
      );

      const focusCommandInput = () => {
        (
          commandRoot.querySelector('[data-slot="command-input"]') as HTMLInputElement | null
        )?.focus();
      };
      const formStepOpen = () => [...formScreens].some((form) => !form.hidden);

      commandRoot.addEventListener(
        "click",
        (event: Event) => {
          if (!(event.target as Element).closest('[data-slot="command-form-back"]')) return;
          resetInputStep();
          focusCommandInput();
        },
        { signal },
      );
      document.addEventListener(
        "keydown",
        (event: KeyboardEvent) => {
          if (event.key !== "Escape" || !formStepOpen()) return;
          event.preventDefault();
          event.stopPropagation();
          resetInputStep();
          focusCommandInput();
        },
        { capture: true, signal },
      );
      dialogRoot.addEventListener(
        "dialog:change",
        (event: Event) => {
          if (!(event as CustomEvent<{ open: boolean }>).detail.open) {
            resetInputStep();
            return;
          }
          command.setSearch("");
          const first = (
            [...commandRoot.querySelectorAll('[data-slot="command-item"]')] as HTMLElement[]
          ).find((item) => !item.hidden);
          const value = first?.getAttribute("data-value") ?? null;
          if (value) command.select(value);
          paintSelection(value);
        },
        { signal },
      );

      dialogRoot.addEventListener("command-palette:open", () => dialog.open(), { signal });
      dialogRoot.addEventListener("command-palette:toggle", () => dialog.toggle(), { signal });
      dialogRoot.addEventListener("command-palette:close", () => dialog.close(), { signal });

      if (options.hotkey !== false) {
        document.addEventListener(
          "keydown",
          (event) => {
            if (event.key.toLowerCase() !== "k") return;
            if (!event.metaKey && !event.ctrlKey) return;
            event.preventDefault();
            dialog.toggle();
          },
          { signal },
        );
      }

      registerWebMcpTools(snapshot, registrations.signal);

      return () => {
        command.destroy();
        dialog.destroy();
        registrations.abort();
        executions.abort();
      };
    });

    return render(snapshot, forms, options);
  });
}

function renderBaseItem(command: VisibleCommand) {
  const external = typeof command.run !== "function" && command.external;
  const icon = command.icon ? html`<span aria-hidden="true">${command.icon}</span>` : "";
  const body = html`<span>
    <span>${command.label}${external ? " ↗" : ""}</span>
    ${command.description ? html`<span>${command.description}</span>` : ""}
  </span>`;
  const shortcut = command.shortcut
    ? html`<span data-slot="command-shortcut">${command.shortcut}</span>`
    : "";

  return html`<div
    data-slot="command-item"
    data-value="${command.id}"
    data-keywords="${command.keywords?.join(",") ?? ""}"
    ${command.disabled ? raw("disabled") : ""}
  >
    ${icon}${body}${shortcut}
  </div>`;
}

function renderBasePalette(
  commands: readonly VisibleCommand[],
  forms: readonly InputForm[],
  options: CommandPaletteOptions,
) {
  const label = options.label ?? "Command palette";
  const placeholder = options.placeholder ?? "Type a command or search…";
  const empty = options.empty ?? "No results found.";

  const blocks = buildBlocks(commands).map((block) =>
    block.kind === "item"
      ? renderBaseItem(block.command)
      : html`<div data-slot="command-group">
          <div data-slot="command-group-heading">${block.name}</div>
          ${block.commands.map(renderBaseItem)}
        </div>`,
  );

  return html`<div data-slot="dialog">
    ${options.trigger ? Dialog.Trigger({ children: options.trigger }) : ""}
    <div data-slot="dialog-portal">
      <div data-slot="dialog-overlay" hidden></div>
      <div data-slot="dialog-content" hidden>
        <div data-slot="command" data-label="${label}">
          <div data-slot="command-main">
            <div data-slot="command-input-wrapper">
              <input
                data-slot="command-input"
                type="text"
                placeholder="${placeholder}"
                aria-label="${label}"
              />
            </div>
            <div data-slot="command-list">
              <div data-slot="command-empty" hidden>${empty}</div>
              ${blocks}
            </div>
          </div>
          ${forms.map(
            ({ command, content }) => html`<div
              data-slot="command-form"
              data-command-id="${command.id}"
              hidden
            >
              <button type="button" data-slot="command-form-back" aria-label="Back">←</button>
              <div>${command.label}</div>
              <div data-slot="command-form-island" data-command-id="${command.id}">${content}</div>
            </div>`,
          )}
        </div>
      </div>
    </div>
  </div>`;
}

/**
 * Headless command palette — bare slot markup with zero styling. Same commands,
 * options, controller wiring, hotkey, and WebMCP exposure as `CommandPalette`;
 * bring your own Tailwind classes or component CSS.
 */
export function CommandPaletteBase(
  commands: readonly CommandItem[],
  options: CommandPaletteOptions = {},
) {
  return createPalette(commands, options, renderBasePalette);
}
