import { Combobox, Field } from "areia";
import type { SelectFieldProps } from "../types.ts";

export function SelectField(props: SelectFieldProps) {
  const items = props.options?.reduce(
    (acc, opt) => {
      if (typeof opt === "string" || typeof opt === "number") {
        acc[String(opt)] = String(opt);
      } else {
        acc[String(opt.value)] = String(opt.label);
      }
      return acc;
    },
    {} as Record<string, string>,
  );

  // Field.Static wraps the chrome so the Combobox island stays a direct child
  // of the form — nesting it (with label/error) inside another Field island
  // duplicates its portaled list after hydration.
  return Field.Static({
    label: props.label,
    error: props.error,
    description: props.description,
    children: <Combobox bind:value={props.bind} items={items} />,
  });
}
