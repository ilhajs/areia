import ilha from "ilha";
import { Badge } from "areia";

export const Demo1 = ilha.render(() => (
  <div class="flex flex-wrap items-center gap-2">
    <Badge variant="primary">Primary</Badge>
    <Badge variant="secondary">Secondary</Badge>
    <Badge variant="error">Error</Badge>
    <Badge variant="success">Success</Badge>
    <Badge variant="warning">Warning</Badge>
    <Badge variant="info">Info</Badge>
    <Badge variant="outline">Outline</Badge>
    <Badge variant="beta">Beta</Badge>
  </div>
));

export const Demo2 = ilha.render(() => <Badge>New</Badge>);

export const Demo3 = ilha.render(() => (
  <div class="flex flex-wrap items-center gap-2">
    <Badge variant="primary">Primary</Badge>
    <Badge variant="secondary">Secondary</Badge>
    <Badge variant="error">Error</Badge>
    <Badge variant="success">Success</Badge>
    <Badge variant="warning">Warning</Badge>
    <Badge variant="info">Info</Badge>
    <Badge variant="outline">Outline</Badge>
    <Badge variant="beta">Beta</Badge>
  </div>
));

export const Demo4 = ilha.render(() => (
  <div class="flex flex-wrap items-center gap-2">
    <Badge variant="neutral">Neutral</Badge>
    <Badge variant="red">Red</Badge>
    <Badge variant="orange">Orange</Badge>
    <Badge variant="green">Green</Badge>
    <Badge variant="teal">Teal</Badge>
    <Badge variant="teal-subtle">Teal Subtle</Badge>
    <Badge variant="blue">Blue</Badge>
    <Badge variant="purple">Purple</Badge>
  </div>
));

export const Demo5 = ilha.render(() => (
  <p class="flex items-center gap-2 text-areia-default">
    Ilha Islands
    <Badge variant="success">Stable</Badge>
  </p>
));
