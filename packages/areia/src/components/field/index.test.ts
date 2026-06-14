import { describe, expect, it } from "bun:test";
import { markupValue as markup } from "$lib/test-markup";
import { Field } from "./index";

describe("Field", () => {
  it("renders field wrapper with data-slot", () => {
    const output = markup(Field.Static({ children: "Content" }));
    expect(output).toContain('data-slot="field"');
  });

  it("renders label when provided", () => {
    const output = markup(Field.Static({ label: "Name", children: "Input" }));
    expect(output).toContain('data-slot="field-label"');
    expect(output).toContain("Name");
  });

  it("renders description when provided", () => {
    const output = markup(Field.Static({ description: "Hint", children: "Input" }));
    expect(output).toContain('data-slot="field-description"');
    expect(output).toContain("Hint");
  });

  it("renders error when provided", () => {
    const output = markup(Field.Static({ error: "Oops", children: "Input" }));
    expect(output).toContain('data-slot="field-error"');
    expect(output).toContain("Oops");
  });

  it("renders empty error slot when no error", () => {
    const output = markup(Field.Static({ children: "Input" }));
    expect(output).toContain('data-slot="field-error"');
  });

  it("sets data-invalid when invalid is true", () => {
    const output = markup(Field.Static({ invalid: true, children: "Input" }));
    expect(output).toContain("data-invalid");
  });

  it("sets data-disabled when disabled is true", () => {
    const output = markup(Field.Static({ disabled: true, children: "Input" }));
    expect(output).toContain("data-disabled");
  });

  it("sets data-name when name is provided", () => {
    const output = markup(Field.Static({ name: "email", children: "Input" }));
    expect(output).toContain('data-name="email"');
  });

  it("merges custom class and className", () => {
    const output = markup(Field.Static({ children: "X", class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});

describe("Field.Label", () => {
  it("renders label with data-slot", () => {
    const output = markup(Field.Label({ label: "Title" }));
    expect(output).toContain('data-slot="field-label"');
    expect(output).toContain("Title");
  });
});

describe("Field.Description", () => {
  it("renders description with data-slot", () => {
    const output = markup(Field.Description({ description: "Hint" }));
    expect(output).toContain('data-slot="field-description"');
    expect(output).toContain("Hint");
  });
});

describe("Field.Error", () => {
  it("renders error with data-slot", () => {
    const output = markup(Field.Error({ error: "Bad" }));
    expect(output).toContain('data-slot="field-error"');
    expect(output).toContain("Bad");
  });
});

describe("Field.Item", () => {
  it("renders item wrapper with data-slot", () => {
    const output = markup(Field.Item({}));
    expect(output).toContain('data-slot="field-item"');
  });
});
