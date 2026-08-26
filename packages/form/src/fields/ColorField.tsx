import { Field, Input } from "areia";
import type { FieldProps } from "../types.ts";

export function ColorField(props: FieldProps) {
  // Field.Static — see BooleanField: don't nest input islands in a Field island.
  return Field.Static({
    label: props.label,
    error: props.error,
    description: props.description,
    children: (
      <div
        class="flex gap-2"
        // Both inputs share one bind accessor; keep their visible values in
        // sync without relying on a remorph.
        oninput={(event: Event) => {
          const target = event.target as HTMLInputElement;
          const group = target.parentElement as HTMLElement;
          for (const el of group.querySelectorAll<HTMLInputElement>("input")) {
            if (el !== target && el.value !== target.value) el.value = target.value;
          }
        }}
      >
        <Input type="color" class="h-9 w-12 p-1 cursor-pointer" bind:value={props.bind} />
        <Input type="text" class="flex-1 uppercase font-mono" bind:value={props.bind} />
      </div>
    ),
  });
}
