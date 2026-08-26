import { ilha } from "ilha";
import { Link } from "areia";

export const Demo1 = ilha(() => (
  <div class="flex flex-wrap items-center gap-4 text-areia-default">
    <Link href="#">Default inline link</Link>
    <Link href="#" variant="current">
      Current color link
    </Link>
    <Link href="#" variant="plain">
      Plain inline link
    </Link>
  </div>
));

export const Demo2 = ilha(() => (
  <p class="text-areia-default">
    Read our <Link href="/docs">documentation</Link> for more details.
  </p>
));

export const Demo3 = ilha(() => (
  <p class="max-w-prose text-areia-default">
    This is a paragraph with an
    <Link href="#">inline link</Link> that flows naturally with the surrounding text. Links maintain
    proper underline offset for readability.
  </p>
));

export const Demo4 = ilha(() => (
  <Link href="https://kumo-ui.com" external>
    Visit Kumo UI
    <Link.ExternalIcon />
  </Link>
));

export const Demo5 = ilha(() => (
  <p class="text-areia-destructive-soft-foreground">
    This error message contains a
    <Link href="#" variant="current">
      link
    </Link>
    that inherits the red color from its parent.
  </p>
));

export const Demo6 = ilha(() => (
  <nav class="flex flex-wrap gap-4">
    <Link href="#" variant="plain">
      Overview
    </Link>
    <Link href="#" variant="plain">
      Components
    </Link>
    <Link href="#" variant="plain">
      Guides
    </Link>
  </nav>
));

export const Demo7 = ilha(() => (
  <Link href="#" class="font-medium decoration-dashed">
    Custom styled link
  </Link>
));

export const Demo8 = ilha(() => (
  <Link href="https://example.com" external>
    External Site
    <Link.ExternalIcon class="size-4" />
  </Link>
));
