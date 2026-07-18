import { Badge, ClipboardText, Icon, LinkButton } from "areia";
import ilha from "ilha";
import { Book, Boxes, Code2, Sparkles, Type } from "lucide";
import { Footer } from "$lib/components/footer";
import { Topbar } from "$lib/components/topbar";
import { KitchenSinkGrid } from "$lib/kitchen-sink";
import { Icon as SocialIcon } from "imprensa/icons";

const features = [
  {
    icon: Sparkles,
    title: "Import first, eject later",
    body: "Ship quickly with ready-made components, then copy the source when a piece needs custom behavior.",
  },
  {
    icon: Boxes,
    title: "Built for Ilha",
    body: "Components, primitives, and docs follow Ilha conventions from day one — JSX or html literals.",
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
];

export default ilha.render(() => (
  <div class="flex min-h-screen flex-col bg-areia-surface-elevated/50 text-areia-foreground">
    <Topbar />

    <main class="flex-1">
      <section class="container mx-auto mt-16 max-w-6xl px-5 pt-6 pb-12 sm:mt-0 sm:px-6 sm:pt-16 sm:pb-16 lg:px-8 lg:pt-24 lg:pb-20">
        <div class="grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
          <div class="flex flex-col gap-6 sm:gap-7">
            <Badge variant="outline" class="w-fit">
              By the creators of Ilha
            </Badge>
            <div class="space-y-4 sm:space-y-5">
              <h1 class="text-balance text-[1.85rem] leading-[1.12] font-semibold tracking-tight sm:text-4xl sm:leading-[1.08] lg:text-[2.75rem] lg:leading-[1.06]">
                Handcrafted UI for Ilha
              </h1>
              <p class="text-areia-subtle max-w-xl text-balance text-[0.975rem] leading-[1.65] sm:text-lg sm:leading-7">
                A practical UI kit for building Ilha apps faster — without giving up ownership of
                your components. Import first, eject later.
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
                icon={<SocialIcon icon="github" class="size-5 shrink-0" />}
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

      <section class="container mx-auto max-w-6xl px-5 pb-20 sm:px-6 sm:pb-28 lg:px-8">
        <div class="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
          <div class="max-w-2xl space-y-2">
            <h2 class="text-xl font-semibold tracking-tight sm:text-2xl">Try the full set</h2>
            <p class="text-areia-subtle text-sm leading-relaxed sm:text-[0.9375rem]">
              Every Areia component in one place — click around, then open a title when you want the
              full API and examples.
            </p>
          </div>
          <LinkButton href="/components/getting-started" variant="outline" class="shrink-0">
            Getting started
          </LinkButton>
        </div>

        <KitchenSinkGrid />
      </section>
    </main>

    <Footer />
  </div>
));
