import { describe, expect, it } from "bun:test";
import { markupValue as markup } from "$lib/test-markup";
import { Tabs, tabsVariants } from "./index";

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
