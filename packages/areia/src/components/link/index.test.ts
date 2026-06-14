import { describe, expect, it } from "bun:test";
import { markupValue as markup } from "$lib/test-markup";
import { Link, linkVariants, LinkExternalIcon } from "./index";

describe("linkVariants", () => {
  it("returns default inline classes", () => {
    const classes = linkVariants();
    expect(classes).toContain("text-areia-primary");
    expect(classes).toContain("underline");
  });

  it("applies plain variant classes", () => {
    const classes = linkVariants({ variant: "plain" });
    expect(classes).toContain("text-areia-primary");
    expect(classes).not.toContain("underline");
  });
});

describe("Link", () => {
  it("renders as an anchor with href", () => {
    const output = markup(Link({ href: "/docs", children: "Docs" }));
    expect(output).toContain("<a");
    expect(output).toContain('href="/docs"');
    expect(output).toContain("Docs");
  });

  it("sets external target and rel", () => {
    const output = markup(Link({ href: "https://example.com", external: true, children: "Ext" }));
    expect(output).toContain('target="_blank"');
    expect(output).toContain('rel="noopener noreferrer"');
  });

  it("preserves explicit target and rel when external is false", () => {
    const output = markup(Link({ href: "/x", target: "_self", rel: "prefetch", children: "X" }));
    expect(output).toContain('target="_self"');
    expect(output).toContain('rel="prefetch"');
  });

  it("passes data-no-intercept through to anchors", () => {
    const output = markup(Link({ href: "/x", "data-no-intercept": true, children: "X" }));
    expect(output).toContain("data-no-intercept");
  });

  it("merges custom class and className", () => {
    const output = markup(Link({ href: "/", children: "Home", class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});

describe("LinkExternalIcon", () => {
  it("renders an svg", () => {
    const output = markup(LinkExternalIcon());
    expect(output).toContain("<svg");
    expect(output).toContain('aria-hidden="true"');
  });
});
