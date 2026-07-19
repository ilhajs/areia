import { describe, expect, it } from "bun:test";
import ilha, { html } from "ilha";
import {
  decodeMarkupEntities,
  hasRenderableContent,
  hasSlot,
  normalizeStaticChildSlots,
  render,
  renderString,
  renderStringForSlots,
  withSlot,
} from "./markup";

function markup(value: unknown): string {
  const rendered = render(value);
  if (rendered && typeof rendered === "object" && "value" in rendered) {
    return String(rendered.value);
  }
  return String(rendered);
}

describe("markup", () => {
  it("decodes escaped HTML entities in serialized markup", () => {
    const escaped = "&lt;button type=&quot;button&quot;&gt;Open&lt;/button&gt;";
    expect(decodeMarkupEntities(escaped)).toBe('<button type="button">Open</button>');
    expect(markup({ value: escaped })).toBe('<button type="button">Open</button>');
  });

  it("passes serialized markup with escaped attribute values through untouched", () => {
    const serialized =
      '<div data-ilha-slot="p:0" data-ilha-props=\'{"label":"it&#39;s &quot;quoted&quot;"}\'>x</div>';
    expect(decodeMarkupEntities(serialized)).toBe(serialized);
    expect(markup({ value: serialized })).toBe(serialized);
    expect(markup(serialized)).toBe(serialized);
  });

  it("round-trips quote-bearing data-ilha-props through render()", () => {
    const props = { label: `it's "quoted"` };
    const escaped = JSON.stringify({ default: props })
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
    const serialized = `<div data-slot="resizable-panel" data-ilha-slot="p:0" data-ilha-props='${escaped}'>x</div>`;
    const output = markup({ value: serialized });

    expect(output).toBe(serialized);
    const match = /data-ilha-props='([^']*)'/.exec(output);
    expect(match).not.toBeNull();
    const decoded = (match as RegExpExecArray)[1]
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&");
    expect(JSON.parse(decoded)).toEqual({ default: props });
  });

  it("still decodes fully-escaped markup (no literal tags)", () => {
    const doubleEscaped = "&lt;span&gt;it&amp;#39;s fine&lt;/span&gt;";
    expect(decodeMarkupEntities(doubleEscaped)).toBe("<span>it&#39;s fine</span>");
  });

  it("unwraps serialized HTML objects", () => {
    expect(markup({ value: "<button>Open</button>" })).toBe("<button>Open</button>");
    expect(markup({ value: "<button>Open</button>" })).not.toContain("[object Object]");
  });

  it("stringifies serialized HTML for slot detection", () => {
    expect(renderString({ value: '<div data-slot="popover-trigger">Open</div>' })).toContain(
      'data-slot="popover-trigger"',
    );
  });

  it("detects composed slots", () => {
    expect(
      hasSlot(
        { value: '<div data-slot="dropdown-menu-content">Menu</div>' },
        "dropdown-menu-content",
      ),
    ).toBe(true);
    expect(hasSlot({ value: "<div>Menu</div>" }, "dropdown-menu-content")).toBe(false);
  });

  it("injects data-slot into serialized HTML", () => {
    const output = markup(
      withSlot({ value: '<button type="button">Open</button>' }, "tooltip-trigger", "custom"),
    );
    expect(output).toContain('data-slot="tooltip-trigger"');
    expect(output).toContain('class="custom"');
  });

  it("injects data-slot into Ilha island host wrappers", () => {
    const Counter = ilha
      .state("count", 0)
      .render(({ state }) => html`<button type="button">Count: ${state.count}</button>`);
    const output = markup(withSlot(Counter, "popover-trigger", "custom"));

    expect(output).toContain("data-ilha-slot");
    expect(output).toContain('data-slot="popover-trigger"');
    expect(output).toContain('class="custom"');
  });

  it("detects composed slots inside Ilha islands", () => {
    const Counter = ilha
      .state("count", 0)
      .render(({ state }) => html`<button type="button">Count: ${state.count}</button>`);
    expect(renderStringForSlots(Counter)).toContain("data-ilha-slot");
    expect(hasRenderableContent(Counter)).toBe(true);
    expect(hasRenderableContent("")).toBe(false);
  });

  it("normalizeStaticChildSlots pre-renders child props", () => {
    const frozen = normalizeStaticChildSlots({ content: { value: "<span>Hi</span>" }, keep: 1 }, [
      "content",
    ]);
    expect(markup(frozen.content)).toBe("<span>Hi</span>");
    expect(frozen.keep).toBe(1);
  });
});
