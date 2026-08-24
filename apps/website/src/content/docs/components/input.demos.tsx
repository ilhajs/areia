import { ilha } from "ilha";
import { Input } from "areia";

export const Demo1 = ilha.render(() => (
  <Input label="Email" placeholder="you@example.com" type="email" />
));

export const Demo2 = ilha.render(() => (
  <Input
    id="email"
    label="Email"
    description="We'll only use this for account notifications."
    placeholder="you@example.com"
    type="email"
  />
));

export const Demo3 = ilha.render(() => (
  <Input aria-label="Search" placeholder="Search..." type="search" />
));

export const Demo4 = ilha.render(() => (
  <Input
    id="project-name"
    label="Project name"
    description="Use a short, memorable name."
    placeholder="My Ilha app"
  />
));

export const Demo5 = ilha.render(() => (
  <Input
    id="email-error"
    label="Email"
    placeholder="you@example.com"
    type="email"
    value="not-an-email"
    error="Enter a valid email address."
  />
));

export const Demo6 = ilha.render(() => (
  <Input
    id="username"
    label="Username"
    required
    placeholder="areia-user"
    error={{
      message: "Username is required.",
      match: "valueMissing",
    }}
  />
));

export const Demo7 = ilha.render(() => (
  <div class="flex w-full max-w-sm flex-col gap-3">
    <Input size="xs" aria-label="Extra small input" placeholder="Extra small" />
    <Input size="sm" aria-label="Small input" placeholder="Small" />
    <Input size="base" aria-label="Base input" placeholder="Base" />
    <Input size="lg" aria-label="Large input" placeholder="Large" />
  </div>
));

export const Demo8 = ilha.render(() => (
  <Input label="Email" placeholder="you@example.com" disabled />
));

export const Demo9 = ilha.render(() => (
  <Input
    id="website"
    label="Website"
    required={false}
    placeholder="https://example.com"
    type="url"
  />
));

export const Demo10 = ilha.render(() => (
  <Input
    id="team-name"
    label="Team name"
    labelTooltip="This name is visible to everyone in your workspace."
    placeholder="Design systems"
  />
));

export const Demo11 = ilha.render(() => (
  <Input
    id="billing-email"
    label={
      <>
        Email for <strong>billing</strong>
      </>
    }
    required
    placeholder="billing@example.com"
    type="email"
  />
));

export const Demo12 = ilha.render(() => (
  <Input
    id="search-error"
    aria-label="Search"
    placeholder="Search..."
    description="Search by name or ID."
    error="Search is currently unavailable."
  />
));

export const Demo13 = ilha.render(() => (
  <div class="flex w-full max-w-sm flex-col gap-3">
    <Input label="Email" type="email" placeholder="you@example.com" />
    <Input label="Password" type="password" placeholder="••••••••" />
    <Input label="Team size" type="number" placeholder="12" />
    <Input label="Website" type="url" placeholder="https://example.com" />
  </div>
));

export const Demo14 = ilha.render(() => (
  <Input label="Project slug" placeholder="my-ilha-app" passwordManagerIgnore />
));
