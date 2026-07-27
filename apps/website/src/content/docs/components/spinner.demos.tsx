import ilha from "ilha";
import { Spinner } from "areia";

export const Demo1 = ilha.render(() => (
  <div class="flex items-center gap-3">
    <Spinner size="sm" />
    <Spinner />
    <Spinner size="lg" />
  </div>
));

export const Demo2 = ilha.render(() => <Spinner aria-label="Loading" />);
