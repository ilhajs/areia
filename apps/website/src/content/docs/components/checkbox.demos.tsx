import ilha from "ilha";
import { Checkbox } from "areia";

export const Demo1 = ilha.render(() => <Checkbox label="Accept terms and conditions" />);

export const Demo2 = ilha.render(() => <Checkbox label="Remember me" />);

export const Demo3 = ilha.render(() => <Checkbox label="Accept terms and conditions" />);

export const Demo4 = ilha.render(() => <Checkbox label="Enable notifications" checked />);

export const Demo5 = ilha.render(() => <Checkbox label="Select all" indeterminate />);

export const Demo6 = ilha.render(() => (
  <Checkbox label="Enable notifications" controlFirst={false} />
));

export const Demo7 = ilha.render(() => <Checkbox label="Disabled" disabled />);

export const Demo8 = ilha.render(() => (
  <Checkbox label="Required field" variant="error" required />
));

export const Demo9 = ilha.render(() => <Checkbox aria-label="Select row" />);

export const Demo10 = ilha.render(() => (
  <Checkbox.Group
    legend="Notification preferences"
    description="Choose how you want to receive updates."
  >
    <Checkbox.Item label="Email notifications" value="email" checked />
    <Checkbox.Item label="SMS notifications" value="sms" />
    <Checkbox.Item label="Product updates" value="updates" />
  </Checkbox.Group>
));

export const Demo11 = ilha.render(() => (
  <Checkbox.Group
    legend="Notification preferences"
    error="Select at least one notification method."
  >
    <Checkbox.Item label="Email notifications" value="email" variant="error" />
    <Checkbox.Item label="SMS notifications" value="sms" variant="error" />
  </Checkbox.Group>
));

export const Demo12 = ilha.render(() => (
  <div class="flex flex-col gap-3">
    <p class="text-base font-medium text-areia-default">Notification preferences</p>
    <Checkbox.Group>
      <Checkbox.Legend label="Notification preferences" class="sr-only" />
      <Checkbox.Item label="Email notifications" value="email" checked />
      <Checkbox.Item label="SMS notifications" value="sms" />
    </Checkbox.Group>
  </div>
));

export const Demo13 = ilha.render(() => (
  <Checkbox.Group>
    <Checkbox.Legend
      label="Notification preferences"
      class="text-sm uppercase tracking-wide text-areia-subtle"
    />
    <Checkbox.Item label="Email notifications" value="email" checked />
    <Checkbox.Item label="SMS notifications" value="sms" />
  </Checkbox.Group>
));
