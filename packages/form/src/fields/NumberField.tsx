import { Field, Input } from "areia";
import type { NumberFieldProps } from "../types.ts";

export function NumberField(props: NumberFieldProps) {
  // Field.Static — see BooleanField: don't nest input islands in a Field island.
  return Field.Static({
    label: props.label,
    error: props.error,
    description: props.description,
    children: (
      <Input
        type="number"
        min={props.min != null ? String(props.min) : undefined}
        max={props.max != null ? String(props.max) : undefined}
        step={props.step != null ? String(props.step) : undefined}
        bind:valueAsNumber={props.bind}
      />
    ),
  });
}
