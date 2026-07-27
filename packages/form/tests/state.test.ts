import { describe, expect, it } from "bun:test";
import { createFormState } from "../src/state.ts";

describe("createFormState", () => {
  const mockSchema = {
    "~standard": {
      version: 1 as const,
      vendor: "mock",
      validate: async (val: any) => {
        if (val.name === "fail") {
          return { issues: [{ message: "Name cannot be fail", path: [{ key: "name" }] }] };
        }
        return { value: val };
      },
    },
  };

  it("initializes with default values", () => {
    const state = createFormState(mockSchema, { name: "test", age: 30 });
    expect(state.values()).toEqual({ name: "test", age: 30 });
    expect(state.isDirty()).toBe(false);
    expect(state.isValid()).toBe(true);
    expect(state.errors()).toEqual({});
  });

  it("setValue updates state and sets dirty flag", () => {
    const state = createFormState(mockSchema, { name: "test", user: { id: 1 } });
    state.setValue("name", "updated");
    expect(state.values().name).toBe("updated");
    expect(state.isDirty()).toBe(true);

    state.setValue("user.id", 2);
    expect((state.values().user as any).id).toBe(2);
  });

  it("validate updates errors correctly", async () => {
    const state = createFormState(mockSchema, { name: "test" });
    const res1 = await state.validate();
    expect(res1).toBe(true);
    expect(state.errors()).toEqual({});

    state.setValue("name", "fail");
    const res2 = await state.validate();
    expect(res2).toBe(false);
    expect(state.errors()).toEqual({ name: "Name cannot be fail" });
    expect(state.isValid()).toBe(false);
  });

  it("reset clears dirty flag and restores default values", () => {
    const state = createFormState(mockSchema, { name: "test" });
    state.setValue("name", "changed");
    state.reset();
    expect(state.values().name).toBe("test");
    expect(state.isDirty()).toBe(false);
  });
});
