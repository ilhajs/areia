import { Field, Checkbox } from "areia";
import type { FieldProps } from "../types.ts";

export function BooleanField(props: FieldProps) {
  // Checkbox is an ilha island — nesting it inside `Field` (also an island)
  // produces an empty child-slot after hydration. Use Field.Static so the
  // checkbox stays a direct child island of the form.
  return Field.Static({
    error: props.error,
    description: props.description,
    children: <Checkbox bind:checked={props.bind} label={props.label} />,
  });
}
