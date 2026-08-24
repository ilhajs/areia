import { ilha } from "ilha";
import { Form, FloatingForm } from "@areia/form";
import { z } from "zod";

export const BasicForm = Form(
  z.object({
    name: z.string(),
    age: z.number().min(0).max(120),
    theme: z.enum(["light", "dark", "system"]),
    active: z.boolean(),
  }),
  { name: "John", age: 30, theme: "system", active: true },
  { onSubmit: (values) => console.log("submitted:", values) },
);

export const ColorForm = Form(
  z.object({ brandColor: z.string() }),
  { brandColor: "#ff0000" },
  {
    uiOverrides: {
      brandColor: { type: "color", label: "Brand Color" },
    },
    onSubmit: (values) => console.log("submitted:", values),
  },
);

export const SceneControls = FloatingForm(
  z.object({
    speed: z.number().min(0.1).max(10),
    wireframe: z.boolean(),
    color: z.string(),
  }),
  { speed: 1.0, wireframe: false, color: "#ff00ff" },
  {
    title: "Scene Controls",
    uiOverrides: { color: { type: "color" } },
    onChange: (values) => console.log("changed:", values),
  },
);

export const Demo1 = BasicForm;

export const Demo2 = ColorForm;

export const Demo3 = ilha.render(() => (
  <div class="relative w-full h-[400px] border border-areia-divider rounded-lg overflow-hidden bg-areia-surface-muted bg-[url('https://ilha.build/grid.svg')]">
    <SceneControls />
  </div>
));
