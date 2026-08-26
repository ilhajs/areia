import { ilha } from "ilha";
import { Checkbox } from "areia";

export const Demo1 = ilha(() => <Checkbox label="Accept terms and conditions" />);

export const Demo2 = ilha(() => <Checkbox label="Remember me" />);

export const Demo3 = ilha(() => <Checkbox label="Accept terms and conditions" />);

export const Demo4 = ilha(() => <Checkbox label="Enable notifications" checked />);

export const Demo5 = ilha(() => <Checkbox label="Select all" indeterminate />);

export const Demo6 = ilha(() => <Checkbox label="Enable notifications" controlFirst={false} />);

export const Demo7 = ilha(() => <Checkbox label="Disabled" disabled />);

export const Demo8 = ilha(() => <Checkbox label="Required field" variant="error" required />);

export const Demo9 = ilha(() => <Checkbox aria-label="Select row" />);

export const Demo10 = ilha(() => (
  <Checkbox.Group
    legend="Notification preferences"
    description="Choose how you want to receive updates."
  >
    <Checkbox.Item label="Email notifications" value="email" checked />
    <Checkbox.Item label="SMS notifications" value="sms" />
    <Checkbox.Item label="Product updates" value="updates" />
  </Checkbox.Group>
));

export const Demo11 = ilha(() => (
  <Checkbox.Group
    legend="Notification preferences"
    error="Select at least one notification method."
  >
    <Checkbox.Item label="Email notifications" value="email" variant="error" />
    <Checkbox.Item label="SMS notifications" value="sms" variant="error" />
  </Checkbox.Group>
));

export const Demo12 = ilha(() => (
  <div class="flex flex-col gap-3">
    <p class="text-base font-medium text-areia-default">Notification preferences</p>
    <Checkbox.Group>
      <Checkbox.Legend label="Notification preferences" class="sr-only" />
      <Checkbox.Item label="Email notifications" value="email" checked />
      <Checkbox.Item label="SMS notifications" value="sms" />
    </Checkbox.Group>
  </div>
));

export const Demo13 = ilha(() => (
  <Checkbox.Group>
    <Checkbox.Legend
      label="Notification preferences"
      class="text-sm uppercase tracking-wide text-areia-subtle"
    />
    <Checkbox.Item label="Email notifications" value="email" checked />
    <Checkbox.Item label="SMS notifications" value="sms" />
  </Checkbox.Group>
));
