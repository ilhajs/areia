/** @jsxImportSource ilha */
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterEach, describe, expect, it } from "bun:test";
import ilha, { mount, raw } from "ilha";
import { markupValue as markup } from "$lib/test-markup";
import { Button } from "$components/button";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered.
}

afterEach(() => {
  document.body.replaceChildren();
});

describe("Ilha 0.10 compatibility", () => {
  it("accepts RawHtml for HTML and SVG string attributes", () => {
    const icon = "/icons/check.svg";
    const output = markup(
      <div>
        <img src={raw(icon)} alt="Check" />
        <a href={raw("/docs")}>Docs</a>
        <svg>
          <use href={raw("#check")} xlinkHref={raw("#check")} />
        </svg>
      </div>,
    );

    expect(output).toContain('src="/icons/check.svg"');
    expect(output).toContain('href="/docs"');
    expect(output).toContain('href="#check"');
    expect(output).toContain('xlink:href="#check"');
  });

  it("mounts native lowercase events without serializing function source", async () => {
    let calls = 0;
    let wasAborted = true;
    const App = ilha(() => (
      <Button
        onclick:once={(event, { signal }) => {
          const current: HTMLButtonElement = event.currentTarget;
          calls += current.type === "button" ? 1 : 0;
          wasAborted = signal.aborted;
        }}
      >
        Save
      </Button>
    ));

    const output = await App.hydratable({}, { name: "App", snapshot: true });
    expect(output).not.toContain("onclick=");
    expect(output).not.toContain("wasAborted");

    document.body.append(...new DOMParser().parseFromString(output, "text/html").body.childNodes);
    const mounted = mount({ App }, { root: document.body, lazy: false });
    try {
      const button = document.querySelector<HTMLButtonElement>("button")!;
      button.click();
      button.click();
      expect(calls).toBe(1);
      expect(wasAborted).toBe(false);
    } finally {
      mounted.unmount();
    }
  });

  it("creates independent islands with callable shorthand", async () => {
    const Badge = ilha<{ label: string }>(({ input }) => <span>{input.label}</span>);
    const App = ilha(() => (
      <div>
        <Badge key="first" label="First" />
        <Badge key="second" label="Second" />
      </div>
    ));

    const output = await App.hydratable({}, { name: "App", snapshot: true });
    expect(output).toContain('data-ilha-slot="k:first"');
    expect(output).toContain('data-ilha-slot="k:second"');
    expect(output).toContain("First");
    expect(output).toContain("Second");
  });
});
