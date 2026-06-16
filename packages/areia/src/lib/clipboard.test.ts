import { describe, expect, it } from "bun:test";
import { BREADCRUMBS_CLIPBOARD_INLINE_ONCLICK, CLIPBOARD_TEXT_INLINE_ONCLICK } from "./clipboard";

describe("clipboard inline handlers", () => {
  it("ClipboardText handler avoids double-quoted data-slot inside onclick attribute", () => {
    expect(CLIPBOARD_TEXT_INLINE_ONCLICK).toContain("[data-slot=\\'clipboard-text\\']");
    expect(CLIPBOARD_TEXT_INLINE_ONCLICK).not.toContain('[data-slot="clipboard-text"]');
    expect(CLIPBOARD_TEXT_INLINE_ONCLICK).toContain("document.execCommand('copy')");
    expect(CLIPBOARD_TEXT_INLINE_ONCLICK).toContain(".catch(function(){");
  });

  it("Breadcrumbs handler includes execCommand fallback on clipboard API failure", () => {
    expect(BREADCRUMBS_CLIPBOARD_INLINE_ONCLICK).toContain("document.execCommand('copy')");
    expect(BREADCRUMBS_CLIPBOARD_INLINE_ONCLICK).toContain(".bc-copy-icon");
    expect(BREADCRUMBS_CLIPBOARD_INLINE_ONCLICK).not.toMatch(/\.catch\(function\(\)\{\}\)/);
  });
});
