import { Field, Input } from "areia";
import type { FieldProps } from "../types.ts";

export function TextField(props: FieldProps) {
  return (
    <Field label={props.label} error={props.error} description={props.description}>
      <Input bind:value={props.bind} />
    </Field>
  );
}
