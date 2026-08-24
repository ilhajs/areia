import { ilha } from "ilha";
import { Button, Icon, Tooltip } from "areia";
import { Info, Languages, Plus, Settings } from "lucide";

export const Demo1 = ilha.render(() => (
  <Tooltip content="Create project">
    <Button shape="square" icon={<Icon icon={Plus} />} aria-label="Create project" />
  </Tooltip>
));

export const Demo2 = ilha.render(() => (
  <Tooltip content="Helpful contextual information">
    <Button>Hover me</Button>
  </Tooltip>
));

export const Demo3 = ilha.render(() => (
  <Tooltip content="This action cannot be undone.">
    <Button
      variant="secondary"
      shape="square"
      icon={<Icon icon={Info} />}
      aria-label="More information"
    />
  </Tooltip>
));

export const Demo4 = ilha.render(() => (
  <Tooltip
    triggerAs="span"
    triggerClass="underline decoration-dotted underline-offset-4"
    content="Areia is a vanilla TypeScript component library."
  >
    Areia
  </Tooltip>
));

export const Demo5 = ilha.render(() => (
  <div class="flex items-center gap-2">
    <Tooltip content="Create project">
      <Button shape="square" icon={<Icon icon={Plus} />} aria-label="Create project" />
    </Tooltip>
    <Tooltip content="Translate">
      <Button shape="square" icon={<Icon icon={Languages} />} aria-label="Translate" />
    </Tooltip>
    <Tooltip content="Settings">
      <Button shape="square" icon={<Icon icon={Settings} />} aria-label="Settings" />
    </Tooltip>
  </div>
));

export const Demo6 = ilha.render(() => (
  <div class="grid grid-cols-2 gap-3">
    <Tooltip side="top" content="Top tooltip">
      <Button>Top</Button>
    </Tooltip>
    <Tooltip side="bottom" content="Bottom tooltip">
      <Button>Bottom</Button>
    </Tooltip>
    <Tooltip side="left" content="Left tooltip">
      <Button>Left</Button>
    </Tooltip>
    <Tooltip side="right" content="Right tooltip">
      <Button>Right</Button>
    </Tooltip>
  </div>
));

export const Demo7 = ilha.render(() => (
  <div class="flex items-center gap-3">
    <Tooltip align="start" content="Start aligned">
      <Button>Start</Button>
    </Tooltip>
    <Tooltip align="center" content="Center aligned">
      <Button>Center</Button>
    </Tooltip>
    <Tooltip align="end" content="End aligned">
      <Button>End</Button>
    </Tooltip>
  </div>
));

export const Demo8 = ilha.render(() => (
  <div class="flex flex-wrap items-center gap-3">
    <Tooltip delay={1000} content="Opens after one second">
      <Button>1s delay</Button>
    </Tooltip>
    <Tooltip delay={0} skipDelayDuration={0} content="Opens instantly with no warm-up window">
      <Button>Instant</Button>
    </Tooltip>
  </div>
));

export const Demo9 = ilha.render(() => (
  <Tooltip arrow={false} content="No arrow">
    <Button>Hover me</Button>
  </Tooltip>
));

export const Demo10 = ilha.render(() => (
  <Tooltip
    content={
      <div class="flex max-w-48 flex-col gap-1">
        <span class="font-medium">Deploy preview</span>
        <span class="text-areia-subtle">Creates a temporary preview environment.</span>
      </div>
    }
  >
    <Button>Deploy</Button>
  </Tooltip>
));

export const Demo11 = ilha.render(() => (
  <Tooltip.Static content="Static tooltip markup" triggerAs="span">
    Hover me
  </Tooltip.Static>
));
