import ilha from "ilha";
import { Link, LinkButton } from "areia";
import { LogoButton, SearchNavbarTrigger, ThemeToggle } from "imprensa/components";
import { Icon } from "imprensa/icons";
import { socials } from "imprensa/config";

export const Topbar = ilha.render(() => (
  <header class="sticky top-0 z-50 border-b border-areia-border bg-areia-background/80 backdrop-blur-lg">
    <div class="container mx-auto flex h-14 max-w-6xl min-w-0 items-center justify-between gap-3 px-4">
      <div class="flex shrink-0 items-center gap-4">
        <LogoButton />
        <nav class="hidden sm:flex items-center gap-3">
          <Link
            href="/components/getting-started"
            variant="plain"
            class="text-areia-foreground/80 text-sm"
          >
            Components
          </Link>
          <Link
            href="/primitives/accordion"
            variant="plain"
            class="text-areia-foreground/80 text-sm"
          >
            Primitives
          </Link>
        </nav>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <SearchNavbarTrigger />
        <div class="hidden md:flex">
          <ThemeToggle />
        </div>
        <div class="flex items-center">
          {socials.map((s) => (
            <LinkButton
              href={s.url}
              shape="square"
              icon={<Icon icon={s.service} class="size-4" />}
              external
              aria-label={s.service}
            />
          ))}
        </div>
      </div>
    </div>
  </header>
));
