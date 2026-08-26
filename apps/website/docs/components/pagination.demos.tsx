import { ilha } from "ilha";
import { Pagination } from "areia";

export const Demo1 = ilha(() => <Pagination page={1} perPage={25} totalCount={100} />);

export const Demo2 = ilha(() => <Pagination page={2} perPage={25} totalCount={250} />);

export const Demo3 = ilha(() => <Pagination page={1} perPage={25} totalCount={100} />);

export const Demo4 = ilha(() => (
  <Pagination controls="simple" page={5} perPage={25} totalCount={250} />
));

export const Demo5 = ilha(() => <Pagination page={5} perPage={25} totalCount={250} />);

export const Demo6 = ilha(() => <Pagination page={1} perPage={25} totalCount={10000} />);
