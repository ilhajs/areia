import { describe, expect, it } from "bun:test";
import { Table, tableVariants } from "./index";

function markup(value: unknown): string {
  if (value && typeof value === "object" && "value" in value) {
    return String(value.value);
  }
  return String(value);
}

describe("tableVariants", () => {
  it("returns default classes", () => {
    const classes = tableVariants();
    expect(classes).toContain("w-full");
    expect(classes).toContain("text-left");
  });

  it("applies fixed layout", () => {
    const classes = tableVariants({ layout: "fixed" });
    expect(classes).toContain("table-fixed");
  });
});

describe("Table", () => {
  it("renders table element", () => {
    const output = markup(Table({}));
    expect(output).toContain("<table");
  });

  it("renders header", () => {
    const output = markup(Table.Header({ children: Table.Head({ children: "Name" }) }));
    expect(output).toContain("<thead");
    expect(output).toContain("<th");
    expect(output).toContain("Name");
  });

  it("renders compact header", () => {
    const output = markup(Table.Header({ variant: "compact" }));
    expect(output).toContain("text-xs");
    expect(output).toContain("bg-areia-surface-muted");
  });

  it("renders body and row", () => {
    const output = markup(
      Table.Body({
        children: Table.Row({ children: Table.Cell({ children: "Value" }) }),
      }),
    );
    expect(output).toContain("<tbody");
    expect(output).toContain("<tr");
    expect(output).toContain("<td");
    expect(output).toContain("Value");
  });

  it("renders selected row", () => {
    const output = markup(Table.Row({ variant: "selected" }));
    expect(output).toContain("bg-areia-control-hover");
  });

  it("renders sticky head cell", () => {
    const output = markup(Table.Head({ sticky: "left", children: "ID" }));
    expect(output).toContain("sticky");
    expect(output).toContain("left-0");
  });

  it("renders sticky body cell", () => {
    const output = markup(Table.Cell({ sticky: "right", children: "Actions" }));
    expect(output).toContain("sticky");
    expect(output).toContain("right-0");
  });

  it("renders footer", () => {
    const output = markup(Table.Footer({ children: "Footer" }));
    expect(output).toContain("<tfoot");
    expect(output).toContain("Footer");
  });

  it("renders resize handle", () => {
    const output = markup(Table.ResizeHandle());
    expect(output).toContain('aria-label="Resize column"');
    expect(output).toContain("cursor-col-resize");
  });

  it("renders check cell", () => {
    const output = markup(Table.CheckCell({}));
    expect(output).toContain("<td");
    expect(output).toContain("w-10");
    expect(output).toContain("leading-none");
  });

  it("renders check head", () => {
    const output = markup(Table.CheckHead({}));
    expect(output).toContain("<th");
    expect(output).toContain("w-10");
    expect(output).toContain("leading-none");
  });

  it("merges custom class and className", () => {
    const output = markup(Table({ class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});
