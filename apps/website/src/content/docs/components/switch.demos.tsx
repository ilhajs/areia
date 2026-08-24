import { ilha } from "ilha";
import { Switch } from "areia";

export const Demo1 = ilha.render(() => <Switch label="Enable notifications" />);

export const Demo2 = ilha.render(() => (
  <Switch
    id="marketing-emails"
    label="Marketing emails"
    name="marketing-emails"
    value="enabled"
    uncheckedValue="disabled"
  />
));

export const Demo3 = ilha.render(() => <Switch label="Dark mode" />);

export const Demo4 = ilha.render(() => <Switch label="Dark mode" checked />);

export const Demo5 = ilha.render(() => (
  <div class="flex flex-col gap-3">
    <Switch label="Disabled off" disabled />
    <Switch label="Disabled on" checked disabled />
  </div>
));

export const Demo6 = ilha.render(() => <Switch label="Managed by policy" checked readOnly />);

export const Demo7 = ilha.render(() => (
  <div class="grid gap-3 sm:grid-cols-2">
    <Switch label="Default off" variant="default" />
    <Switch label="Default on" variant="default" checked />
    <Switch label="Neutral off" variant="neutral" />
    <Switch label="Neutral on" variant="neutral" checked />
  </div>
));

export const Demo8 = ilha.render(() => <Switch label="Compact setting" variant="neutral" />);

export const Demo9 = ilha.render(() => (
  <div class="flex flex-col gap-3">
    <Switch label="Small" size="sm" />
    <Switch label="Base" size="base" />
    <Switch label="Large" size="lg" />
  </div>
));

export const Demo10 = ilha.render(() => (
  <Switch label="Enable beta features" controlFirst={false} />
));

export const Demo11 = ilha.render(() => (
  <Switch
    label="Usage analytics"
    labelTooltip="Helps improve the product by sending anonymous usage data."
    required={false}
  />
));

export const Demo12 = ilha.render(() => <Switch id="custom-switch-id" label="Custom id switch" />);

export const Demo13 = ilha.render(() => <Switch aria-label="Enable setting" />);

export const Demo14 = ilha.render(() => (
  <Switch.Group
    legend="Notification settings"
    description="Choose how you want to receive account updates."
  >
    <Switch.Item label="Email notifications" name="email" value="enabled" />
    <Switch.Item label="SMS notifications" name="sms" value="enabled" />
    <Switch.Item label="Push notifications" name="push" value="enabled" />
  </Switch.Group>
));

export const Demo15 = ilha.render(() => (
  <Switch.Group legend="Privacy settings" controlFirst={false}>
    <Switch.Item label="Show profile publicly" name="public-profile" />
    <Switch.Item label="Allow search indexing" name="search-indexing" />
  </Switch.Group>
));

export const Demo16 = ilha.render(() => (
  <Switch.Group>
    <Switch.Legend class="sr-only">Notification settings</Switch.Legend>
    <Switch.Item label="Email" name="email" />
    <Switch.Item label="SMS" name="sms" />
  </Switch.Group>
));

export const Demo17 = ilha.render(() => (
  <Switch.Group>
    <Switch.Legend class="text-sm font-semibold uppercase tracking-wide text-areia-subtle">
      Notification settings
    </Switch.Legend>
    <Switch.Item label="Product updates" name="product-updates" />
    <Switch.Item label="Security alerts" name="security-alerts" checked />
  </Switch.Group>
));
