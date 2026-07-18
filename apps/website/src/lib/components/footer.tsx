import ilha from "ilha";
import { Link } from "areia";

export const Footer = ilha.render(() => (
  <footer class="border-t border-areia-border bg-areia-background">
    <div class="container mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <p class="text-sm text-areia-subtle">
        Areia — handcrafted UI for{" "}
        <Link
          href="https://ilha.build"
          external
          variant="plain"
          class="underline underline-offset-4"
        >
          Ilha
        </Link>
        .
      </p>
      <div class="flex flex-wrap gap-4 text-sm">
        <Link
          href="/components/getting-started"
          variant="plain"
          class="text-areia-subtle hover:text-areia-foreground"
        >
          Docs
        </Link>
        <Link
          href="https://github.com/ilhajs/areia"
          external
          variant="plain"
          class="text-areia-subtle hover:text-areia-foreground"
        >
          GitHub
        </Link>
        <Link
          href="https://discord.gg/WnVTMCTz74"
          external
          variant="plain"
          class="text-areia-subtle hover:text-areia-foreground"
        >
          Discord
        </Link>
      </div>
    </div>
  </footer>
));
