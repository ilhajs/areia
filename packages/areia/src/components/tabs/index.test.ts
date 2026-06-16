import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterEach, describe, expect, it } from "bun:test";
import ilha, { html, mount } from "ilha";
import { markupValue as markup } from "$lib/test-markup";
import { Tabs, tabsVariants } from "./index";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered by another DOM test file in the same Bun process.
}

describe("tabsVariants", () => {
  it("returns base classes", () => {
    const classes = tabsVariants();
    expect(classes).toContain("relative");
    expect(classes).toContain("isolate");
  });
});

describe("Tabs", () => {
  it("renders tabs from tabs prop", () => {
    const output = markup(
      Tabs({
        tabs: [
          { value: "a", label: "Alpha", content: "A content" },
          { value: "b", label: "Beta", content: "B content" },
        ],
      }),
    );
    expect(output).toContain('data-slot="tabs"');
    expect(output).toContain('data-slot="tabs-trigger"');
    expect(output).toContain('data-slot="tabs-content"');
    expect(output).toContain("Alpha");
    expect(output).toContain("Beta");
  });

  it("activates first tab by default", () => {
    const output = markup(
      Tabs({
        tabs: [
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
        ],
      }),
    );
    expect(output).toContain('data-state="active"');
    expect(output).toContain('data-state="inactive"');
  });

  it("renders segmented variant background", () => {
    const output = markup(
      Tabs({
        variant: "segmented",
        tabs: [{ value: "a", label: "Alpha" }],
      }),
    );
    expect(output).toContain("bg-areia-surface-muted");
  });

  it("renders underline variant", () => {
    const output = markup(
      Tabs({
        variant: "underline",
        tabs: [{ value: "a", label: "Alpha" }],
      }),
    );
    expect(output).toContain("border-b");
  });

  it("renders composed children", () => {
    const output = markup(
      Tabs({
        children: [
          Tabs.List({ children: Tabs.Trigger({ value: "a", label: "A" }) }),
          Tabs.Content({ value: "a", children: "A content" }),
        ],
      }),
    );
    expect(output).toContain('data-slot="tabs-list"');
    expect(output).toContain('data-slot="tabs-content"');
  });

  it("merges custom class and className", () => {
    const output = markup(Tabs({ tabs: [{ value: "a", label: "A" }], class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });

  it("renders bind:group on parent island without nested slot", () => {
    const Panel = ilha.state("tab", "a").render(
      ({ state }) =>
        html`${Tabs({
          "bind:group": state.tab,
          tabs: [
            { value: "a", label: "Alpha", content: "A" },
            { value: "b", label: "Beta", content: "B" },
          ],
        })}`,
    );

    const output = markup(Panel());
    expect(output).toContain("data-ilha-bind");
    expect(output).not.toContain("data-ilha-slot");
    expect(output).toContain("data-areia-tabs");
  });
});

describe("Tabs bind:group in parent island", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("updates parent signal when selecting a tab", async () => {
    const warn = console.warn;
    const warnings: string[] = [];
    console.warn = (...args: unknown[]) => {
      const msg = args.map(String).join(" ");
      if (msg.includes("createTabs() called more than once")) warnings.push(msg);
      warn(...args);
    };

    let readTab!: () => string;

    const Panel = ilha.state("tab", "a").render(({ state }) => {
      readTab = state.tab as () => string;
      return html`${Tabs({
        activationMode: "auto",
        "bind:group": state.tab,
        tabs: [
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
        ],
      })}`;
    });

    document.body.innerHTML = await Panel.hydratable({}, { name: "Panel", snapshot: true });
    mount({ Panel }, { root: document.body, lazy: false });
    await Promise.resolve();
    await Promise.resolve();

    const beta = [...document.querySelectorAll('[data-slot="tabs-trigger"]')].find(
      (el) => el.getAttribute("data-value") === "b",
    ) as HTMLButtonElement | undefined;

    beta?.click();
    await Promise.resolve();
    await Promise.resolve();

    expect(beta?.getAttribute("data-state")).toBe("active");
    expect(readTab()).toBe("b");
    expect(warnings).toEqual([]);

    console.warn = warn;
  });
});

describe("Tabs.Trigger", () => {
  it("renders with data-slot", () => {
    const output = markup(Tabs.Trigger({ value: "a", label: "A" }));
    expect(output).toContain('data-slot="tabs-trigger"');
    expect(output).toContain('data-value="a"');
  });
});

describe("Tabs.Content", () => {
  it("renders with data-slot", () => {
    const output = markup(Tabs.Content({ value: "a", children: "Body" }));
    expect(output).toContain('data-slot="tabs-content"');
    expect(output).toContain('data-value="a"');
  });
});

describe("Tabs.List", () => {
  it("renders with data-slot", () => {
    const output = markup(Tabs.List({}));
    expect(output).toContain('data-slot="tabs-list"');
  });
});
