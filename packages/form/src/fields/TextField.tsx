import { Field, Input } from "areia";
import type { FieldProps } from "../types.ts";

export function TextField(props: FieldProps) {
  // Field.Static — see BooleanField: don't nest input islands in a Field island.
  return Field.Static({
    label: props.label,
    error: props.error,
    description: props.description,
    children: <Input bind:value={props.bind} />,
  });
}
