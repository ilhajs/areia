import { ilha } from "ilha";
import { Button, HoverCard, Icon } from "areia";
import { CalendarDays, Info, Mail, User } from "lucide";

export const Demo1 = ilha(() => (
  <HoverCard
    content={
      <div class="flex w-64 flex-col gap-2">
        <HoverCard.Title>Upcoming release</HoverCard.Title>
        <HoverCard.Description>
          The next major version ships with improved performance and new primitives.
        </HoverCard.Description>
      </div>
    }
  >
    <Button shape="square" icon={<Icon icon={CalendarDays} />} aria-label="Release notes" />
  </HoverCard>
));

export const Demo2 = ilha(() => (
  <HoverCard
    content={
      <div class="flex flex-col gap-1">
        <HoverCard.Title>Pro tip</HoverCard.Title>
        <HoverCard.Description>
          Hover cards are great for previewing content without a click.
        </HoverCard.Description>
      </div>
    }
  >
    <Button>Hover me</Button>
  </HoverCard>
));

export const Demo3 = ilha(() => (
  <HoverCard
    content={
      <div class="flex flex-col gap-1">
        <HoverCard.Title>Did you know?</HoverCard.Title>
        <HoverCard.Description>
          Hover cards support interactive content inside the popup.
        </HoverCard.Description>
      </div>
    }
  >
    <Button
      variant="secondary"
      shape="square"
      icon={<Icon icon={Info} />}
      aria-label="More information"
    />
  </HoverCard>
));

export const Demo4 = ilha(() => (
  <HoverCard
    triggerAs="span"
    triggerClass="underline decoration-dotted underline-offset-4"
    content={
      <div class="flex flex-col gap-1">
        <HoverCard.Title>Areia</HoverCard.Title>
        <HoverCard.Description>
          A vanilla TypeScript component library built for Astro and Ilha.
        </HoverCard.Description>
      </div>
    }
  >
    Areia
  </HoverCard>
));

export const Demo5 = ilha(() => (
  <div class="flex items-center gap-2">
    <HoverCard
      content={
        <div class="flex flex-col gap-1">
          <HoverCard.Title>Calendar</HoverCard.Title>
          <HoverCard.Description>View upcoming events.</HoverCard.Description>
        </div>
      }
    >
      <Button shape="square" icon={<Icon icon={CalendarDays} />} aria-label="Calendar" />
    </HoverCard>
    <HoverCard
      content={
        <div class="flex flex-col gap-1">
          <HoverCard.Title>Messages</HoverCard.Title>
          <HoverCard.Description>Check your inbox.</HoverCard.Description>
        </div>
      }
    >
      <Button shape="square" icon={<Icon icon={Mail} />} aria-label="Messages" />
    </HoverCard>
    <HoverCard
      content={
        <div class="flex flex-col gap-1">
          <HoverCard.Title>Profile</HoverCard.Title>
          <HoverCard.Description>Manage your account.</HoverCard.Description>
        </div>
      }
    >
      <Button shape="square" icon={<Icon icon={User} />} aria-label="Profile" />
    </HoverCard>
  </div>
));

export const Demo6 = ilha(() => (
  <div class="grid grid-cols-2 gap-3">
    <HoverCard side="top" content={<HoverCard.Description>Top hover-card</HoverCard.Description>}>
      <Button>Top</Button>
    </HoverCard>
    <HoverCard
      side="bottom"
      content={<HoverCard.Description>Bottom hover-card</HoverCard.Description>}
    >
      <Button>Bottom</Button>
    </HoverCard>
    <HoverCard side="left" content={<HoverCard.Description>Left hover-card</HoverCard.Description>}>
      <Button>Left</Button>
    </HoverCard>
    <HoverCard
      side="right"
      content={<HoverCard.Description>Right hover-card</HoverCard.Description>}
    >
      <Button>Right</Button>
    </HoverCard>
  </div>
));

export const Demo7 = ilha(() => (
  <div class="flex items-center gap-3">
    <HoverCard align="start" content={<HoverCard.Description>Start aligned</HoverCard.Description>}>
      <Button>Start</Button>
    </HoverCard>
    <HoverCard
      align="center"
      content={<HoverCard.Description>Center aligned</HoverCard.Description>}
    >
      <Button>Center</Button>
    </HoverCard>
    <HoverCard align="end" content={<HoverCard.Description>End aligned</HoverCard.Description>}>
      <Button>End</Button>
    </HoverCard>
  </div>
));

export const Demo8 = ilha(() => (
  <div class="flex flex-wrap items-center gap-3">
    <HoverCard
      delay={1000}
      content={<HoverCard.Description>Opens after one second</HoverCard.Description>}
    >
      <Button>1s delay</Button>
    </HoverCard>
    <HoverCard
      delay={0}
      closeDelay={0}
      skipDelayDuration={0}
      content={
        <HoverCard.Description>
          Opens and closes instantly with no warm-up window
        </HoverCard.Description>
      }
    >
      <Button>Instant</Button>
    </HoverCard>
  </div>
));

export const Demo9 = ilha(() => (
  <HoverCard
    content={
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-3">
          <div class="flex size-9 items-center justify-center rounded-full bg-areia-surface-muted text-sm font-medium">
            JD
          </div>
          <div>
            <HoverCard.Title>Jane Doe</HoverCard.Title>
            <HoverCard.Description>Product Designer</HoverCard.Description>
          </div>
        </div>
        <div class="flex gap-2">
          <Button size="sm">Follow</Button>
        </div>
      </div>
    }
  >
    <Button>User preview</Button>
  </HoverCard>
));

export const Demo10 = ilha(() => (
  <HoverCard.Static content="Static hover-card markup" triggerAs="span">
    Hover me
  </HoverCard.Static>
));
