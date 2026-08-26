import { ilha } from "ilha";
import { Button } from "areia";

export const Demo1 = ilha(() => <Button variant="primary">Create project</Button>);

export const Demo2 = ilha(() => (
  <div class="flex gap-2">
    <Button variant="primary">Save</Button>
    <Button variant="secondary">Cancel</Button>
  </div>
));
