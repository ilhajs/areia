/** @jsxImportSource ilha */
import { Badge, Button, ClipboardText, LayerCard, Link, LinkButton } from "areia";
import ilha, { raw } from "ilha";
import componentsMeta from "./components/_meta.json";
import primitivesMeta from "./primitives/_meta.json";

const GH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12c0 5.303 3.438 9.8 8.205 11.385c.6.113.82-.258.82-.577c0-.285-.01-1.04-.015-2.04c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729c1.205.084 1.838 1.236 1.838 1.236c1.07 1.835 2.809 1.305 3.495.998c.108-.776.417-1.305.76-1.605c-2.665-.3-5.466-1.332-5.466-5.93c0-1.31.465-2.38 1.235-3.22c-.135-.303-.54-1.523.105-3.176c0 0 1.005-.322 3.3 1.23c.96-.267 1.98-.399 3-.405c1.02.006 2.04.138 3 .405c2.28-1.552 3.285-1.23 3.285-1.23c.645 1.653.24 2.873.12 3.176c.765.84 1.23 1.91 1.23 3.22c0 4.61-2.805 5.625-5.475 5.92c.42.36.81 1.096.81 2.22c0 1.606-.015 2.896-.015 3.286c0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg>`;

const labelFromSlug = (slug: string) =>
  slug
    .split("-")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");

const components = componentsMeta
  .slice(1)
  .filter((item) => typeof item === "string")
  .map((slug) => ({
    label: labelFromSlug(slug),
    href: `/components/${slug}`,
  }));

const primitives = primitivesMeta
  .slice(1)
  .filter((item) => typeof item === "string")
  .map((slug) => ({
    label: labelFromSlug(slug),
    href: `/primitives/${slug}`,
  }));

export default ilha.render(() => (
  <div class="container mx-auto max-w-2xl mt-20 flex flex-col gap-8 p-4">
    <section class="flex flex-col gap-4">
      <p class="text-sm text-muted-foreground">By the creators of Ilha</p>
      <h2 class="text-3xl font-semibold tracking-tight">Handcrafted UI for Ilha</h2>
      <p class="text-muted-foreground text-balance">
        A practical UI kit for building Ilha apps faster, without giving up ownership of your
        components.
      </p>
      <div class="flex gap-2 items-center">
        <LinkButton
          href="/components/getting-started"
          variant="primary"
          class="bg-neutral-900 hover:bg-neutral-700 dark:bg-neutral-100 dark:hover:bg-neutral-300 dark:text-neutral-900!"
        >
          Get Started
        </LinkButton>
        <LinkButton
          variant="secondary"
          href="https://github.com/ilhajs/areia"
          icon={raw(GH_ICON)}
          external
        >
          View on GitHub
        </LinkButton>
      </div>
      <ClipboardText text="npm install areia" class="max-w-100" />
      <div class="flex flex-col gap-3 pt-4">
        <h3 class="text-lg font-semibold">Features</h3>
        <ul class="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
          <li>
            <span class="font-medium text-foreground">Import first, eject later:</span> ship
            quickly, then copy the source when a component needs custom behavior.
          </li>
          <li>
            <span class="font-medium text-foreground">Built for Ilha:</span> components, primitives,
            and docs follow Ilha conventions from the start.
          </li>
          <li>
            <span class="font-medium text-foreground">Vanilla TypeScript core:</span>{" "}
            framework-light implementation you can read, change, and own.
          </li>
          <li>
            <span class="font-medium text-foreground">Two authoring styles:</span> use JSX or html
            literal templates in the same design system.
          </li>
          <li>
            <span class="font-medium text-foreground">Tailwind-native styling:</span> easy to theme,
            override, and adapt without fighting generated CSS.
          </li>
        </ul>
      </div>
    </section>
    <LayerCard>
      <LayerCard.Title>
        <span>Components</span>
        <Badge variant="outline">{components.length}</Badge>
      </LayerCard.Title>
      <LayerCard.Content class="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {components.map((component) => (
          <LinkButton variant="ghost" href={component.href}>
            {component.label}
          </LinkButton>
        ))}
      </LayerCard.Content>
    </LayerCard>
    <LayerCard>
      <LayerCard.Title>
        <span>Primitives</span>
        <Badge variant="outline">{primitives.length}</Badge>
      </LayerCard.Title>
      <LayerCard.Content class="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {primitives.map((primitive) => (
          <LinkButton variant="ghost" href={primitive.href}>
            {primitive.label}
          </LinkButton>
        ))}
      </LayerCard.Content>
    </LayerCard>
  </div>
));
