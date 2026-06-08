import { describe, expect, it } from "bun:test";
import { Breadcrumbs, breadcrumbsVariants } from "./index";

function markup(value: unknown): string {
  if (value && typeof value === "object" && "value" in value) {
    return String(value.value);
  }
  return String(value);
}

describe("breadcrumbsVariants", () => {
  it("returns default size classes", () => {
    const classes = breadcrumbsVariants();
    expect(classes).toContain("text-base");
    expect(classes).toContain("h-12");
  });

  it("applies sm size classes", () => {
    const classes = breadcrumbsVariants({ size: "sm" });
    expect(classes).toContain("text-sm");
    expect(classes).toContain("h-10");
  });
});

describe("Breadcrumbs", () => {
  it("renders nav with aria-label", () => {
    const output = markup(
      Breadcrumbs({
        items: [{ href: "/", children: "Home" }, { children: "Current" }],
      }),
    );
    expect(output).toContain("<nav");
    expect(output).toContain('aria-label="breadcrumb"');
  });

  it("renders links for non-last items", () => {
    const output = markup(
      Breadcrumbs({
        items: [{ href: "/", children: "Home" }, { children: "Current" }],
      }),
    );
    expect(output).toContain('href="/"');
    expect(output).toContain("Home");
  });

  it("passes data-no-intercept through to composed links", () => {
    const output = markup(
      Breadcrumbs.Link({ href: "/", children: "Home", "data-no-intercept": true }),
    );
    expect(output).toContain("data-no-intercept");
  });

  it("renders current page without link", () => {
    const output = markup(
      Breadcrumbs({
        items: [{ href: "/", children: "Home" }, { children: "Current" }],
      }),
    );
    expect(output).toContain('aria-current="page"');
    expect(output).toContain("Current");
  });

  it("renders copy url button when copyUrl is provided", () => {
    const output = markup(
      Breadcrumbs({
        items: [{ href: "/", children: "Home" }],
        copyUrl: "https://example.com",
      }),
    );
    expect(output).toContain("data-copy-text");
    expect(output).toContain('aria-label="Copy link"');
  });

  it("renders loading skeleton when loading is true", () => {
    const output = markup(
      Breadcrumbs({
        items: [{ href: "/", children: "Home" }, { children: "Current" }],
        loading: true,
      }),
    );
    expect(output).toContain("animate-pulse");
  });

  it("renders composed children when provided", () => {
    const output = markup(
      Breadcrumbs({
        children: "Custom markup",
      }),
    );
    expect(output).toContain("Custom markup");
  });

  it("merges custom class and className", () => {
    const output = markup(
      Breadcrumbs({
        items: [{ children: "X" }],
        class: "a",
        className: "b",
      }),
    );
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});
