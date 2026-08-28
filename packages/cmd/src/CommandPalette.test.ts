import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { beforeEach, afterEach, describe, expect, it, mock } from "bun:test";
import { html, ilha, ilhaSignal, mount } from "ilha";
import { CommandPalette } from "./CommandPalette.tsx";
import { CommandPaletteBase } from "./CommandPaletteBase.tsx";
import type {
  CommandInputSchema,
  CommandItem,
  CommandPaletteOptions,
  InputCommand,
  PaletteCommand,
} from "./types.ts";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered by another DOM test file in the same Bun process.
}

async function settle() {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

type RegisteredTool = {
  tool: {
    name: string;
    title: string;
    description: string;
    inputSchema: unknown;
    annotations?: unknown;
    execute: (input: unknown, options: { signal: AbortSignal }) => Promise<unknown>;
  };
  options?: { signal?: AbortSignal };
};

function useModelContext() {
  const registrations: RegisteredTool[] = [];
  (document as unknown as { modelContext?: unknown }).modelContext = {
    registerTool: async (tool: RegisteredTool["tool"], options?: { signal?: AbortSignal }) => {
      registrations.push({ tool, options });
    },
  };
  return {
    registrations,
    done: () => {
      delete (document as unknown as { modelContext?: unknown }).modelContext;
    },
  };
}

const mounted: Array<() => void> = [];

type PaletteFactory = typeof CommandPalette;

async function mountPalette(
  factory: PaletteFactory,
  commands: readonly CommandItem[],
  options: CommandPaletteOptions = {},
) {
  const Palette = factory(commands, options);
  const ssr = await Palette.hydratable({}, { name: "Palette", snapshot: true, skipOnMount: false });
  const doc = new DOMParser().parseFromString(ssr, "text/html");
  document.body.replaceChildren(...Array.from(doc.body.childNodes));
  const { unmount } = mount({ Palette }, { root: document.body, lazy: false });
  mounted.push(() => {
    try {
      unmount();
    } catch {
      // Already unmounted by the test itself.
    }
  });
  await settle();
  return { unmount };
}

function pressK(modifiers: { metaKey?: boolean; ctrlKey?: boolean } = {}) {
  return document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "k", bubbles: true, cancelable: true, ...modifiers }),
  );
}

function dialogRoot() {
  return document.querySelector<HTMLElement>('[data-slot="dialog"]')!;
}

function items() {
  return document.querySelectorAll<HTMLElement>('[data-slot="command-item"]');
}

const sampleCommands: readonly PaletteCommand[] = [
  {
    id: "refresh_dashboard",
    label: "Refresh dashboard",
    description: "Reload the latest dashboard data.",
    group: "Actions",
    keywords: ["reload", "sync"],
    shortcut: "⌘R",
    icon: "⟳",
    run: () => "refreshed",
  },
  {
    id: "open_billing",
    label: "Open billing settings",
    group: "Navigation",
    href: "/settings/billing",
  },
  { id: "ungrouped", label: "Ungrouped command", run: () => "done" },
];

beforeEach(() => {
  document.body.replaceChildren();
  delete (document as unknown as { modelContext?: unknown }).modelContext;
});

afterEach(() => {
  while (mounted.length) mounted.pop()?.();
  document.body.replaceChildren();
});

describe("CommandPalette", () => {
  it("renders dialog, input, empty, group, item, description, icon, and shortcut slots", async () => {
    await mountPalette(CommandPalette, sampleCommands);

    for (const slot of [
      "dialog",
      "dialog-portal",
      "dialog-overlay",
      "dialog-content",
      "command",
      "command-input",
      "command-list",
      "command-empty",
      "command-group",
      "command-group-heading",
      "command-item",
      "command-shortcut",
    ]) {
      expect(document.querySelector(`[data-slot="${slot}"]`)).toBeTruthy();
    }
    expect(document.querySelector('[data-slot="command-item"]')?.textContent).toContain(
      "Refresh dashboard",
    );
    expect(document.querySelector('[data-slot="command-item"]')?.textContent).toContain(
      "Reload the latest dashboard data.",
    );
    expect(document.querySelector('[data-slot="command-item"]')?.textContent).toContain("⟳");
    expect(document.querySelector('[data-slot="command-item"]')?.textContent).toContain("⌘R");
    expect(document.querySelector('[data-slot="command-empty"]')?.textContent).toContain(
      "No results found.",
    );
  });

  it("preserves command and group authored order", async () => {
    await mountPalette(CommandPalette, sampleCommands);

    const headings = [
      ...document.querySelectorAll<HTMLElement>('[data-slot="command-group-heading"]'),
    ].map((el) => el.textContent?.trim());
    expect(headings).toEqual(["Actions", "Navigation"]);

    const values = [...items()].map((el) => el.getAttribute("data-value"));
    expect(values).toEqual(["refresh_dashboard", "open_billing", "ungrouped"]);
  });

  it("rejects duplicate and empty IDs at factory creation", () => {
    expect(() =>
      CommandPalette([
        { id: "same", label: "A", run: () => null },
        { id: "same", label: "B", run: () => null },
      ]),
    ).toThrow('Duplicate command id "same"');
    expect(() => CommandPalette([{ id: "  ", label: "A", run: () => null }])).toThrow(
      "non-empty id",
    );
    expect(() =>
      // @ts-expect-error — invalid shape must throw at runtime too
      CommandPalette([{ id: "broken", label: "A" }]),
    ).toThrow("exactly one of run or href");
  });

  it("Cmd+K and Ctrl+K toggle the dialog and focus the input", async () => {
    await mountPalette(CommandPalette, sampleCommands);

    expect(dialogRoot().getAttribute("data-state")).toBe("closed");
    expect(pressK({ metaKey: true })).toBe(false); // default prevented
    await settle();
    expect(dialogRoot().getAttribute("data-state")).toBe("open");
    expect(document.activeElement?.getAttribute("data-slot")).toBe("command-input");

    expect(pressK({ ctrlKey: true })).toBe(false);
    await settle();
    expect(dialogRoot().getAttribute("data-state")).toBe("closed");
  });

  it("hotkey: false installs no shortcut behavior", async () => {
    await mountPalette(CommandPalette, sampleCommands, { hotkey: false });

    expect(pressK({ metaKey: true })).toBe(true); // not prevented
    await settle();
    expect(dialogRoot().getAttribute("data-state")).toBe("closed");
    expect(document.querySelector('[data-slot="dialog-trigger"]')).toBeNull();
  });

  it("opens, toggles, and closes from scoped custom events", async () => {
    await mountPalette(CommandPalette, sampleCommands, { hotkey: false });
    const root = dialogRoot();

    root.dispatchEvent(new CustomEvent("command-palette:open"));
    await settle();
    expect(root.getAttribute("data-state")).toBe("open");
    expect(document.activeElement?.getAttribute("data-slot")).toBe("command-input");

    root.dispatchEvent(new CustomEvent("command-palette:toggle"));
    await settle();
    expect(root.getAttribute("data-state")).toBe("closed");

    root.dispatchEvent(new CustomEvent("command-palette:toggle"));
    await settle();
    expect(root.getAttribute("data-state")).toBe("open");

    root.dispatchEvent(new CustomEvent("command-palette:close"));
    await settle();
    expect(root.getAttribute("data-state")).toBe("closed");
  });

  it("reopening selects the first command", async () => {
    await mountPalette(CommandPalette, sampleCommands);
    dialogRoot().dispatchEvent(new CustomEvent("command-palette:open"));
    await settle();

    const [first, second] = items();
    expect(first!.getAttribute("data-selected")).toBe("true");
    expect(first!.style.backgroundColor).toBe("var(--areia-primary-soft)");

    document.activeElement?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }),
    );
    await settle();
    expect(second!.getAttribute("data-selected")).toBe("true");

    dialogRoot().dispatchEvent(new CustomEvent("command-palette:close"));
    await settle();
    dialogRoot().dispatchEvent(new CustomEvent("command-palette:open"));
    await settle();

    expect(items()[0]!.getAttribute("data-selected")).toBe("true");
    expect(items()[1]!.getAttribute("data-selected")).toBeNull();
  });

  it("does not change the selected item on hover", async () => {
    await mountPalette(CommandPalette, sampleCommands);
    dialogRoot().dispatchEvent(new CustomEvent("command-palette:open"));
    await settle();

    const first = items()[0]!;
    const second = items()[1]!;
    expect(first.getAttribute("data-selected")).toBe("true");

    second.dispatchEvent(new PointerEvent("pointermove", { bubbles: true }));
    await settle();

    expect(first.getAttribute("data-selected")).toBe("true");
    expect(second.getAttribute("data-selected")).toBeNull();
  });

  it("opens from a custom trigger when the hotkey is disabled", async () => {
    await mountPalette(CommandPalette, sampleCommands, {
      hotkey: false,
      trigger: html`<button>Open commands</button>`,
    });

    const trigger = document.querySelector<HTMLElement>('[data-slot="dialog-trigger"]')!;
    expect(trigger).toBeTruthy();
    expect(trigger.textContent).toBe("Open commands");
    expect(dialogRoot().getAttribute("data-state")).toBe("closed");

    trigger.click();
    await settle();

    expect(dialogRoot().getAttribute("data-state")).toBe("open");
    expect(document.activeElement?.getAttribute("data-slot")).toBe("command-input");
    expect(pressK({ metaKey: true })).toBe(true); // hotkey still disabled
  });

  it("selecting an action calls run once with source palette and closes the dialog", async () => {
    const run = mock((context: { source: string; signal: AbortSignal }) => {
      expect(context.source).toBe("palette");
      expect(context.signal).toBeInstanceOf(AbortSignal);
      return "ran";
    });
    await mountPalette(CommandPalette, [{ id: "do_thing", label: "Do thing", run }]);

    pressK({ metaKey: true });
    await settle();
    items()[0]?.click();
    await settle();

    expect(run).toHaveBeenCalledTimes(1);
    expect(dialogRoot().getAttribute("data-state")).toBe("closed");
  });

  it("disabled actions do not execute", async () => {
    const run = mock(() => "ran");
    await mountPalette(CommandPalette, [
      { id: "do_thing", label: "Do thing", disabled: true, run },
    ]);

    pressK({ metaKey: true });
    await settle();
    expect(items()[0]?.hasAttribute("disabled")).toBe(true);
    items()[0]?.click();
    await settle();

    expect(run).not.toHaveBeenCalled();
    expect(dialogRoot().getAttribute("data-state")).toBe("open");
  });

  it("selecting a link uses the navigation path", async () => {
    const navigations: string[] = [];
    const original = window.location.assign.bind(window.location);
    (window.location as unknown as { assign: (href: string) => void }).assign = (href) => {
      navigations.push(href);
    };

    try {
      await mountPalette(CommandPalette, [
        { id: "open_billing", label: "Billing", href: "/settings/billing" },
      ]);
      pressK({ metaKey: true });
      await settle();
      items()[0]?.click();
      await settle();

      expect(navigations).toEqual(["/settings/billing"]);
    } finally {
      (window.location as unknown as { assign: (href: string) => void }).assign = original;
    }
  });

  it("opens external links in a new tab with noopener noreferrer", async () => {
    const opened: Array<{
      href: string | URL | undefined;
      target: string | undefined;
      features: string | undefined;
    }> = [];
    const original = window.open.bind(window);
    (window as unknown as { open: typeof window.open }).open = (
      href?: string | URL,
      target?: string,
      features?: string,
    ) => {
      opened.push({ href, target, features });
      return null;
    };

    try {
      await mountPalette(CommandPalette, [
        { id: "open_docs", label: "Docs", href: "https://ilha.build", external: true },
        { id: "open_billing", label: "Billing", href: "/settings/billing" },
      ]);
      pressK({ metaKey: true });
      await settle();
      const itemText = items()[0]?.textContent?.replace(/\s+/g, " ").trim();
      expect(itemText).toContain("Docs ↗");
      expect(items()[1]?.textContent).not.toContain("↗");
      items()[0]?.click();
      await settle();

      expect(opened).toEqual([
        { href: "https://ilha.build", target: "_blank", features: "noopener,noreferrer" },
      ]);
    } finally {
      (window as unknown as { open: typeof window.open }).open = original;
    }
  });

  it("works when document.modelContext is absent", async () => {
    expect((document as unknown as { modelContext?: unknown }).modelContext).toBeUndefined();
    await mountPalette(CommandPalette, sampleCommands);

    pressK({ metaKey: true });
    await settle();
    expect(dialogRoot().getAttribute("data-state")).toBe("open");
    expect(items().length).toBe(3);
  });

  it("registers only commands with webmcp and maps the tool shape", async () => {
    const { registrations, done } = useModelContext();
    try {
      await mountPalette(CommandPalette, [
        {
          id: "refresh_dashboard",
          label: "Refresh dashboard",
          run: () => "refreshed",
          webmcp: {
            description: "Refresh the signed-in user's dashboard data.",
            annotations: { readOnlyHint: true, untrustedContentHint: true },
          },
        },
        { id: "open_billing", label: "Billing", href: "/settings/billing" },
        {
          id: "private_action",
          label: "Private action",
          run: () => null,
        },
      ]);

      expect(registrations.length).toBe(1);
      const { tool } = registrations[0]!;
      expect(tool.name).toBe("refresh_dashboard");
      expect(tool.title).toBe("Refresh dashboard");
      expect(tool.description).toBe("Refresh the signed-in user's dashboard data.");
      expect(tool.inputSchema).toEqual({
        type: "object",
        properties: {},
        additionalProperties: false,
      });
      expect(tool.annotations).toEqual({ readOnlyHint: true, untrustedContentHint: true });
    } finally {
      done();
    }
  });

  it("input commands without webmcp stay private to the palette", async () => {
    const { registrations, done } = useModelContext();
    try {
      const input = {
        "~standard": {
          version: 1,
          vendor: "test",
          validate: (value: unknown) => ({ value: (value ?? {}) as Record<string, unknown> }),
          jsonSchema: {
            input: () => ({ type: "object" }),
            output: () => ({ type: "object" }),
          },
        },
      } satisfies CommandInputSchema;
      await mountPalette(CommandPalette, [
        {
          id: "search",
          label: "Search",
          input,
          defaultValues: { query: "" },
          run: () => null,
        } satisfies InputCommand<typeof input>,
      ]);
      expect(items().length).toBe(1);
      expect(registrations.length).toBe(0);
    } finally {
      done();
    }
  });

  it("runs an input command from WebMCP and a second-step human form", async () => {
    const { registrations, done } = useModelContext();
    try {
      const input = {
        "~standard": {
          version: 1,
          vendor: "test",
          validate: (value: unknown) =>
            typeof value === "object" && value !== null && "query" in value
              ? { value: { query: String(value.query).trim() } }
              : { issues: [{ message: "query is required" }] },
          jsonSchema: {
            input: () => ({
              type: "object",
              properties: { query: { type: "string" } },
              required: ["query"],
              additionalProperties: false,
            }),
            output: () => ({ type: "object" }),
          },
        },
      } satisfies CommandInputSchema<unknown, { query: string }>;
      const run = mock(
        (value: { query: string }, context: { source: string; signal: AbortSignal }) => ({
          value,
          source: context.source,
        }),
      );
      const tool = {
        id: "search_settings",
        label: "Search settings",
        description: "Search application settings.",
        input,
        defaultValues: { query: "" },
        webmcp: { description: "Search application settings." },
        run,
      } satisfies InputCommand<typeof input>;

      await mountPalette(CommandPalette, [tool]);

      expect(items().length).toBe(1);
      expect(registrations.length).toBe(1);
      expect(registrations[0]!.tool.inputSchema).toEqual({
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
        additionalProperties: false,
      });
      await expect(
        registrations[0]!.tool.execute(
          { query: "  find settings  " },
          { signal: new AbortController().signal },
        ),
      ).resolves.toEqual({ value: { query: "find settings" }, source: "webmcp" });
      expect(run).toHaveBeenCalledTimes(1);

      pressK({ metaKey: true });
      await settle();
      items()[0]!.click();
      await settle();
      const form = document.querySelector<HTMLElement>('[data-slot="command-form"]')!;
      expect(form.hidden).toBe(false);
      expect(document.querySelector<HTMLElement>('[data-slot="command-main"]')!.hidden).toBe(true);

      const query = form.querySelector<HTMLInputElement>("input")!;
      query.value = "  human search  ";
      query.dispatchEvent(new Event("input", { bubbles: true }));
      const submit = new Event("submit", { bubbles: true, cancelable: true });
      form.querySelector<HTMLFormElement>("form")!.dispatchEvent(submit);
      expect(submit.defaultPrevented).toBe(true);
      await settle();
      await settle();

      expect(run).toHaveBeenCalledTimes(2);
      expect(run.mock.calls[1]![0]).toEqual({ query: "human search" });
      expect(run.mock.calls[1]![1].source).toBe("palette");
      expect(dialogRoot().getAttribute("data-state")).toBe("closed");

      dialogRoot().dispatchEvent(new CustomEvent("command-palette:open"));
      await settle();
      expect(document.querySelector<HTMLElement>('[data-slot="command-main"]')!.hidden).toBe(false);
      expect(form.hidden).toBe(true);
    } finally {
      done();
    }
  });

  it("Escape on the input step returns to the command list", async () => {
    const input = {
      "~standard": {
        version: 1,
        vendor: "test",
        validate: (value: unknown) => ({ value: (value ?? {}) as Record<string, unknown> }),
        jsonSchema: {
          input: () => ({ type: "object" }),
          output: () => ({ type: "object" }),
        },
      },
    } satisfies CommandInputSchema;
    await mountPalette(CommandPalette, [
      {
        id: "search",
        label: "Search",
        input,
        defaultValues: { query: "" },
        webmcp: { description: "Search." },
        run: () => null,
      } satisfies InputCommand<typeof input>,
    ]);

    pressK({ metaKey: true });
    await settle();
    items()[0]!.click();
    await settle();

    const form = document.querySelector<HTMLElement>('[data-slot="command-form"]')!;
    const main = document.querySelector<HTMLElement>('[data-slot="command-main"]')!;
    expect(form.hidden).toBe(false);
    expect(main.hidden).toBe(true);

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    );
    await settle();

    expect(form.hidden).toBe(true);
    expect(main.hidden).toBe(false);
    expect(dialogRoot().getAttribute("data-state")).toBe("open");
    expect(document.activeElement?.getAttribute("data-slot")).toBe("command-input");
  });

  it("rejects invalid WebMCP input before execution", async () => {
    const { registrations, done } = useModelContext();
    try {
      const run = mock(() => null);
      const input = {
        "~standard": {
          version: 1,
          vendor: "test",
          validate: () => ({ issues: [{ message: "query is required" }] }),
          jsonSchema: {
            input: () => ({ type: "object" }),
            output: () => ({ type: "object" }),
          },
        },
      } satisfies CommandInputSchema;

      await mountPalette(CommandPalette, [
        {
          id: "search",
          label: "Search",
          input,
          defaultValues: {},
          webmcp: { description: "Search." },
          run,
        } satisfies InputCommand<typeof input>,
      ]);

      await expect(
        registrations[0]!.tool.execute({}, { signal: new AbortController().signal }),
      ).rejects.toThrow('Invalid input for command "search": query is required');
      expect(run).not.toHaveBeenCalled();
    } finally {
      done();
    }
  });

  it("does not register disabled WebMCP commands", async () => {
    const { registrations, done } = useModelContext();
    try {
      await mountPalette(CommandPalette, [
        {
          id: "off",
          label: "Off",
          disabled: true,
          run: () => null,
          webmcp: { description: "Should not register." },
        },
      ]);

      expect(registrations.length).toBe(0);
    } finally {
      done();
    }
  });

  it("a WebMCP call invokes the same run callback with source webmcp and its signal", async () => {
    const { registrations, done } = useModelContext();
    try {
      const signal = new AbortController().signal;
      const run = mock((context: { source: string; signal: AbortSignal }) => {
        expect(context.source).toBe("webmcp");
        expect(context.signal).toBe(signal);
        return "tool-result";
      });
      await mountPalette(CommandPalette, [
        {
          id: "do_thing",
          label: "Do thing",
          run,
          webmcp: { description: "Does a thing." },
        },
      ]);

      await registrations[0]!.tool.execute({}, { signal });

      expect(run).toHaveBeenCalledTimes(1);
    } finally {
      done();
    }
  });

  it("returns the action result to WebMCP and propagates rejection", async () => {
    const { registrations, done } = useModelContext();
    try {
      const failure = new Error("refresh failed");
      await mountPalette(CommandPalette, [
        { id: "works", label: "Works", run: () => "tool-result", webmcp: { description: "W" } },
        {
          id: "breaks",
          label: "Breaks",
          run: () => {
            throw failure;
          },
          webmcp: { description: "B" },
        },
      ]);

      const signal = new AbortController().signal;
      await expect(registrations[0]!.tool.execute({}, { signal })).resolves.toBe("tool-result");
      await expect(registrations[1]!.tool.execute({}, { signal })).rejects.toBe(failure);
    } finally {
      done();
    }
  });

  it("aborts WebMCP registrations and destroys controllers on island cleanup", async () => {
    const { registrations, done } = useModelContext();
    try {
      const { unmount } = await mountPalette(CommandPalette, [
        { id: "do_thing", label: "Do thing", run: () => null, webmcp: { description: "T" } },
      ]);

      pressK({ metaKey: true });
      await settle();
      expect(dialogRoot().getAttribute("data-state")).toBe("open");

      unmount();
      await settle();

      expect(registrations[0]!.options?.signal?.aborted).toBe(true);
      expect(pressK({ metaKey: true })).toBe(true); // listener removed, not prevented
      await settle();
      expect(dialogRoot().getAttribute("data-state")).toBe("closed");
    } finally {
      done();
    }
  });

  it("opening, closing, morphing, and reopening do not duplicate portaled command items", async () => {
    const Palette = CommandPalette(sampleCommands);
    const tick = ilhaSignal(0);
    const App = ilha(() => {
      tick();
      return html`<div data-app>${Palette}</div>`;
    });

    const ssr = await App.hydratable({}, { name: "App", snapshot: true, skipOnMount: false });
    const doc = new DOMParser().parseFromString(ssr, "text/html");
    document.body.replaceChildren(...Array.from(doc.body.childNodes));
    mounted.push(() => {});
    mount({ App }, { root: document.body, lazy: false });
    await settle();

    pressK({ metaKey: true });
    await settle();
    expect(items().length).toBe(3);

    tick(1); // parent remorph while content is portaled
    await settle();
    expect(items().length).toBe(3);

    pressK({ metaKey: true }); // close
    await settle();
    pressK({ metaKey: true }); // reopen
    await settle();
    expect(items().length).toBe(3);
    expect(dialogRoot().getAttribute("data-state")).toBe("open");
  });
});

describe("CommandPaletteBase", () => {
  it("renders bare slot markup without classes and still executes commands", async () => {
    const run = mock((context: { source: string; signal: AbortSignal }) => {
      expect(context.source).toBe("palette");
      expect(context.signal).toBeInstanceOf(AbortSignal);
      return "ran";
    });
    await mountPalette(CommandPaletteBase, [
      { id: "do_thing", label: "Do thing", description: "Does a thing.", run },
    ]);

    const item = items()[0]!;
    expect(item.getAttribute("class")).toBe(null);
    expect(item.textContent).toContain("Do thing");
    expect(item.textContent).toContain("Does a thing.");

    pressK({ metaKey: true });
    await settle();
    expect(dialogRoot().getAttribute("data-state")).toBe("open");

    item.click();
    await settle();

    expect(run).toHaveBeenCalledTimes(1);
    expect(dialogRoot().getAttribute("data-state")).toBe("closed");
  });

  it("renders the custom trigger slot with bare markup", async () => {
    await mountPalette(CommandPaletteBase, sampleCommands, {
      hotkey: false,
      trigger: html`<button>Commands</button>`,
    });

    const trigger = document.querySelector<HTMLElement>('[data-slot="dialog-trigger"]')!;
    expect(trigger).toBeTruthy();
    expect(trigger.textContent).toBe("Commands");

    trigger.click();
    await settle();
    expect(dialogRoot().getAttribute("data-state")).toBe("open");
  });
});
