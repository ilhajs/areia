import { Field, Input } from "areia";
import type { FieldProps } from "../types.ts";

export function ColorField(props: FieldProps) {
  return (
    <Field label={props.label} error={props.error} description={props.description}>
      <div class="flex gap-2">
        <Input type="color" class="h-9 w-12 p-1 cursor-pointer" bind:value={props.bind} />
        <Input type="text" class="flex-1 uppercase font-mono" bind:value={props.bind} />
      </div>
    </Field>
  );
}
