import ilha from "ilha";
import { Checkbox, Input, Label, Select } from "areia";

export const Demo1 = ilha.render(() => (
  <div class="flex flex-col gap-3">
    <Label for="default-label-demo" label="Default Label" />
    <Label for="optional-label-demo" label="Optional Label" showOptional />
    <Label
      for="tooltip-label-demo"
      label="Label with Tooltip"
      tooltip="Helpful context about this field."
    />
  </div>
));

export const Demo2 = ilha.render(() => (
  <div class="flex w-full max-w-sm flex-col gap-4">
    <Input id="middle-name" label="Middle name" required={false} placeholder="Ada" />
    <Input
      id="email-updates"
      label="Email"
      labelTooltip="We'll only use this for account notifications."
      placeholder="you@example.com"
      type="email"
    />
  </div>
));

export const Demo3 = ilha.render(() => (
  <div class="flex w-full max-w-sm flex-col gap-1.5">
    <Label for="username" label="Username" />
    <Input id="username" placeholder="areia-user" />
  </div>
));

export const Demo4 = ilha.render(() => (
  <div class="flex w-full max-w-sm flex-col gap-1.5">
    <Label for="nickname" label="Nickname" showOptional />
    <Input id="nickname" placeholder="Ryuz" />
  </div>
));

export const Demo5 = ilha.render(() => (
  <div class="flex w-full max-w-sm flex-col gap-1.5">
    <Label
      for="email"
      label="Email"
      tooltip="We'll use this to send you product and account updates."
    />
    <Input id="email" type="email" placeholder="you@example.com" />
  </div>
));

export const Demo6 = ilha.render(() => (
  <Checkbox.Item
    value="terms"
    label={
      <Label asContent>
        I agree to the <strong>Terms of Service</strong>
      </Label>
    }
  />
));

export const Demo7 = ilha.render(() => (
  <form class="flex w-full max-w-sm flex-col gap-4">
    <Input id="full-name" label="Full name" required placeholder="Ada Lovelace" />

    <div class="flex flex-col gap-1.5">
      <Label for="company" label="Company" showOptional />
      <Input id="company" placeholder="Areia Labs" />
    </div>

    <Select
      id="country"
      label="Country"
      placeholder="Select a country"
      items={{
        us: "United States",
        uk: "United Kingdom",
        ca: "Canada",
      }}
    />
  </form>
));

export const Demo8 = ilha.render(() => (
  <label class="text-base font-medium text-areia-default">
    <Label
      asContent
      label="Project slug"
      showOptional
      tooltip="Used in generated URLs. You can change it later."
    />
  </label>
));
