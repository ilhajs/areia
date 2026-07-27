import { Combobox } from "areia";
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

  // Combobox is an island that wraps itself in Field.Static when given
  // label/error/description — don't nest it inside another Field island.
  return (
    <Combobox
      bind:value={props.bind}
      items={items}
      label={props.label}
      error={props.error}
      description={props.description}
    />
  );
}
