import { ilha } from "ilha";
import { Badge, Radio } from "areia";

export const Demo1 = ilha.render(() => (
  <Radio.Group legend="Notification preference" name="notification-basic" value="email">
    <Radio.Item label="Email" value="email" name="notification-basic" checked />
    <Radio.Item label="SMS" value="sms" name="notification-basic" />
    <Radio.Item label="Push" value="push" name="notification-basic" />
  </Radio.Group>
));

export const Demo2 = ilha.render(() => (
  <Radio.Group legend="Contact method" name="contact" value="email">
    <Radio.Item label="Email" value="email" name="contact" checked />
    <Radio.Item label="Phone" value="phone" name="contact" />
  </Radio.Group>
));

export const Demo3 = ilha.render(() => (
  <Radio.Group legend="Account type" name="account-type" value="personal">
    <Radio.Item label="Personal" value="personal" name="account-type" checked />
    <Radio.Item label="Team" value="team" name="account-type" />
    <Radio.Item label="Enterprise" value="enterprise" name="account-type" />
  </Radio.Group>
));

export const Demo4 = ilha.render(() => (
  <Radio.Group legend="Size" name="size" orientation="horizontal" value="md">
    <Radio.Item label="Small" value="sm" name="size" />
    <Radio.Item label="Medium" value="md" name="size" checked />
    <Radio.Item label="Large" value="lg" name="size" />
  </Radio.Group>
));

export const Demo5 = ilha.render(() => (
  <Radio.Group
    legend="Build mode"
    name="build-mode"
    description="Choose how Areia should generate your output."
    value="standard"
  >
    <Radio.Item label="Standard" value="standard" name="build-mode" checked />
    <Radio.Item label="Optimized" value="optimized" name="build-mode" />
  </Radio.Group>
));

export const Demo6 = ilha.render(() => (
  <Radio.Group legend="Options" name="control-position" controlPosition="end" value="a">
    <Radio.Item label="Option A" value="a" name="control-position" checked controlPosition="end" />
    <Radio.Item label="Option B" value="b" name="control-position" controlPosition="end" />
  </Radio.Group>
));

export const Demo7 = ilha.render(() => (
  <Radio.Group legend="Plan" name="plan-card" appearance="card" value="free">
    <Radio.Item
      label="Free"
      description="For personal or hobby projects."
      value="free"
      name="plan-card"
      appearance="card"
      checked
    />
    <Radio.Item
      label="Pro"
      description="For professional websites and applications."
      value="pro"
      name="plan-card"
      appearance="card"
    />
    <Radio.Item
      label="Team"
      description="For teams that collaborate on multiple projects."
      value="team"
      name="plan-card"
      appearance="card"
    />
  </Radio.Group>
));

export const Demo8 = ilha.render(() => (
  <Radio.Group
    legend="Plan"
    name="plan-card-start"
    appearance="card"
    controlPosition="start"
    value="free"
  >
    <Radio.Item
      label="Free"
      description="For personal or hobby projects."
      value="free"
      name="plan-card-start"
      appearance="card"
      controlPosition="start"
      checked
    />
    <Radio.Item
      label="Pro"
      description="For professional websites."
      value="pro"
      name="plan-card-start"
      appearance="card"
      controlPosition="start"
    />
  </Radio.Group>
));

export const Demo9 = ilha.render(() => (
  <Radio.Group legend="Plan" name="rich-plan" appearance="card" value="pro">
    <Radio.Item
      label={
        <span class="flex items-center gap-2">
          Free
          <Badge variant="secondary">$0</Badge>
        </span>
      }
      description="For personal or hobby projects."
      value="free"
      name="rich-plan"
      appearance="card"
    />
    <Radio.Item
      label={
        <span class="flex items-center gap-2">
          Pro
          <Badge variant="success">Popular</Badge>
        </span>
      }
      description="For professional websites."
      value="pro"
      name="rich-plan"
      appearance="card"
      checked
    />
  </Radio.Group>
));

export const Demo10 = ilha.render(() => (
  <Radio.Group
    legend="Plan"
    name="plan-horizontal"
    orientation="horizontal"
    appearance="card"
    value="free"
  >
    <Radio.Item label="Free" value="free" name="plan-horizontal" appearance="card" checked />
    <Radio.Item label="Pro" value="pro" name="plan-horizontal" appearance="card" />
    <Radio.Item label="Team" value="team" name="plan-horizontal" appearance="card" />
  </Radio.Group>
));

export const Demo11 = ilha.render(() => (
  <Radio.Group legend="Payment method" name="payment" error="Please select a payment method.">
    <Radio.Item label="Card" value="card" name="payment" variant="error" />
    <Radio.Item label="Bank transfer" value="bank" name="payment" variant="error" />
  </Radio.Group>
));

export const Demo12 = ilha.render(() => (
  <div class="flex flex-col gap-6">
    <Radio.Group legend="Disabled group" name="disabled-group" disabled value="email">
      <Radio.Item label="Email" value="email" name="disabled-group" checked disabled />
      <Radio.Item label="SMS" value="sms" name="disabled-group" disabled />
    </Radio.Group>
    <Radio.Group legend="Disabled item" name="disabled-item" value="email">
      <Radio.Item label="Email" value="email" name="disabled-item" checked />
      <Radio.Item label="SMS" value="sms" name="disabled-item" disabled />
    </Radio.Group>
  </div>
));

export const Demo13 = ilha.render(() => (
  <div class="flex flex-col gap-3">
    <p class="text-base font-medium text-areia-default">Paths</p>
    <Radio.Group>
      <Radio.Legend label="Paths" class="sr-only" />
      <Radio.Item label="Allow all paths" value="all" name="paths" checked />
      <Radio.Item label="Specific paths" value="specific" name="paths" />
    </Radio.Group>
  </div>
));

export const Demo14 = ilha.render(() => (
  <Radio.Group>
    <Radio.Legend
      label="Notification preference"
      class="text-sm uppercase tracking-wide text-areia-subtle"
    />
    <Radio.Item label="Email" value="email" name="custom-legend" checked />
    <Radio.Item label="SMS" value="sms" name="custom-legend" />
  </Radio.Group>
));
