import ilha from "ilha";
import { Bold, ExternalLink, Italic, Plus, Underline } from "lucide";
import { Button, ButtonGroup, Icon, LinkButton } from "areia";

export const Demo1 = ilha.render(() => (
  <div class="flex flex-wrap items-center gap-2">
    <Button variant="secondary">Button</Button>
    <Button variant="secondary" shape="square" icon={<Icon icon={Plus} />} aria-label="Add" />
  </div>
));

export const Demo2 = ilha.render(() => <Button variant="secondary">Click me</Button>);

export const Demo3 = ilha.render(() => <Button variant="primary">Primary</Button>);

export const Demo4 = ilha.render(() => <Button variant="secondary">Secondary</Button>);

export const Demo5 = ilha.render(() => <Button variant="ghost">Ghost</Button>);

export const Demo6 = ilha.render(() => <Button variant="destructive">Destructive</Button>);

export const Demo7 = ilha.render(() => <Button variant="outline">Outline</Button>);

export const Demo8 = ilha.render(() => (
  <Button variant="secondary-destructive">Secondary Destructive</Button>
));

export const Demo9 = ilha.render(() => (
  <div class="flex flex-wrap items-center gap-3">
    <Button size="xs" variant="secondary">
      Extra Small
    </Button>
    <Button size="sm" variant="secondary">
      Small
    </Button>
    <Button size="base" variant="secondary">
      Base
    </Button>
    <Button size="lg" variant="secondary">
      Large
    </Button>
  </div>
));

export const Demo10 = ilha.render(() => (
  <Button variant="secondary" icon={<Icon icon={Plus} />}>
    Create Ilha app
  </Button>
));

export const Demo11 = ilha.render(() => (
  <div class="flex flex-wrap items-center gap-3">
    <Button variant="secondary" shape="square" icon={<Icon icon={Plus} />} aria-label="Add item" />
    <Button variant="secondary" shape="circle" icon={<Icon icon={Plus} />} aria-label="Add item" />
  </div>
));

export const Demo12 = ilha.render(() => (
  <Button variant="primary" loading>
    Loading...
  </Button>
));

export const Demo13 = ilha.render(() => (
  <Button variant="secondary" disabled>
    Disabled
  </Button>
));

export const Demo14 = ilha.render(() => (
  <div class="flex flex-wrap items-center gap-3">
    <Button variant="secondary" title="Create a new Ilha app">
      Create Ilha app
    </Button>
    <Button
      variant="secondary"
      shape="square"
      icon={<Icon icon={Plus} />}
      aria-label="Add item"
      title="Add item"
    />
  </div>
));

export const Demo15 = ilha.render(() => (
  <ButtonGroup aria-label="Text formatting">
    <Button variant="outline" shape="square" icon={<Icon icon={Bold} />} aria-label="Bold" />
    <Button variant="outline" shape="square" icon={<Icon icon={Italic} />} aria-label="Italic" />
    <Button
      variant="outline"
      shape="square"
      icon={<Icon icon={Underline} />}
      aria-label="Underline"
    />
  </ButtonGroup>
));

export const Demo16 = ilha.render(() => (
  <ButtonGroup>
    <Button variant="outline">Back</Button>
    <ButtonGroup.Separator />
    <ButtonGroup.Text>Page 1</ButtonGroup.Text>
    <ButtonGroup.Separator />
    <Button variant="outline">Next</Button>
  </ButtonGroup>
));

export const Demo17 = ilha.render(() => (
  <div class="flex flex-wrap items-center gap-3">
    <LinkButton href="/components/link" variant="secondary">
      Read Link docs
    </LinkButton>
    <LinkButton
      href="https://ilha.build/"
      variant="ghost"
      icon={<Icon icon={ExternalLink} />}
      external
    >
      Ilha Docs
    </LinkButton>
  </div>
));
