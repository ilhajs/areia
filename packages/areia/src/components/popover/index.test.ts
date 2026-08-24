import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterEach, describe, expect, it } from "bun:test";
import { ilha, html, mount } from "ilha";
import { markupValue as markup } from "$lib/test-markup";
import { Popover, bindPopoverRoot, popoverVariants } from "./index";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered
}

describe("popoverVariants", () => {
  it("returns default classes", () => {
    const classes = popoverVariants();
    expect(classes).toContain("rounded-lg");
    expect(classes).toContain("bg-areia-background");
    expect(classes).toContain("shadow-lg");
  });
});

const ISLAND = Symbol.for("ilha.island");
const isIsland = (v: unknown) =>
  typeof v === "function" &&
  (ISLAND in v || Object.getOwnPropertySymbols(v).some((s) => s.description === "ilha.island"));

describe("Popover", () => {
  it("default export is an ilha island", () => {
    expect(isIsland(Popover)).toBe(true);
    expect(typeof Popover.mount).toBe("function");
  });

  it("renders trigger and content", () => {
    const output = markup(Popover({ children: "Open", content: "Hello" }));
    expect(output).toContain('data-slot="popover"');
    expect(output).toContain('data-slot="popover-trigger"');
    expect(output).toContain('data-slot="popover-content"');
    expect(output).not.toContain("data-areia-popover");
  });

  it("Static returns plain markup without auto-bind markers", () => {
    const output = markup(Popover.Static({ children: "Open", content: "Hello" }));
    expect(output).toContain('data-slot="popover"');
    expect(output).not.toContain("data-areia-popover");
  });

  it("renders content hidden by default", () => {
    const output = markup(Popover({ children: "Open", content: "Hello" }));
    expect(output).toContain('data-slot="popover-content"');
    expect(output).toContain("hidden");
  });

  it("renders arrow by default", () => {
    const output = markup(Popover({ children: "Open", content: "Hello" }));
    expect(output).toContain('data-slot="popover-arrow"');
  });

  it("sets data-side attribute", () => {
    const output = markup(Popover({ children: "Open", content: "Hello", side: "top" }));
    expect(output).toContain('data-side="top"');
  });

  it("merges custom class and className", () => {
    const output = markup(Popover({ children: "X", content: "Y", class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});

describe("Popover.Trigger", () => {
  it("renders with data-slot", () => {
    const output = markup(Popover.Trigger({ children: "Open" }));
    expect(output).toContain('data-slot="popover-trigger"');
  });

  it("renders serialized HTML children instead of [object Object]", () => {
    const output = markup(
      Popover.Trigger({
        children: { value: '<button type="button" data-testid="trigger">Open</button>' },
      }),
    );
    expect(output).not.toContain("[object Object]");
    expect(output).toContain('data-testid="trigger"');
  });
});

describe("Popover.Content", () => {
  it("renders with data-slot and hidden", () => {
    const output = markup(Popover.Content({ children: "Body" }));
    expect(output).toContain('data-slot="popover-content"');
    expect(output).toContain("hidden");
  });
});

describe("Popover.Close", () => {
  it("wraps icon-only children in a button when as is button", () => {
    const output = markup(
      Popover.Close({
        as: "button",
        "aria-label": "Close",
        children: {
          value: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M0 0"></path></svg>',
        },
      }),
    );
    expect(output).toContain("<button");
    expect(output).toContain('data-slot="popover-close"');
    expect(output).not.toMatch(/<svg[^>]*data-slot="popover-close"/);
  });

  it("injects close slot into anchor children", () => {
    const output = markup(
      Popover.Close({ children: { value: '<a href="/docs" data-no-intercept>Docs</a>' } }),
    );
    expect(output).toContain("<a");
    expect(output).toContain('data-slot="popover-close"');
    expect(output).toContain("data-no-intercept");
    expect(output).not.toContain("<button");
  });
});

describe("Popover.Title", () => {
  it("renders h3 with classes", () => {
    const output = markup(Popover.Title({ children: "Title" }));
    expect(output).toContain("<h3");
    expect(output).toContain("Title");
  });
});

describe("Popover.Description", () => {
  it("renders p with classes", () => {
    const output = markup(Popover.Description({ children: "Desc" }));
    expect(output).toContain("<p");
    expect(output).toContain("Desc");
  });
});

describe("bindPopoverRoot", () => {
  function makeRoot() {
    const div = document.createElement("div");
    div.innerHTML = markup(Popover.Static({ children: "Open", content: "Hello" }));
    const root = div.querySelector('[data-slot="popover"]') as Element;
    document.body.appendChild(div);
    return root;
  }

  it("attaches aria attributes to trigger after binding", () => {
    const root = makeRoot();
    bindPopoverRoot(root);
    const trigger = root.querySelector('[data-slot="popover-trigger"]');
    expect(trigger?.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger?.getAttribute("aria-expanded")).toBe("false");
  });

  it("opens content on trigger click", () => {
    const root = makeRoot();
    bindPopoverRoot(root);
    const trigger = root.querySelector<HTMLElement>('[data-slot="popover-trigger"]');
    const content = root.querySelector<HTMLElement>('[data-slot="popover-content"]');
    trigger?.click();
    expect(trigger?.getAttribute("aria-expanded")).toBe("true");
    expect(content?.getAttribute("data-state")).toBe("open");
  });

  it("returns the same controller on repeated calls", () => {
    const root = makeRoot();
    const c1 = bindPopoverRoot(root);
    const c2 = bindPopoverRoot(root);
    expect(c1).toBe(c2);
  });
});

describe("Popover bind:open in parent island", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("keeps bind:open off the template (bridged by createOpenBindSync)", () => {
    const Panel = ilha.state("open", false).render(
      ({ state }) =>
        html`${Popover({
          children: "Open",
          content: "Body",
          "bind:open": state.open,
        })}`,
    );

    const output = markup(Panel());
    // Open stays off the SSR template so remorphs don't recreate portaled content.
    expect(output).not.toContain("data-ilha-bind");
    expect(output).toContain("data-ilha-slot");
    expect(output).toContain('data-slot="popover"');
    expect(output).not.toContain("data-areia-popover");
  });

  it("opens from ilha signal after hydrate", async () => {
    let setOpen!: (value?: boolean) => boolean | void;

    const Panel = ilha.state("open", false).render(({ state }) => {
      setOpen = state.open as typeof setOpen;
      return html`${Popover({
        children: "Open",
        content: "Body",
        "bind:open": state.open,
      })}`;
    });

    document.body.innerHTML = await Panel.hydratable({}, { name: "Panel", snapshot: true });
    mount({ Panel }, { root: document.body, lazy: false });
    await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
    await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
    await Promise.resolve();

    const content = document.querySelector('[data-slot="popover-content"]');
    expect(content?.getAttribute("data-state")).toBe("closed");

    setOpen(true);
    await Promise.resolve();
    await Promise.resolve();

    expect(content?.getAttribute("data-state")).toBe("open");
  });
});
