import { describe, expect, it } from "bun:test";
import { markupValue as markup } from "$lib/test-markup";
import { LayerCard, layerCardVariants } from "./index";

describe("layerCardVariants", () => {
  it("returns surface classes", () => {
    const classes = layerCardVariants();
    expect(classes).toContain("rounded-lg");
    expect(classes).toContain("bg-areia-background");
  });
});

describe("LayerCard", () => {
  it("renders a div with data-slot", () => {
    const output = markup(LayerCard({ children: "Content" }));
    expect(output).toContain('data-slot="layer-card"');
  });

  it("uses surface variant when no structured children", () => {
    const output = markup(LayerCard({ children: "Text" }));
    expect(output).toContain("bg-areia-background");
  });

  it("uses layered root when structured children are present", () => {
    const output = markup(
      LayerCard({
        children: [LayerCard.Title({ children: "Title" }), LayerCard.Content({ children: "Body" })],
      }),
    );
    expect(output).toContain("bg-areia-surface-muted");
  });

  it("merges custom class and className", () => {
    const output = markup(LayerCard({ children: "X", class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});

describe("LayerCard.Title", () => {
  it("renders with data-slot", () => {
    const output = markup(LayerCard.Title({ children: "Header" }));
    expect(output).toContain('data-slot="layer-card-title"');
    expect(output).toContain("Header");
  });
});

describe("LayerCard.Content", () => {
  it("renders with data-slot", () => {
    const output = markup(LayerCard.Content({ children: "Body" }));
    expect(output).toContain('data-slot="layer-card-content"');
    expect(output).toContain("Body");
  });
});
