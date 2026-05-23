import { describe, expect, it } from "bun:test";
import { html } from "ilha";
import { Button, LinkButton, RefreshButton, buttonVariants } from "./index";

function markup(value: unknown): string {
  if (value && typeof value === "object" && "value" in value) {
    return String(value.value);
  }

  return String(value);
}

describe("buttonVariants", () => {
  it("returns default secondary/base classes", () => {
    const classes = buttonVariants();

    expect(classes).toContain("group");
    expect(classes).toContain("h-9");
    expect(classes).toContain("rounded-lg");
    expect(classes).toContain("bg-areia-control-background");
    expect(classes).toContain("ring-areia-control-border");
  });

  it("applies primary variant classes", () => {
    const classes = buttonVariants({ variant: "primary" });

    expect(classes).toContain("bg-areia-primary");
    expect(classes).toContain("!text-areia-primary-foreground");
  });

  it("applies compact size classes for square and circle shapes", () => {
    expect(buttonVariants({ shape: "square", size: "sm" })).toContain("size-6.5");
    expect(buttonVariants({ shape: "circle", size: "lg" })).toContain("size-10");
    expect(buttonVariants({ shape: "circle", size: "lg" })).toContain("rounded-full");
  });
});

describe("Button", () => {
  it("defaults type to button", () => {
    expect(markup(Button({ label: "Click" }))).toContain('type="button"');
  });

  it("allows overriding type", () => {
    expect(markup(Button({ type: "submit", label: "Save" }))).toContain('type="submit"');
  });

  it("wraps label in a span with class contents", () => {
    const output = markup(Button({ label: "Save" }));

    expect(output).toContain('<span class="contents">Save</span>');
  });

  it("does not render label wrapper for icon-only buttons", () => {
    const output = markup(
      Button({
        shape: "square",
        icon: html`<svg aria-hidden="true"></svg>`,
        "aria-label": "Add",
      }),
    );

    expect(output).not.toContain('class="contents"');
    expect(output).toContain('aria-label="Add"');
  });

  it("renders icon in non-loading state", () => {
    const output = markup(
      Button({
        icon: html`<svg data-testid="plus-icon"></svg>`,
        label: "Add item",
      }),
    );

    expect(output).toContain('data-testid="plus-icon"');
    expect(output).toContain("Add item");
    expect(output).not.toContain("animate-spin");
  });

  it("renders loader instead of icon in loading state", () => {
    const output = markup(
      Button({
        icon: html`<svg data-testid="plus-icon"></svg>`,
        loading: true,
        label: "Add item",
      }),
    );

    expect(output).toContain("animate-spin");
    expect(output).not.toContain('data-testid="plus-icon"');
    expect(output).toContain("Add item");
  });

  it("loading sets disabled attribute", () => {
    expect(markup(Button({ loading: true, label: "Save" }))).toContain(" disabled");
  });

  it("disabled prop sets disabled attribute and disabled classes", () => {
    const output = markup(Button({ disabled: true, label: "Save" }));

    expect(output).toContain(" disabled");
    expect(output).toContain("cursor-not-allowed");
    expect(output).toContain("opacity-50");
  });

  it("passes through attributes without escaping the attribute string", () => {
    const output = markup(
      Button({
        label: "Save",
        id: "save-button",
        "data-testid": "save",
      }),
    );

    expect(output).toContain('id="save-button"');
    expect(output).toContain('data-testid="save"');
    expect(output).not.toContain("&quot;save-button&quot;");
  });

  it("renders title as tooltip content instead of a native title attribute", () => {
    const output = markup(Button({ label: "Save", title: "Save changes" }));

    expect(output).toContain('data-slot="tooltip"');
    expect(output).toContain('data-slot="tooltip-trigger"');
    expect(output).toContain('data-slot="tooltip-content"');
    expect(output).toContain("Save changes");
    expect(output).not.toContain('title="Save changes"');
  });

  it("merges class and className", () => {
    const output = markup(
      Button({
        label: "Save",
        class: "custom-class",
        className: "another-class",
      }),
    );

    expect(output).toContain("custom-class");
    expect(output).toContain("another-class");
  });
});

describe("RefreshButton", () => {
  it("renders with default aria-label", () => {
    const output = markup(RefreshButton());

    expect(output).toContain('aria-label="Refresh"');
    expect(output).toContain("size-9");
  });

  it("allows overriding aria-label", () => {
    const output = markup(RefreshButton({ "aria-label": "Reload data" }));

    expect(output).toContain('aria-label="Reload data"');
    expect(output).not.toContain('aria-label="Refresh"');
  });

  it("renders loader and disables the button when loading", () => {
    const output = markup(RefreshButton({ loading: true }));

    expect(output).toContain("animate-spin");
    expect(output).toContain(" disabled");
  });
});

describe("LinkButton", () => {
  it("renders as an anchor", () => {
    const output = markup(LinkButton({ href: "/home", label: "Home" }));

    expect(output).toContain("<a");
    expect(output).toContain('href="/home"');
    expect(output).toContain("Home");
  });

  it("external sets target and rel", () => {
    const output = markup(
      LinkButton({
        href: "https://example.com",
        external: true,
        label: "Docs",
      }),
    );

    expect(output).toContain('target="_blank"');
    expect(output).toContain('rel="noopener noreferrer"');
  });

  it("does not override existing target and rel when external is false", () => {
    const output = markup(
      LinkButton({
        href: "/docs",
        target: "_self",
        rel: "prefetch",
        label: "Docs",
      }),
    );

    expect(output).toContain('target="_self"');
    expect(output).toContain('rel="prefetch"');
  });

  it("renders icon before label", () => {
    const output = markup(
      LinkButton({
        href: "/new",
        icon: html`<svg data-testid="external-icon"></svg>`,
        label: "Open",
      }),
    );

    expect(output.indexOf('data-testid="external-icon"')).toBeLessThan(output.indexOf("Open"));
  });
});
