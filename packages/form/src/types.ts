import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { SignalAccessor } from "ilha";

export type Schema = StandardSchemaV1<unknown, any>;

export type FieldType = "text" | "number" | "boolean" | "select" | "color" | "folder";

export interface UIOverride {
  type?: FieldType;
  label?: string;
  description?: string;
  options?: Array<string | number | { label: string; value: unknown }>;
  min?: number;
  max?: number;
  step?: number;
  [key: string]: unknown;
}

export type UIOverrides = Record<string, UIOverride>;

export interface FormStateResult<T extends Record<string, unknown>> {
  values: () => T;
  /** Computed: `true` when any top-level key differs from the initial defaults. */
  isDirty: () => boolean;
  isValid: () => boolean;
  errors: () => Record<string, string>;
  setValue: (path: string, value: unknown) => void;
  validate: () => Promise<boolean>;
  reset: () => void;
  /** A bindable accessor for one field — pass straight to `bind:value` / `bind:checked` / etc. */
  field: (path: string) => SignalAccessor<any>;
}

/** Props shared by every generated field component. */
export interface FieldProps {
  path: string;
  label: string;
  bind: SignalAccessor<any>;
  error?: string;
  description?: string;
}

export interface NumberFieldProps extends FieldProps {
  min?: number;
  max?: number;
  step?: number;
}

export interface SelectFieldProps extends FieldProps {
  options?: Array<string | number | { label: string; value: unknown }>;
}
