import { ilha } from "ilha";
import { Progress } from "areia";

export const Demo1 = ilha.render(() => <Progress label="Uploading" value={45} />);

export const Demo2 = ilha.render(() => <Progress label="Loading project" value={60} />);

export const Demo3 = ilha.render(() => <Progress label="Importing data" value={72} />);

export const Demo4 = ilha.render(() => <Progress label="Syncing" value={null} />);

export const Demo5 = ilha.render(() => (
  <Progress label="Storage used" min={0} max={500} value={125} />
));

export const Demo6 = ilha.render(() => (
  <Progress label="Processing" value={35} showValue={false} />
));

export const Demo7 = ilha.render(() => (
  <Progress
    label="Deployment"
    value={80}
    trackClass="h-3 bg-areia-surface-muted"
    indicatorClass="bg-emerald-500"
    valueClass="text-emerald-600"
  />
));
