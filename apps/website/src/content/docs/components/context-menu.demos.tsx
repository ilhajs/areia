import { ilha } from "ilha";
import { ContextMenu } from "areia";

export const Demo1 = ilha.render(() => (
  <ContextMenu
    trigger={
      <div class="rounded-lg border border-dashed border-areia-border p-8 text-center text-areia-subtle">
        Right click here
      </div>
    }
  >
    <ContextMenu.Item value="copy" label="Copy" />
    <ContextMenu.Item value="paste" label="Paste" />
  </ContextMenu>
));

export const Demo2 = ilha.render(() => (
  <ContextMenu>
    <ContextMenu.Trigger>
      <button class="rounded-lg bg-areia-control-background px-3 py-2 ring ring-areia-control-border">
        Right click me
      </button>
    </ContextMenu.Trigger>
    <ContextMenu.Content>
      <ContextMenu.Item value="rename" label="Rename" />
      <ContextMenu.Item value="duplicate" label="Duplicate" />
      <ContextMenu.Item value="delete" label="Delete" />
    </ContextMenu.Content>
  </ContextMenu>
));

export const Demo3 = ilha.render(() => (
  <ContextMenu
    trigger={
      <div class="rounded-lg bg-areia-surface-muted p-6 text-areia-default">
        Right click this card
      </div>
    }
  >
    <ContextMenu.Item value="open" label="Open" />
    <ContextMenu.Item value="copy-link" label="Copy link" />
    <ContextMenu.Item value="archive" label="Archive" />
  </ContextMenu>
));

export const Demo4 = ilha.render(() => (
  <ContextMenu
    closeOnSelect={false}
    trigger={
      <div class="rounded-lg border border-areia-border p-6">Right click for view options</div>
    }
  >
    <ContextMenu.CheckboxItem value="show-hidden" label="Show hidden files" />
    <ContextMenu.CheckboxItem value="show-sidebar" label="Show sidebar" checked />
  </ContextMenu>
));

export const Demo5 = ilha.render(() => (
  <ContextMenu trigger={<div class="rounded-lg bg-areia-surface-muted p-6">Right click</div>}>
    <ContextMenu.Item value="cut" label="Cut" />
    <ContextMenu.Item value="paste" label="Paste" disabled />
  </ContextMenu>
));
