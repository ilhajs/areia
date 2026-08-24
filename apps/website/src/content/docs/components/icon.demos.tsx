import { ilha } from "ilha";
import { CircleCheck, CircleX, Info, Plus, TriangleAlert } from "lucide";
import { Button, Icon } from "areia";

export const Demo1 = ilha.render(() => (
  <div class="flex flex-wrap items-center gap-3 text-areia-default">
    <Icon icon={Info} />
    <Icon icon={CircleCheck} class="text-areia-success" />
    <Icon icon={TriangleAlert} class="text-areia-warning-soft-foreground" />
  </div>
));

export const Demo2 = ilha.render(() => <Icon icon={Info} />);

export const Demo3 = ilha.render(() => (
  <div class="flex items-center gap-3 text-areia-default">
    <Icon icon={Info} class="size-3" />
    <Icon icon={Info} />
    <Icon icon={Info} class="size-5" />
    <Icon icon={Info} class="size-6" />
  </div>
));

export const Demo4 = ilha.render(() => (
  <div class="flex items-center gap-3">
    <Icon icon={Info} class="text-areia-info-soft-foreground" />
    <Icon icon={CircleCheck} class="text-areia-success-soft-foreground" />
    <Icon icon={TriangleAlert} class="text-areia-warning-soft-foreground" />
    <Icon icon={CircleX} class="text-areia-destructive-soft-foreground" />
  </div>
));

export const Demo5 = ilha.render(() => (
  <div class="flex items-center gap-3 text-areia-default">
    <Icon icon={Info} strokeWidth={1} />
    <Icon icon={Info} strokeWidth={1.75} />
    <Icon icon={Info} strokeWidth={2.5} />
  </div>
));

export const Demo6 = ilha.render(() => <Icon icon={CircleCheck} label="Success" />);

export const Demo7 = ilha.render(() => (
  <Button variant="secondary" icon={<Icon icon={Plus} />}>
    Create item
  </Button>
));

export const Demo8 = ilha.render(() => (
  <Button variant="secondary" shape="square" icon={<Icon icon={Plus} />} aria-label="Create item" />
));
