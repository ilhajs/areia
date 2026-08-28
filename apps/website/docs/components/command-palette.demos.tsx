import { html } from "ilha";
import { CommandPalette, type InputCommand } from "@areia/cmd";
import { z } from "zod";

const searchInput = z.object({
  query: z.string().min(1).default(""),
  limit: z.number().int().min(1).max(20).default(5),
});

const searchSettings = {
  id: "search_settings",
  label: "Search settings",
  description: "Find a setting by name.",
  group: "Actions",
  input: searchInput,
  defaultValues: { query: "", limit: 5 },
  submitLabel: "Search",
  webmcp: { description: "Search application settings." },
  run: ({ query, limit }: { query: string; limit: number }) => ({ ok: true, query, limit }),
} satisfies InputCommand<typeof searchInput>;

const AppCommands = CommandPalette(
  [
    {
      id: "refresh_dashboard",
      label: "Refresh dashboard",
      description: "Reload the latest dashboard data.",
      group: "Actions",
      keywords: ["reload", "sync"],
      shortcut: "⌘R",
      run: () => ({ ok: true, refreshedAt: new Date().toISOString() }),
      webmcp: { description: "Refresh the signed-in user's dashboard data." },
    },
    {
      id: "toggle_theme",
      label: "Toggle theme",
      group: "Actions",
      run: () => ({ ok: true }),
    },
    searchSettings,
    {
      id: "open_billing",
      label: "Open billing settings",
      group: "Navigation",
      keywords: ["subscription", "invoice"],
      href: "/settings/billing",
    },
    {
      id: "open_docs",
      label: "Open documentation",
      group: "Navigation",
      href: "https://ilha.build",
      external: true,
    },
    {
      id: "sign_out",
      label: "Sign out",
      group: "Account",
      run: () => ({ ok: true }),
    },
  ],
  {
    label: "Command palette",
    placeholder: "Type a command or search…",
    loop: true,
    hotkey: false,
    trigger: html`<button
      type="button"
      class="inline-flex h-9 items-center rounded-lg bg-areia-control-background px-3 text-sm text-areia-default ring ring-areia-control-border hover:bg-areia-control-hover"
    >
      Open commands
    </button>`,
  },
);

export const Demo1 = AppCommands;
