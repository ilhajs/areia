import { ilha } from "ilha";
import { Toggle, ToggleGroup } from "areia";

export const Demo1 = ilha.render(() => <Toggle variant="outline">Bold</Toggle>);

export const Demo2 = ilha.render(() => <Toggle variant="outline">Italic</Toggle>);

export const Demo3 = ilha.render(() => (
  <div class="flex items-center gap-2">
    <Toggle>Default</Toggle>
    <Toggle variant="outline">Outline</Toggle>
  </div>
));

export const Demo4 = ilha.render(() => (
  <div class="flex items-center gap-2">
    <Toggle size="sm" variant="outline">
      Small
    </Toggle>
    <Toggle size="default" variant="outline">
      Default
    </Toggle>
    <Toggle size="lg" variant="outline">
      Large
    </Toggle>
  </div>
));

export const Demo5 = ilha.render(() => (
  <div class="flex items-center gap-2">
    <Toggle disabled>Disabled</Toggle>
    <Toggle variant="outline" disabled>
      Disabled
    </Toggle>
  </div>
));

export const Demo6 = ilha.render(() => (
  <div class="flex items-center gap-2">
    <Toggle defaultPressed>Pressed</Toggle>
    <Toggle variant="outline" defaultPressed>
      Pressed
    </Toggle>
  </div>
));

export const Demo7 = ilha.render(() => (
  <ToggleGroup type="single" defaultValue="center">
    <ToggleGroup.Item value="left" variant="outline">
      Left
    </ToggleGroup.Item>
    <ToggleGroup.Item value="center" variant="outline">
      Center
    </ToggleGroup.Item>
    <ToggleGroup.Item value="right" variant="outline">
      Right
    </ToggleGroup.Item>
  </ToggleGroup>
));
