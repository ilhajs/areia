import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { describe, expect, it } from "bun:test";
import ilha, { html, mount } from "ilha";
import {
  Badge,
  Button,
  Collapsible,
  ContextMenu,
  Dialog,
  Field,
  HoverCard,
  LayerCard,
  Link,
  Popover,
  Resizable,
  Table,
} from "../index";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered by another DOM test file in the same Bun process.
}

function markup(value: unknown): string {
  if (value && typeof value === "object" && "value" in value) {
    return String(value.value);
  }
  return String(value);
}

function sampleTriggerMarkup() {
  return html`<div
    class="rounded-lg border border-dashed border-areia-border p-8 text-center text-areia-subtle"
  >
    Right click here
  </div>`;
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
        "Collapsible panel",
        () => Collapsible.Static({ trigger: "Toggle", panel: sampleTriggerMarkup() }),
      ],
      ["Field children", () => Field.Static({ children: sampleTriggerMarkup() })],
      ["Button children", () => Button({ children: sampleTriggerMarkup() })],
      ["Link children", () => Link({ href: "#", children: sampleTriggerMarkup() })],
      ["Badge children", () => Badge({ children: sampleTriggerMarkup() })],
    ];

    for (const [name, make] of cases) {
      it(`renders HTML children in ${name}`, () => {
        expectRenderedHtmlMarkup(name, markup(make()));
      });
    }
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
          "Dialog trigger",
          (Counter) => Dialog({ triggerAs: "span", children: Counter, content: "Body" }),
        ],
        ["Popover trigger", (Counter) => Popover({ children: Counter, content: "Body" })],
        ["HoverCard trigger", (Counter) => HoverCard({ children: Counter, content: "Body" })],
      ];

      for (const [name, make] of cases) {
        await expectInteractiveChild(name, make);
      }
    });

    it("keeps interactive islands mounted in overlay content", async () => {
      const cases: Array<[string, (Counter: ReturnType<typeof counterIsland>) => unknown]> = [
        ["Dialog content", (Counter) => Dialog({ children: "Open", content: Counter })],
        ["Popover content", (Counter) => Popover({ children: "Open", content: Counter })],
        ["HoverCard content", (Counter) => HoverCard({ children: "Hover", content: Counter })],
      ];

      for (const [name, make] of cases) {
        await expectInteractiveChild(name, make);
      }
    });
  });
});
