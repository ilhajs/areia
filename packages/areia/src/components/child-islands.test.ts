import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { describe, expect, it } from "bun:test";
import { markupValue as markup } from "$lib/test-markup";
import ilha, { html, mount } from "ilha";
import {
  Badge,
  Button,
  ClipboardText,
  Collapsible,
  ContextMenu,
  Dialog,
  Dropdown,
  Field,
  HoverCard,
  Label,
  LayerCard,
  Link,
  LinkButton,
  Popover,
  Resizable,
  Table,
  Toggle,
  Tooltip,
} from "../index";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered by another DOM test file in the same Bun process.
}

function sampleTriggerMarkup() {
  return html`<div
    class="rounded-lg border border-dashed border-areia-border p-8 text-center text-areia-subtle"
  >
    Right click here
  </div>`;
}

function serializedTriggerMarkup() {
  return {
    value:
      '<div class="rounded-lg border border-dashed border-areia-border p-8 text-center text-areia-subtle">Right click here</div>',
  };
}

function counterIsland() {
  return ilha
    .state("count", 0)
    .on("button@click", ({ state }) => state.count(state.count() + 1))
    .render(({ state }) => html`<button type="button">Count: ${state.count}</button>`);
}

async function expectInteractiveChild(
  name: string,
  make: (Counter: ReturnType<typeof counterIsland>) => unknown,
) {
  document.body.innerHTML = "";

  const Counter = counterIsland();
  const App = ilha.render(() => html`${make(Counter)}`);

  document.body.innerHTML = await App.hydratable({}, { name: "App", snapshot: true });
  const { unmount } = mount({ App, Counter }, { root: document.body, lazy: false });

  try {
    await Promise.resolve();
    const counterButton = [...document.querySelectorAll<HTMLButtonElement>("button")].find(
      (button) => button.textContent?.includes("Count:"),
    );

    expect(document.body.innerHTML, name).not.toContain("[object Object]");
    expect(counterButton?.textContent?.trim(), name).toBe("Count: 0");

    counterButton?.click();
    await Promise.resolve();

    expect(counterButton?.textContent?.trim(), name).toBe("Count: 1");
  } finally {
    unmount();
  }
}

function expectRenderedHtmlMarkup(name: string, output: string) {
  expect(output, name).not.toContain("&lt;div");
  expect(output, name).not.toContain("[object Object]");
  expect(output, name).toContain('class="rounded-lg');
  expect(output, name).toContain("Right click here");
}

async function waitForPopoverClose() {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

describe("child Ilha islands", () => {
  describe("markup rendering", () => {
    const cases: Array<[string, () => unknown]> = [
      [
        "ContextMenu trigger",
        () =>
          ContextMenu.Static({
            trigger: sampleTriggerMarkup(),
            children: ContextMenu.Item({ label: "Copy" }),
          }),
      ],
      [
        "Dropdown trigger",
        () =>
          Dropdown.Static({
            trigger: sampleTriggerMarkup(),
            children: Dropdown.Item({ label: "Copy" }),
          }),
      ],
      [
        "Dropdown composed trigger",
        () =>
          Dropdown.Static({
            children: [
              Dropdown.Trigger({ children: sampleTriggerMarkup() }),
              Dropdown.Content({ children: Dropdown.Item({ label: "Copy" }) }),
            ],
          }),
      ],
      [
        "ContextMenu composed trigger",
        () =>
          ContextMenu.Static({
            children: [
              ContextMenu.Trigger({ children: sampleTriggerMarkup() }),
              ContextMenu.Content({ children: ContextMenu.Item({ label: "Copy" }) }),
            ],
          }),
      ],
      ["Dialog trigger", () => Dialog.Static({ children: sampleTriggerMarkup(), content: "Body" })],
      [
        "Popover trigger",
        () => Popover.Static({ children: sampleTriggerMarkup(), content: "Body" }),
      ],
      [
        "HoverCard trigger",
        () => HoverCard.Static({ children: sampleTriggerMarkup(), content: "Body" }),
      ],
      [
        "Popover composed trigger",
        () =>
          Popover.Static({
            children: [
              Popover.Trigger({ children: serializedTriggerMarkup() }),
              Popover.Content({ children: "Body" }),
            ],
          }),
      ],
      [
        "Tooltip trigger",
        () => Tooltip.Static({ trigger: serializedTriggerMarkup(), content: "Tip" }),
      ],
      ["Toggle children", () => Toggle.Static({ children: serializedTriggerMarkup() })],
      [
        "Collapsible panel",
        () => Collapsible.Static({ trigger: "Toggle", panel: sampleTriggerMarkup() }),
      ],
      ["Field children", () => Field.Static({ children: sampleTriggerMarkup() })],
      ["Button children", () => Button({ children: sampleTriggerMarkup() })],
      ["Button serialized children", () => Button({ children: serializedTriggerMarkup() })],
      ["Link children", () => Link({ href: "#", children: sampleTriggerMarkup() })],
      ["Badge children", () => Badge({ children: sampleTriggerMarkup() })],
      ["Badge serialized children", () => Badge({ children: serializedTriggerMarkup() })],
    ];

    for (const [name, make] of cases) {
      it(`renders HTML children in ${name}`, () => {
        expectRenderedHtmlMarkup(name, markup(make()));
      });
    }

    it("renders ClipboardText and ClipboardText.Static tooltip buttons as visible markup", () => {
      const text = "npx giget@latest gh:ilhajs/luz my-docs";
      const dynamicOutput = markup(ClipboardText({ text, tooltip: true }));
      const staticOutput = markup(ClipboardText.Static({ text, tooltip: true }));

      for (const output of [dynamicOutput, staticOutput]) {
        expect(output).toContain(text);
        expect(output).toContain('data-slot="clipboard-text-button"');
        expect(output).not.toContain("data-ilha-slot");
      }
    });

    it("renders Button title and Label tooltip without nested Ilha placeholders", () => {
      const buttonOutput = markup(Button({ title: "Copy", children: "Copy" }));
      const labelOutput = markup(Label({ label: "Name", tooltip: "Your full name" }));

      expect(buttonOutput).toContain('role="tooltip"');
      expect(buttonOutput).toContain("Copy");
      expect(buttonOutput).not.toContain("data-ilha-slot");

      expect(labelOutput).toContain('role="tooltip"');
      expect(labelOutput).toContain("Your full name");
      expect(labelOutput).not.toContain("data-ilha-slot");
    });
  });

  describe("interactive islands", () => {
    it("keeps interactive children mounted in content components", async () => {
      const cases: Array<[string, (Counter: ReturnType<typeof counterIsland>) => unknown]> = [
        ["Badge", (Counter) => Badge({ children: Counter })],
        ["Link", (Counter) => Link({ href: "#", children: Counter })],
        ["Field", (Counter) => Field({ children: Counter })],
        ["LayerCard", (Counter) => LayerCard({ children: Counter })],
        ["LayerCard.Content", (Counter) => LayerCard.Content({ children: Counter })],
        ["Collapsible panel", (Counter) => Collapsible({ trigger: "Toggle", panel: Counter })],
        [
          "Table.Cell",
          (Counter) =>
            Table({
              children: Table.Body({
                children: Table.Row({ children: Table.Cell({ children: Counter }) }),
              }),
            }),
        ],
        [
          "Resizable.Panel",
          (Counter) =>
            Resizable({
              children: [
                Resizable.Panel({ children: Counter }),
                Resizable.Handle(),
                Resizable.Panel({ children: "Other" }),
              ],
            }),
        ],
      ];

      for (const [name, make] of cases) {
        await expectInteractiveChild(name, make);
      }
    });

    it("keeps interactive islands mounted in overlay triggers", async () => {
      const cases: Array<[string, (Counter: ReturnType<typeof counterIsland>) => unknown]> = [
        [
          "ContextMenu trigger",
          (Counter) =>
            ContextMenu({
              trigger: Counter,
              children: ContextMenu.Item({ label: "Copy" }),
            }),
        ],
        [
          "Dropdown trigger",
          (Counter) =>
            Dropdown({
              trigger: Counter,
              children: Dropdown.Item({ label: "Copy" }),
            }),
        ],
        [
          "Dialog children trigger",
          (Counter) => Dialog({ triggerAs: "span", children: Counter, content: "Body" }),
        ],
        ["Dialog trigger prop", (Counter) => Dialog({ trigger: Counter, content: "Body" })],
        ["Popover children trigger", (Counter) => Popover({ children: Counter, content: "Body" })],
        ["Popover trigger prop", (Counter) => Popover({ trigger: Counter, content: "Body" })],
        ["Tooltip trigger prop", (Counter) => Tooltip({ trigger: Counter, content: "Tip" })],
        [
          "HoverCard children trigger",
          (Counter) => HoverCard({ children: Counter, content: "Body" }),
        ],
        ["HoverCard trigger prop", (Counter) => HoverCard({ trigger: Counter, content: "Body" })],
      ];

      for (const [name, make] of cases) {
        await expectInteractiveChild(name, make);
      }
    });

    it("opens Popover nested inside a parent Ilha island with a Button trigger", async () => {
      document.body.innerHTML = "";

      const App = ilha.render(
        () =>
          html`${Popover({
            side: "bottom",
            align: "end",
            trigger: Button({ "aria-label": "Open navigation", children: "Open" }),
            content: html`<nav data-testid="mobile-nav">Hello</nav>`,
          })}`,
      );

      const ssr = await App.hydratable({}, { name: "App", snapshot: true });
      expect(ssr).toContain('data-slot="popover-trigger"');
      expect(ssr).toContain('data-slot="popover-content"');

      document.body.innerHTML = ssr;
      const { unmount } = mount({ App }, { root: document.body, lazy: false });

      try {
        await Promise.resolve();
        const trigger = document.querySelector<HTMLButtonElement>('[data-slot="popover-trigger"]');
        const content = document.querySelector<HTMLElement>('[data-slot="popover-content"]');

        expect(trigger).not.toBeNull();
        expect(content).not.toBeNull();
        expect(document.querySelector('[data-slot="popover"]')?.getAttribute("onclick")).toBeNull();
        expect(trigger?.getAttribute("aria-haspopup")).toBe("dialog");
        expect(trigger?.getAttribute("aria-controls")).toBeTruthy();
        expect(content?.hidden).toBe(true);

        trigger?.click();
        await Promise.resolve();

        expect(content?.hidden).toBe(false);
        expect(content?.getAttribute("data-state")).toBe("open");
      } finally {
        unmount();
      }
    });

    it("opens Popover nested inside a child Ilha island within a parent layout island", async () => {
      document.body.innerHTML = "";

      const MobileNav = ilha.render(
        () =>
          html`${Popover({
            side: "bottom",
            align: "end",
            trigger: Button({ "aria-label": "Open navigation", children: "Open" }),
            content: html`<nav data-testid="mobile-nav">
              ${Popover.Close({
                children: LinkButton({ href: "/getting-started", children: "Getting Started" }),
              })}
              ${Collapsible({
                defaultOpen: true,
                trigger: "Section",
                panel: html`<a href="/guide/writing">Writing</a>`,
              })}
            </nav>`,
          })}`,
      );
      const Layout = ilha.render(
        () => html`<div>
          <div data-ilha-slot="k:page">page content</div>
          <div class="fixed top-4 right-4 z-50 md:hidden">${MobileNav}</div>
        </div>`,
      );

      document.body.innerHTML = await Layout.hydratable({}, { name: "Layout", snapshot: true });
      const { unmount } = mount({ Layout }, { root: document.body, lazy: false });

      try {
        await Promise.resolve();
        const trigger = document.querySelector<HTMLButtonElement>('[data-slot="popover-trigger"]');
        const content = document.querySelector<HTMLElement>('[data-slot="popover-content"]');

        expect(trigger).not.toBeNull();
        expect(content).not.toBeNull();
        expect(document.querySelector('[data-slot="popover"]')?.getAttribute("onclick")).toBeNull();
        expect(trigger?.getAttribute("aria-haspopup")).toBe("dialog");
        expect(trigger?.getAttribute("aria-controls")).toBeTruthy();
        expect(content?.hidden).toBe(true);

        trigger?.click();
        await Promise.resolve();

        expect(content?.hidden).toBe(false);
        expect(content?.getAttribute("data-state")).toBe("open");
        expect(trigger?.getAttribute("aria-expanded")).toBe("true");

        const closeLink = document.querySelector<HTMLAnchorElement>('[data-slot="popover-close"]');
        expect(closeLink?.getAttribute("href")).toBe("/getting-started");
        closeLink?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
        await waitForPopoverClose();

        expect(content?.hidden).toBe(true);
        expect(content?.getAttribute("data-state")).toBe("closed");
      } finally {
        unmount();
      }
    });

    it("keeps interactive islands mounted in overlay content", async () => {
      const cases: Array<[string, (Counter: ReturnType<typeof counterIsland>) => unknown]> = [
        ["Dialog content", (Counter) => Dialog({ children: "Open", content: Counter })],
        ["Popover content", (Counter) => Popover({ children: "Open", content: Counter })],
        ["HoverCard content", (Counter) => HoverCard({ children: "Hover", content: Counter })],
        ["Collapsible panel", (Counter) => Collapsible({ trigger: "Toggle", panel: Counter })],
        ["Field children", (Counter) => Field({ children: Counter })],
        ["LayerCard children", (Counter) => LayerCard({ children: Counter })],
      ];

      for (const [name, make] of cases) {
        await expectInteractiveChild(name, make);
      }
    });
  });
});
