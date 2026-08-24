import { ilha } from "ilha";
import { Select } from "areia";

export const Demo1 = ilha.render(() => (
  <Select
    id="fruit"
    label="Fruit"
    value="apple"
    items={{
      apple: "Apple",
      banana: "Banana",
      cherry: "Cherry",
    }}
  />
));

export const Demo2 = ilha.render(() => (
  <Select
    id="plan"
    label="Plan"
    placeholder="Choose a plan"
    items={{
      free: "Free",
      pro: "Pro",
      team: "Team",
    }}
  />
));

export const Demo3 = ilha.render(() => (
  <Select
    id="basic-fruit"
    label="Fruit"
    value="apple"
    items={{
      apple: "Apple",
      banana: "Banana",
      cherry: "Cherry",
    }}
  />
));

export const Demo4 = ilha.render(() => (
  <Select
    aria-label="Select fruit"
    value="banana"
    items={{
      apple: "Apple",
      banana: "Banana",
      cherry: "Cherry",
    }}
  />
));

export const Demo5 = ilha.render(() => (
  <Select
    id="issue-type"
    label="Issue type"
    description="Choose the category that best matches your report."
    error="Select an issue type before continuing."
    placeholder="Choose an issue type"
    items={{
      bug: "Bug",
      documentation: "Documentation",
      feature: "Feature",
    }}
  />
));

export const Demo6 = ilha.render(() => (
  <Select
    id="priority"
    label="Priority"
    placeholder="Choose priority"
    items={{
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "Critical",
    }}
  />
));

export const Demo7 = ilha.render(() => (
  <Select
    id="severity"
    label="Severity"
    labelTooltip="Choose the highest impact level that applies."
    placeholder="Choose severity"
    items={{
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "Critical",
    }}
  />
));

export const Demo8 = ilha.render(() => (
  <Select
    label="Fruit"
    disabled
    value="apple"
    items={{
      apple: "Apple",
      banana: "Banana",
      cherry: "Cherry",
    }}
  />
));

export const Demo9 = ilha.render(() => (
  <Select
    id="columns"
    label="Columns"
    multiple
    description="Hold Command or Control to select multiple options."
    items={{
      name: "Name",
      location: "Location",
      size: "Size",
      read: "Read",
      write: "Write",
      createdAt: "Created At",
    }}
  />
));

export const Demo10 = ilha.render(() => (
  <Select
    id="plan-disabled"
    label="Plan"
    value="free"
    items={{
      free: "Free",
      pro: "Pro",
      business: { label: "Business", disabled: true },
      enterprise: { label: "Enterprise", disabled: true },
    }}
  />
));

export const Demo11 = ilha.render(() => (
  <Select id="explicit-options" label="Fruit" placeholder="Choose fruit">
    <Select.Option value="apple" label="Apple" />
    <Select.Option value="banana" label="Banana" />
    <Select.Option value="cherry" label="Cherry" />
  </Select>
));

export const Demo12 = ilha.render(() => (
  <Select id="grouped-food" label="Food" placeholder="Choose food">
    <Select.Group label="Fruits">
      <Select.Option value="apple" label="Apple" />
      <Select.Option value="banana" label="Banana" />
    </Select.Group>
    <Select.Group label="Vegetables">
      <Select.Option value="carrot" label="Carrot" />
      <Select.Option value="lettuce" label="Lettuce" />
    </Select.Group>
  </Select>
));

export const Demo13 = ilha.render(() => (
  <Select
    variant="ghost"
    aria-label="Sort by"
    value="updated"
    items={{
      updated: "Recently updated",
      created: "Recently created",
      name: "Name",
    }}
  />
));
