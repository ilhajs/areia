/** Serialize ilha/areia template output for assertions in component tests. */
export function markupValue(value: unknown): string {
  if (value && typeof value === "object" && "value" in value) {
    return String((value as { value: unknown }).value);
  }
  return String(value);
}