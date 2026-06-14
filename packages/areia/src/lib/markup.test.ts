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
