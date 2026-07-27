import { describe, expect, it } from "bun:test";
import { createFormState } from "../src/state.ts";
import { effect } from "alien-signals";

describe("headless boundaries", () => {
  it("works with alien-signals directly", () => {
    const mockSchema = {
      "~standard": {
        version: 1 as const,
        vendor: "mock",
        validate: async (val: any) => ({ value: val }),
      },
    };
    const state = createFormState(mockSchema, { a: 1 });
    let observedValue = 0;

    // We create an effect to ensure state is observable natively
    const dispose = effect(() => {
      observedValue = state.values().a as number;
    });

    expect(observedValue).toBe(1);

    state.setValue("a", 2);

    // alien-signals synchronous updates
    expect(observedValue).toBe(2);

    dispose();
  });
});
