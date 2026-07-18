import { raw } from "ilha";
import type { JSX } from "ilha/jsx-runtime";
import { shikiThemes } from "imprensa/config";

type ImprensaShikiHighlighter = {
  loadLanguage: (lang: string) => Promise<void>;
  codeToHtml: (
    code: string,
    options: { lang: string; themes: { light: string; dark: string } },
  ) => string;
};

function escapeHtml(code: string) {
  return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;

const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;

export type PreviewProps = {
  /** Source shown under the live demo. */
  code: string;
  lang?: string;
  children?: JSX.Element | JSX.Element[] | string | number | boolean | null;
  class?: string;
  /** Hide the live canvas (code-only card). */
  codeOnly?: boolean;
  size?: "sm" | "md" | "lg";
};

/**
 * Combined live demo + source card for MDX.
 *
 * Source is plain SSR markup; Shiki + copy button wiring run on the client via
 * {@link enhanceAreiaCodePanels}.
 */
export function Preview(props: PreviewProps): JSX.Element {
  const size = props.size ?? "md";
  const lang = props.lang ?? "tsx";
  const codeOnly = props.codeOnly === true;
  const code = props.code ?? "";

  return (
    <div
      class={[
        "not-prose my-6 w-full overflow-hidden rounded-xl border border-areia-border",
        "bg-areia-background text-areia-foreground shadow-xs",
        props.class,
      ]}
    >
      {!codeOnly && (
        <div
          class={[
            "flex w-full flex-wrap items-center justify-center gap-3",
            // Taller canvas so layout demos (resizable, etc.) have room
            size === "sm" && "min-h-40 p-5",
            size === "md" && "min-h-64 p-6",
            size === "lg" && "min-h-96 p-8",
          ]}
        >
          {props.children}
        </div>
      )}
      <div
        class={[
          "relative max-w-full overflow-x-auto border-t border-areia-border",
          "bg-areia-surface-muted/60 text-xs leading-relaxed dark:bg-areia-surface-muted/30",
          "[&_pre]:!m-0 [&_pre]:overflow-x-auto [&_pre]:!bg-transparent [&_pre]:p-4 [&_pre]:pr-14 [&_pre]:text-xs [&_pre]:leading-relaxed",
          "[&_.shiki]:!bg-transparent",
        ]}
        data-areia-code-panel
        data-lang={lang}
      >
        {raw(
          `<button type="button" class="absolute top-2.5 right-2.5 z-10 inline-flex size-8 items-center justify-center rounded-md border border-areia-border bg-areia-background/90 text-areia-subtle shadow-xs backdrop-blur-sm transition-colors hover:bg-areia-control-background hover:text-areia-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-areia-ring" data-areia-copy-code aria-label="Copy code">${COPY_ICON}</button>` +
            `<pre class="m-0 overflow-x-auto p-4 pr-14 text-xs leading-relaxed"><code>${escapeHtml(code)}</code></pre>`,
        )}
      </div>
    </div>
  );
}

let shikiPromise: Promise<ImprensaShikiHighlighter> | null = null;

function getHighlighter() {
  return (shikiPromise ??= import("imprensa/shiki").then(({ shiki }) => {
    return shiki as ImprensaShikiHighlighter;
  }));
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

function bindCopyButton(panel: HTMLElement): void {
  const btn = panel.querySelector<HTMLButtonElement>("[data-areia-copy-code]");
  if (!btn || btn.dataset.bound === "1") return;
  btn.dataset.bound = "1";

  btn.addEventListener("click", async () => {
    const codeEl = panel.querySelector("code");
    const text = codeEl?.textContent ?? "";
    if (!text) return;

    const ok = await copyText(text);
    try {
      const { toast } = await import("areia/sonner");
      if (ok) toast.success("Copied to clipboard");
      else toast.error("Could not copy");
    } catch {
      /* toaster optional */
    }

    if (!ok) return;

    const prev = btn.innerHTML;
    btn.innerHTML = CHECK_ICON;
    btn.setAttribute("aria-label", "Copied");
    window.setTimeout(() => {
      btn.innerHTML = prev;
      btn.setAttribute("aria-label", "Copy code");
    }, 1600);
  });
}

/**
 * Highlight every `[data-areia-code-panel]` under `root` with imprensa Shiki,
 * and wire copy buttons.
 */
export async function enhanceAreiaCodePanels(root: ParentNode = document): Promise<void> {
  if (typeof document === "undefined") return;

  const panels = [...root.querySelectorAll<HTMLElement>("[data-areia-code-panel]")];
  if (panels.length === 0) return;

  for (const panel of panels) bindCopyButton(panel);

  const pending = panels.filter((p) => p.dataset.highlighted !== "1");
  if (pending.length === 0) return;

  let highlighter: ImprensaShikiHighlighter;
  try {
    highlighter = await getHighlighter();
  } catch {
    return;
  }

  const langs = new Set(pending.map((p) => p.dataset.lang || "tsx"));
  await Promise.all(
    [...langs].map((lang) => highlighter.loadLanguage(lang).catch(() => undefined)),
  );

  for (const panel of pending) {
    if (panel.dataset.highlighted === "1") continue;

    const codeEl = panel.querySelector("code");
    const code = codeEl?.textContent ?? "";
    if (!code) continue;

    const lang = panel.dataset.lang || "tsx";
    const copyBtn = panel.querySelector<HTMLElement>("[data-areia-copy-code]");

    try {
      const wrap = document.createElement("div");
      wrap.innerHTML = highlighter.codeToHtml(code, { lang, themes: shikiThemes });
      const highlighted = wrap.firstElementChild;
      if (!(highlighted instanceof HTMLElement)) continue;

      highlighted.classList.add("!m-0", "!bg-transparent", "text-xs", "leading-relaxed");
      highlighted.querySelectorAll("pre").forEach((pre) => {
        pre.classList.add(
          "!m-0",
          "!bg-transparent",
          "overflow-x-auto",
          "p-4",
          "pr-14",
          "text-xs",
          "leading-relaxed",
        );
        pre.style.backgroundColor = "transparent";
      });

      panel.replaceChildren();
      if (copyBtn) panel.appendChild(copyBtn);
      panel.appendChild(highlighted);
      panel.dataset.highlighted = "1";
      // re-bind if button was moved
      bindCopyButton(panel);
    } catch {
      /* keep plain fallback */
    }
  }
}

/** Observe SPA navigations / MDX swaps and enhance new panels. */
export function watchAreiaCodePanels(): () => void {
  if (typeof document === "undefined") return () => {};

  let scheduled = false;
  const run = () => {
    scheduled = false;
    void enhanceAreiaCodePanels(document);
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(run);
  };

  void enhanceAreiaCodePanels(document);

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  return () => observer.disconnect();
}
