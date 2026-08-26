import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterEach, describe, expect, it } from "bun:test";
import { ilha, html } from "ilha";
import { markupValue as markup, mountSsr } from "$lib/test-markup";
import { Pagination, paginationVariants } from "./index";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered by another DOM test file in the same Bun process.
}

describe("paginationVariants", () => {
  it("returns default classes", () => {
    const classes = paginationVariants();
    expect(classes).toContain("flex");
    expect(classes).toContain("w-full");
  });
});

describe("Pagination", () => {
  it("renders pagination wrapper with data-slot", () => {
    const output = markup(Pagination({}));
    expect(output).toContain('data-slot="pagination"');
  });

  it("renders info and controls by default", () => {
    const output = markup(Pagination({ page: 1, perPage: 10, totalCount: 100 }));
    expect(output).toContain('data-slot="pagination-info"');
    expect(output).toContain('data-slot="pagination-controls"');
  });

  it("shows page range in info", () => {
    const output = markup(Pagination({ page: 2, perPage: 10, totalCount: 25 }));
    expect(output).toContain("11-20");
    expect(output).toContain("25");
  });

  it("disables previous on first page", () => {
    const output = markup(Pagination({ page: 1, perPage: 10, totalCount: 100 }));
    expect(output).toContain('data-pagination-action="previous"');
    expect(output).toContain("disabled");
  });

  it("disables next on last page", () => {
    const output = markup(Pagination({ page: 10, perPage: 10, totalCount: 100 }));
    expect(output).toContain('data-pagination-action="next"');
    expect(output).toContain("disabled");
  });

  it("renders simple controls", () => {
    const output = markup(
      Pagination({ controls: "simple", page: 2, perPage: 10, totalCount: 100 }),
    );
    expect(output).not.toContain('data-pagination-action="first"');
    expect(output).not.toContain('data-pagination-action="last"');
  });

  it("sets data attributes", () => {
    const output = markup(Pagination({ page: 3, perPage: 10, totalCount: 50 }));
    expect(output).toContain('data-page="3"');
    expect(output).toContain('data-per-page="10"');
    expect(output).toContain('data-total-count="50"');
  });

  it("merges custom class and className", () => {
    const output = markup(Pagination({ class: "a", className: "b" }));
    expect(output).toContain("a");
    expect(output).toContain("b");
  });
});

describe("Pagination.Info", () => {
  it("renders with data-slot", () => {
    const output = markup(Pagination.Info({}));
    expect(output).toContain('data-slot="pagination-info"');
  });
});

describe("Pagination.Controls", () => {
  it("renders with data-slot", () => {
    const output = markup(Pagination.Controls({}));
    expect(output).toContain('data-slot="pagination-controls"');
  });
});

describe("Pagination.PageSize", () => {
  it("renders with data-slot", () => {
    const output = markup(Pagination.PageSize({ value: 25 }));
    expect(output).toContain('data-slot="pagination-page-size"');
  });
});

describe("Pagination interactions (onPageChange)", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
  const tick = () => new Promise<void>((r) => queueMicrotask(() => r()));

  it("calls onPageChange once when next is clicked", async () => {
    const calls: number[] = [];
    const panel = ilha(
      () =>
        html`${Pagination({
          page: 1,
          perPage: 10,
          totalCount: 100,
          onPageChange: (p) => calls.push(p),
        })}`,
    );

    await mountSsr({ Panel: panel }, "Panel");
    await frame();
    await tick();

    const next = document.querySelector('[data-pagination-action="next"]') as HTMLElement | null;
    expect(next).not.toBeNull();
    next?.click();
    await tick();

    expect(calls).toEqual([2]);
  });

  it("fires onPageSizeChange once when the page-size select changes", async () => {
    const calls: number[] = [];
    const panel = ilha(
      () =>
        html`${Pagination({
          page: 1,
          perPage: 10,
          totalCount: 100,
          onPageSizeChange: (s) => calls.push(s),
          children: [
            Pagination.Controls({ page: 1, perPage: 10, totalCount: 100 }),
            Pagination.PageSize({ value: 10, options: [10, 25, 50] }),
          ],
        })}`,
    );

    await mountSsr({ Panel: panel }, "Panel");
    await frame();
    await tick();

    const select = document.querySelector(
      "[data-pagination-page-size]",
    ) as HTMLSelectElement | null;
    expect(select).not.toBeNull();
    if (select) {
      select.value = "25";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
    await tick();
    expect(calls).toEqual([25]);
  });
});
