import ilha from "ilha";
import { Collapsible } from "areia";

export const Demo1 = ilha.render(() => (
  <div class="w-full max-w-md">
    <Collapsible
      defaultOpen
      trigger="What is Areia?"
      panel="Areia is a vanilla TypeScript component library for building application interfaces."
    />
  </div>
));

export const Demo2 = ilha.render(() => (
  <Collapsible trigger="Show details" panel="Content revealed when the trigger is activated." />
));

export const Demo3 = ilha.render(() => (
  <Collapsible
    trigger="What is Areia?"
    panel="Areia provides accessible primitives and styled components for application UIs."
  />
));

export const Demo4 = ilha.render(() => (
  <Collapsible
    defaultOpen
    trigger="Deployment details"
    panel="The latest deployment completed successfully."
  />
));

export const Demo5 = ilha.render(() => (
  <Collapsible>
    <Collapsible.Trigger class="rounded-md bg-areia-control-background px-3 py-2 text-sm font-medium ring ring-areia-control-border">
      Show release notes
    </Collapsible.Trigger>
    <Collapsible.Panel class="mt-3 rounded-lg bg-areia-surface-muted p-4 text-sm text-areia-default">
      This panel uses custom styling instead of the default border-left accent.
    </Collapsible.Panel>
  </Collapsible>
));
