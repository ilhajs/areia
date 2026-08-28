import { html, raw } from "ilha";
import { Button, Dialog, Input } from "areia";
import { buildBlocks, createPalette } from "./CommandPaletteBase.tsx";
import type { InputForm, VisibleCommand } from "./CommandPaletteBase.tsx";
import type { CommandItem, CommandPaletteOptions } from "./types.ts";

const ITEM_CLASSES =
  "flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-areia-default outline-none aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50";

function renderStyledItem(command: VisibleCommand) {
  // Link-only flag; narrowing keeps `external` off the action branch.
  const external = typeof command.run !== "function" && command.external;
  const icon = command.icon
    ? html`<span aria-hidden="true" class="shrink-0 text-areia-subtle">${command.icon}</span>`
    : "";
  const body = html`<span class="flex min-w-0 flex-1 flex-col">
    <span class="truncate">${command.label}${external ? " ↗" : ""}</span>
    ${command.description
      ? html`<span class="truncate text-xs text-areia-subtle">${command.description}</span>`
      : ""}
  </span>`;
  const shortcut = command.shortcut
    ? html`<span
        data-slot="command-shortcut"
        class="shrink-0 rounded-md bg-areia-surface-muted px-1.5 py-0.5 text-[0.65rem] font-medium tracking-widest text-areia-subtle"
        >${command.shortcut}</span
      >`
    : "";

  return html`<div
    data-slot="command-item"
    data-value="${command.id}"
    data-keywords="${command.keywords?.join(",") ?? ""}"
    ${command.disabled ? raw("disabled") : ""}
    class="${ITEM_CLASSES}"
  >
    ${icon}${body}${shortcut}
  </div>`;
}

function renderStyledPalette(
  commands: readonly VisibleCommand[],
  forms: readonly InputForm[],
  options: CommandPaletteOptions,
) {
  const label = options.label ?? "Command palette";
  const placeholder = options.placeholder ?? "Type a command or search…";
  const empty = options.empty ?? "No results found.";

  const blocks = buildBlocks(commands).map((block) =>
    block.kind === "item"
      ? renderStyledItem(block.command)
      : html`<div data-slot="command-group" class="py-1">
          <div
            data-slot="command-group-heading"
            class="px-2.5 py-1.5 text-xs font-medium text-areia-subtle"
          >
            ${block.name}
          </div>
          ${block.commands.map(renderStyledItem)}
        </div>`,
  );

  const commandRoot = html`<div data-slot="command" data-label="${label}">
    <div data-slot="command-main">
      <div data-slot="command-input-wrapper" class="border-b border-areia-divider p-2">
        ${Input.Static({
          "data-slot": "command-input",
          type: "text",
          placeholder,
          "aria-label": label,
          class: "h-10 rounded-lg border-0 bg-transparent ring-0 focus:ring-0",
        })}
      </div>
      <div data-slot="command-list" class="max-h-72 overflow-x-hidden overflow-y-auto p-1.5">
        <div data-slot="command-empty" hidden class="py-8 text-center text-sm text-areia-subtle">
          ${empty}
        </div>
        ${blocks}
      </div>
    </div>
    ${forms.map(
      ({ command, content }) => html`<div
        data-slot="command-form"
        data-command-id="${command.id}"
        hidden
        class="space-y-4 p-4"
      >
        <div class="flex items-center gap-2">
          ${Button({
            type: "button",
            "data-slot": "command-form-back",
            variant: "ghost",
            size: "sm",
            shape: "square",
            "aria-label": "Back",
            children: html`<svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="size-4"
              aria-hidden="true"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>`,
          })}
          <div class="font-medium text-areia-default">${command.label}</div>
        </div>
        <div data-slot="command-form-island" data-command-id="${command.id}">${content}</div>
      </div>`,
    )}
  </div>`;

  return html`<div data-slot="dialog">
    ${options.trigger ? Dialog.Trigger({ children: options.trigger }) : ""}
    ${Dialog.Portal({
      children: [Dialog.Overlay({}), Dialog.Content({ children: commandRoot })],
    })}
  </div>`;
}

/**
 * Command palette — a styled ilha island factory built on the `@areia/slots`
 * command and dialog controllers, Areia dialog/input markup, and Areia design
 * tokens. For bare slot markup, use `CommandPaletteBase`. Commands and
 * callbacks are captured in the factory closure and never serialized through
 * `data-ilha-props`.
 */
export function CommandPalette(
  commands: readonly CommandItem[],
  options: CommandPaletteOptions = {},
) {
  return createPalette(commands, options, renderStyledPalette);
}
