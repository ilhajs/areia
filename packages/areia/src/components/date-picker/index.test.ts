import { describe, expect, it } from "bun:test";
import { markupValue as markup } from "$lib/test-markup";
import { DatePicker, datePickerVariants } from "./index";

describe("datePickerVariants", () => {
  it("returns base classes", () => {
    const classes = datePickerVariants();
    expect(classes).toContain("select-none");
    expect(classes).toContain("rounded-xl");
  });
});

describe("DatePicker", () => {
  it("renders wrapper with data-slot", () => {
    const output = markup(DatePicker({}));
    expect(output).toContain('data-slot="date-picker"');
  });

  it("sets data-mode to single by default", () => {
    const output = markup(DatePicker({}));
    expect(output).toContain('data-mode="single"');
  });

  it("sets data-mode to range", () => {
    const output = markup(DatePicker({ mode: "range" }));
    expect(output).toContain('data-mode="range"');
  });

  it("renders month navigation buttons", () => {
    const output = markup(DatePicker({}));
    expect(output).toContain("data-date-picker-prev");
    expect(output).toContain("data-date-picker-next");
  });

  it("renders weekday headers", () => {
    const output = markup(DatePicker({}));
    expect(output).toContain("data-date-picker-month");
    // Should have 7 weekday header cells (Mon-Sun)
    expect(output).toContain("text-center text-xs text-areia-subtle");
  });

  it("renders day buttons", () => {
    const output = markup(DatePicker({}));
    const days = output.match(/data-date-picker-day/g);
    expect(days?.length).toBeGreaterThanOrEqual(28);
  });

  it("serializes selected single date", () => {
    const output = markup(DatePicker({ selected: new Date(2024, 0, 15) }));
    expect(output).toContain('data-selected="2024-01-15"');
  });

  it("serializes selected range", () => {
    const output = markup(
      DatePicker({
        mode: "range",
        selected: { from: new Date(2024, 0, 1), to: new Date(2024, 0, 15) },
      }),
    );
    expect(output).toContain('data-selected="2024-01-01..2024-01-15"');
  });

  it("merges custom class and className", () => {
    const output = markup(DatePicker({ class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});
