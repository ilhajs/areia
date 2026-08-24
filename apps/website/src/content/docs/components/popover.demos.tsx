import { ilha } from "ilha";
import { Bell } from "lucide";
import { Button, Icon, Popover } from "areia";

export const Demo1 = ilha.render(() => (
  <Popover
    trigger={<Button shape="square" icon={<Icon icon={Bell} />} aria-label="Notifications" />}
    content={
      <>
        <Popover.Title>Notifications</Popover.Title>
        <Popover.Description>You are all caught up. Good job!</Popover.Description>
      </>
    }
  />
));

export const Demo2 = ilha.render(() => (
  <Popover>
    <Popover.Trigger>
      <Button>Open</Button>
    </Popover.Trigger>
    <Popover.Content>
      <Popover.Title>Popover Title</Popover.Title>
      <Popover.Description>Popover content goes here.</Popover.Description>
    </Popover.Content>
  </Popover>
));

export const Demo3 = ilha.render(() => (
  <Popover
    trigger={<Button>Open Popover</Button>}
    content={
      <>
        <Popover.Title>Popover Title</Popover.Title>
        <Popover.Description>
          This is a basic popover with a title and description.
        </Popover.Description>
      </>
    }
  />
));

export const Demo4 = ilha.render(() => (
  <Popover
    trigger={<Button>Open Settings</Button>}
    content={
      <div class="flex flex-col gap-3">
        <div>
          <Popover.Title>Settings</Popover.Title>
          <Popover.Description>Configure your preferences below.</Popover.Description>
        </div>
        <Popover.Close class="w-max rounded-md bg-areia-control-background px-3 py-1.5 text-sm ring ring-areia-control-border">
          Close
        </Popover.Close>
      </div>
    }
  />
));

export const Demo5 = ilha.render(() => (
  <div class="grid grid-cols-2 gap-3">
    <Popover
      side="bottom"
      trigger={<Button>Bottom</Button>}
      content={
        <>
          <Popover.Title>Bottom</Popover.Title>
          <Popover.Description>Popover on bottom.</Popover.Description>
        </>
      }
    />
    <Popover
      side="top"
      trigger={<Button>Top</Button>}
      content={
        <>
          <Popover.Title>Top</Popover.Title>
          <Popover.Description>Popover on top.</Popover.Description>
        </>
      }
    />
    <Popover
      side="left"
      trigger={<Button>Left</Button>}
      content={
        <>
          <Popover.Title>Left</Popover.Title>
          <Popover.Description>Popover on left.</Popover.Description>
        </>
      }
    />
    <Popover
      side="right"
      trigger={<Button>Right</Button>}
      content={
        <>
          <Popover.Title>Right</Popover.Title>
          <Popover.Description>Popover on right.</Popover.Description>
        </>
      }
    />
  </div>
));

export const Demo6 = ilha.render(() => (
  <div class="flex items-center gap-3">
    <Popover align="start" trigger={<Button>Start</Button>} content="Start aligned" />
    <Popover align="center" trigger={<Button>Center</Button>} content="Center aligned" />
    <Popover align="end" trigger={<Button>End</Button>} content="End aligned" />
  </div>
));

export const Demo7 = ilha.render(() => (
  <Popover
    trigger={<Button>User Profile</Button>}
    content={
      <div class="flex min-w-56 flex-col gap-4">
        <div class="flex items-center gap-3">
          <div class="flex size-9 items-center justify-center rounded-full bg-areia-surface-muted text-sm font-medium">
            JD
          </div>
          <div>
            <Popover.Title>Jane Doe</Popover.Title>
            <Popover.Description>jane@example.com</Popover.Description>
          </div>
        </div>
        <div class="flex gap-2">
          <Button size="sm">Profile</Button>
          <Popover.Close class="rounded-md px-2 text-sm text-areia-subtle hover:bg-areia-control-hover">
            Sign Out
          </Popover.Close>
        </div>
      </div>
    }
  />
));

export const Demo8 = ilha.render(() => (
  <Popover arrow={false} trigger={<Button>Open</Button>} content="This popover has no arrow." />
));

export const Demo9 = ilha.render(() => (
  <Popover
    closeOnClickOutside={false}
    trigger={<Button>Persistent</Button>}
    content={
      <>
        <Popover.Title>Persistent popover</Popover.Title>
        <Popover.Description>Click the close button to dismiss this popover.</Popover.Description>
        <Popover.Close class="mt-3 rounded-md bg-areia-control-background px-3 py-1.5 text-sm ring ring-areia-control-border">
          Close
        </Popover.Close>
      </>
    }
  />
));

export const Demo10 = ilha.render(() => (
  <Popover
    trigger={<button>Open</button>}
    triggerAs="button"
    content={
      <>
        <Popover.Title>Shortcut API</Popover.Title>
        <Popover.Description>
          Use props when you do not need to customize the slot structure.
        </Popover.Description>
      </>
    }
  />
));
