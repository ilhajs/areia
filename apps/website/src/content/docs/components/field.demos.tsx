import ilha from "ilha";
import { Field, Input, Textarea } from "areia";

export const Demo1 = ilha.render(() => (
  <div class="w-full max-w-sm">
    <Field label="Email" description="Use your work email.">
      <Input data-slot="field-control" type="email" name="email" placeholder="you@example.com" />
    </Field>
  </div>
));

export const Demo2 = ilha.render(() => (
  <div class="w-full max-w-sm">
    <Field label="Username" description="This will be visible on your profile.">
      <Input data-slot="field-control" name="username" placeholder="ryuz" />
    </Field>
  </div>
));

export const Demo3 = ilha.render(() => (
  <div class="w-full max-w-sm">
    <Field label="Project name" error="Project name is required.">
      <Input data-slot="field-control" name="project" required placeholder="My app" />
    </Field>
  </div>
));

export const Demo4 = ilha.render(() => (
  <div class="w-full max-w-sm">
    <Field label="Workspace slug" invalid error="This slug is already taken.">
      <Input data-slot="field-control" name="slug" value="areia" />
    </Field>
  </div>
));

export const Demo5 = ilha.render(() => (
  <div class="w-full max-w-sm">
    <Field>
      <Field.Label label="Description" />
      <Textarea
        data-slot="field-control"
        name="description"
        placeholder="Describe your project..."
      />
      <div class="flex items-center justify-between gap-3">
        <Field.Description description="Keep it concise." />
        <Field.Error error="Description is required." />
      </div>
    </Field>
  </div>
));
