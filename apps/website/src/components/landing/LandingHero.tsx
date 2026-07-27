import { Badge, ClipboardText, Icon, LinkButton } from "areia";
import ilha from "ilha";
import { Book, Boxes, Code2, Sparkles, Type } from "lucide";

const features = [
  {
    icon: Sparkles,
    title: "Import first, eject later",
    body: "Ship quickly with ready-made components, then copy the source when a piece needs custom behavior.",
  },
  {
    icon: Boxes,
    title: "Built for Ilha",
    body: "Components, slots, and docs follow Ilha conventions from day one — JSX or html literals.",
  },
  {
    icon: Code2,
    title: "Vanilla TypeScript core",
    body: "Framework-light implementation you can read, change, and own without fighting generated CSS.",
  },
  {
    icon: Type,
    title: "Tailwind-native theming",
    body: "Design tokens map to utilities. Override --areia-* and restyle without a second design system.",
  },
] as const;

const GitHubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    class="size-5 shrink-0"
    aria-hidden="true"
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

export const LandingHero = ilha.render(() => (
  <section class="border-border border-b">
    <div class="mx-auto grid max-w-6xl items-start gap-10 px-5 py-16 sm:gap-14 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14 lg:px-8 lg:py-28">
      <div class="flex flex-col gap-6 sm:gap-7">
        <Badge variant="outline" class="w-fit">
          By the creators of Ilha
        </Badge>
        <div class="space-y-4 sm:space-y-5">
          <h1 class="text-balance text-[1.85rem] leading-[1.12] font-semibold tracking-tight sm:text-4xl sm:leading-[1.08] lg:text-[2.75rem] lg:leading-[1.06]">
            Handcrafted UI for Ilha
          </h1>
          <p class="text-areia-subtle max-w-xl text-balance text-[0.975rem] leading-[1.65] sm:text-lg sm:leading-7">
            A practical UI kit for building Ilha apps faster — without giving up ownership of your
            components. Import first, eject later.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <LinkButton
            href="/components/getting-started"
            variant="primary"
            icon={<Icon icon={Book} />}
          >
            Get Started
          </LinkButton>
          <LinkButton
            variant="secondary"
            href="https://github.com/ilhajs/areia"
            icon={<GitHubIcon />}
            external
          >
            View on GitHub
          </LinkButton>
        </div>

        <ClipboardText text="npm install areia" tooltip class="w-full max-w-md" />
      </div>

      <div class="border-areia-border bg-areia-background rounded-2xl border p-5 shadow-xs sm:p-6">
        <h2 class="mb-4 text-base font-semibold tracking-tight sm:text-lg">Why Areia</h2>
        <ul class="flex flex-col gap-4">
          {features.map((f) => (
            <li class="flex gap-3">
              <span class="bg-areia-control-background text-areia-default flex size-9 shrink-0 items-center justify-center rounded-lg ring ring-areia-border/70">
                <Icon icon={f.icon} class="size-4" />
              </span>
              <div class="min-w-0 space-y-0.5">
                <p class="text-sm font-medium text-areia-foreground sm:text-[0.9375rem]">
                  {f.title}
                </p>
                <p class="text-areia-subtle text-sm leading-relaxed">{f.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
));
