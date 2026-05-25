import { describe, expect, it } from "bun:test";
import { Resizable } from "./index";

function markup(value: unknown): string {
  if (value && typeof value === "object" && "value" in value) {
    return String(value.value);
  }

  return String(value);
}

describe("Resizable", () => {
  it("renders the root as a horizontal flex group by default", () => {
    const output = markup(
      Resizable.Static({
        children: [
          Resizable.Panel({ children: "Left" }),
          Resizable.Handle(),
          Resizable.Panel({ children: "Right" }),
        ],
      }),
    );

    expect(output).toContain('data-slot="resizable"');
    expect(output).toContain("flex");
    expect(output).toContain("h-full");
    expect(output).toContain("w-full");
    expect(output).toContain("data-[direction=vertical]:flex-col");
  });

  it("renders vertical direction data for CSS before hydration", () => {
    const output = markup(Resizable.Static({ direction: "vertical" }));

    expect(output).toContain('data-direction="vertical"');
    expect(output).toContain("data-[direction=vertical]:flex-col");
  });

  it("renders handle orientation and grip classes", () => {
    const output = markup(Resizable.Handle({ withHandle: true }));

    expect(output).toContain('data-slot="resizable-handle"');
    expect(output).not.toContain('onpointerdown="');
    expect(output).toContain("cursor-col-resize");
    expect(output).toContain("data-[direction=vertical]:cursor-row-resize");
    expect(output).toContain("[&amp;[data-direction=vertical]&gt;div]:h-1");
    expect(output).toContain("[&amp;[data-direction=vertical]&gt;div]:w-6");
    expect(output).toContain('class="z-10 h-6 w-1 shrink-0 rounded-lg bg-areia-border"');
  });

  it("renders panel flex sizing from defaultSize", () => {
    const output = markup(Resizable.Panel({ defaultSize: 35, children: "Side" }));

    expect(output).toContain('data-default-size="35"');
    expect(output).toContain("flex-basis:0");
    expect(output).toContain("flex-shrink:1");
    expect(output).toContain("flex-grow:35");
  });
});
