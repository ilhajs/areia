import ilha from "ilha";
import { Slider } from "areia";

export const Demo1 = ilha.render(() => (
  <Slider class="w-full max-w-sm" defaultValue={50} max={100} />
));

export const Demo2 = ilha.render(() => (
  <Slider class="w-full max-w-sm" defaultValue={50} max={100} />
));

export const Demo3 = ilha.render(() => (
  <div class="h-48">
    <Slider class="h-full" orientation="vertical" defaultValue={50} max={100} />
  </div>
));

export const Demo4 = ilha.render(() => (
  <Slider class="w-full max-w-sm" defaultValue={50} max={100} disabled />
));

export const Demo5 = ilha.render(() => (
  <Slider class="w-full max-w-sm" defaultValue={50} max={100} step={10} />
));
