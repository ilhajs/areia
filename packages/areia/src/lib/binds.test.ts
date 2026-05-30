import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { describe, expect, it } from "bun:test";
import ilha, { html, mount } from "ilha";
import { Input } from "$components/input";
import { Radio } from "$components/radio";
import { Textarea } from "$components/textarea";
import { Dialog } from "$components/dialog";
import {
  applyThisBind,
  boundVoidElement,
  createDateBindSync,
  createGroupBindSync,
  createOpenBindSync,
} from "./binds";
import type { SignalAccessor as IlhaSignalAccessor } from "ilha";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered by another DOM test file in the same Bun process.
}

function markup(value: unknown): string {
  if (value && typeof value === "object" && "value" in value) {
    return String(value.value);
  }
  return String(value);
}

describe("boundVoidElement", () => {
  it("forwards bind:value to native inputs", async () => {
    const App = ilha
      .state("name", "Ada")
      .render(({ state }) =>
        boundVoidElement("input", { "bind:value": state.name }, ` class="x">`),
      );

    document.body.innerHTML = await App.hydratable({}, { name: "App", snapshot: true });
    mount({ App }, { root: document.body, lazy: false });
    await Promise.resolve();

    const input = document.querySelector("input");
    expect(input?.value).toBe("Ada");

    input!.value = "Grace";
    input!.dispatchEvent(new Event("input", { bubbles: true }));
    await Promise.resolve();

    expect(input?.value).toBe("Grace");
  });
});

describe("Input bind:value", () => {
  it("renders data-ilha-bind and syncs with state", async () => {
    const App = ilha
      .state("email", "a@b.c")
      .render(({ state }) => Input({ "bind:value": state.email }));

    const html = markup(App());
    expect(html).toContain("data-ilha-bind");
    expect(html).toContain('value="a@b.c"');

    document.body.innerHTML = await App.hydratable({}, { name: "App", snapshot: true });
    mount({ App }, { root: document.body, lazy: false });
    await Promise.resolve();

    const input = document.querySelector("input");
    input!.value = "z@y.x";
    input!.dispatchEvent(new Event("input", { bubbles: true }));
    await Promise.resolve();

    expect(document.querySelector("input")?.value).toBe("z@y.x");
  });
});

describe("Textarea bind:value", () => {
  it("renders data-ilha-bind", () => {
    const App = ilha
      .state("bio", "Hello")
      .render(({ state }) => Textarea({ "bind:value": state.bio }));

    const html = markup(App());
    expect(html).toContain("data-ilha-bind");
    expect(html).toContain("Hello");
  });
});

describe("Radio.Item bind:group", () => {
  it("renders data-ilha-bind on the native radio input", () => {
    const App = ilha
      .state("plan", "pro")
      .render(({ state }) =>
        Radio.Group({}, [
          Radio.Item({ label: "Free", value: "free", name: "plan", "bind:group": state.plan }),
          Radio.Item({ label: "Pro", value: "pro", name: "plan", "bind:group": state.plan }),
        ]),
      );

    const html = markup(App());
    expect(html.match(/data-ilha-bind/g)?.length).toBe(2);
    expect(html).toContain('value="pro"');
  });
});

describe("Input bind:this", () => {
  it("renders data-ilha-bind sentinel for imperative element access", async () => {
    const App = ilha
      .state<HTMLElement | null>("el", null)
      .render(({ state }) => Input({ "bind:this": state.el }));

    const html = markup(App());
    expect(html).toContain("data-ilha-bind");

    document.body.innerHTML = await App.hydratable({}, { name: "App", snapshot: true });
    mount({ App }, { root: document.body, lazy: false });
    await Promise.resolve();

    expect(document.querySelector("input")).toBeTruthy();
  });
});

describe("createOpenBindSync", () => {
  it("mirrors signal and controller open state", () => {
    let open = false;
    const bindOpen = ((value?: boolean) => {
      if (value !== undefined) open = value;
      return open;
    }) as IlhaSignalAccessor<boolean>;

    let isOpen = false;
    const controller = {
      get isOpen() {
        return isOpen;
      },
      open: () => {
        isOpen = true;
      },
      close: () => {
        isOpen = false;
      },
    };

    const sync = createOpenBindSync({ "bind:open": bindOpen }, controller)!;
    sync.applyFromSignal();
    expect(isOpen).toBe(false);

    open = true;
    sync.applyFromSignal();
    expect(isOpen).toBe(true);

    sync.onUserChange(false);
    expect(open).toBe(false);
    expect(isOpen).toBe(true);
  });
});

describe("createGroupBindSync", () => {
  it("mirrors single-select values", () => {
    let value = "free";
    const bindGroup = ((next?: string) => {
      if (next !== undefined) value = next;
      return value;
    }) as IlhaSignalAccessor<string>;

    let current: string | null = "free";
    const sync = createGroupBindSync(
      { "bind:group": bindGroup },
      {
        getValue: () => current,
        setValue: (next) => {
          current = typeof next === "string" ? next : (next?.[0] ?? null);
        },
      },
      "single",
    )!;

    value = "pro";
    sync.applyFromSignal();
    expect(current).toBe("pro");

    sync.onUserChange("free");
    expect(value).toBe("free");
  });
});

describe("createDateBindSync", () => {
  it("mirrors date selection", () => {
    const day = new Date("2026-05-15T12:00:00.000Z");
    let selected: Date | null = day;
    const bindDate = ((next?: Date | null) => {
      if (next !== undefined) selected = next;
      return selected;
    }) as IlhaSignalAccessor<Date | null>;

    let current: Date | null = day;
    const sync = createDateBindSync(
      { "bind:valueAsDate": bindDate },
      {
        getDate: () => current,
        setDate: (next) => {
          current = next;
        },
      },
    )!;

    const next = new Date("2026-05-20T12:00:00.000Z");
    selected = next;
    sync.applyFromSignal();
    expect(current?.toISOString()).toBe(next.toISOString());

    sync.onUserChange(day);
    expect(selected?.toISOString()).toBe(day.toISOString());
  });
});

describe("Dialog bind:open", () => {
  it("opens and closes from ilha signal", async () => {
    let setOpen!: (value?: boolean) => boolean | void;

    const App = ilha.state("open", false).render(({ state }) => {
      setOpen = state.open as typeof setOpen;
      return html`${Dialog({
        trigger: "Open",
        content: "Body",
        "bind:open": state.open,
      })}`;
    });

    document.body.innerHTML = "";
    document.body.innerHTML = await App.hydratable({}, { name: "App", snapshot: true });
    mount({ App, Dialog }, { root: document.body, lazy: false });
    await Promise.resolve();

    const content = document.querySelector('[data-slot="dialog-content"]');
    expect(content?.getAttribute("data-state")).toBe("closed");

    setOpen(true);
    await Promise.resolve();
    expect(content?.getAttribute("data-state")).toBe("open");

    setOpen(false);
    await Promise.resolve();
    expect(content?.getAttribute("data-state")).toBe("closed");
  });
});

describe("applyThisBind", () => {
  it("writes and clears element references", () => {
    let current: HTMLElement | null = null;
    const accessor = ((value?: HTMLElement | null) => {
      if (value !== undefined) {
        current = value;
        return value;
      }
      return current;
    }) as IlhaSignalAccessor<HTMLElement | null>;

    const el = document.createElement("div");
    const cleanup = applyThisBind(el, { "bind:this": accessor });
    expect(accessor()).toBe(el);
    cleanup?.();
    expect(accessor()).toBe(null);
  });
});
