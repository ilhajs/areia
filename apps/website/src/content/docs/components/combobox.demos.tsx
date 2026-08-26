import { ilha } from "ilha";
import { Button, Combobox } from "areia";

export const Demo1 = ilha(() => (
  <Combobox
    id="fruit"
    label="Fruit"
    placeholder="Search fruit..."
    items={{
      apple: "Apple",
      banana: "Banana",
      cherry: "Cherry",
      date: "Date",
      elderberry: "Elderberry",
    }}
  />
));

export const Demo2 = ilha(() => (
  <Combobox
    id="ilha-topic"
    label="Ilha topic"
    placeholder="Search Ilha topics..."
    items={{
      islands: "Islands",
      signals: "Signals",
      jsx: "JSX rendering",
      html: "html literals",
      hydration: "Hydration",
    }}
  />
));

export const Demo3 = ilha(() => (
  <Combobox
    id="basic-fruit"
    label="Fruit"
    placeholder="Choose a fruit"
    items={{
      apple: "Apple",
      banana: "Banana",
      cherry: "Cherry",
      date: "Date",
      elderberry: "Elderberry",
    }}
  />
));

export const Demo4 = ilha(() => (
  <Combobox
    id="region"
    label="Region"
    description="Choose the region closest to your users."
    placeholder="Search regions..."
    items={{
      iad: "Washington, D.C.",
      sfo: "San Francisco",
      lhr: "London",
      fra: "Frankfurt",
      nrt: "Tokyo",
    }}
  />
));

export const Demo5 = ilha(() => (
  <Combobox
    id="database-error"
    label="Database"
    required
    error="Select a database before continuing."
    placeholder="Search databases..."
    items={{
      postgres: "PostgreSQL",
      mysql: "MySQL",
      mongodb: "MongoDB",
      redis: "Redis",
    }}
  />
));

export const Demo6 = ilha(() => (
  <Combobox
    label="Fruit"
    placeholder="Search fruit..."
    disabled
    items={{
      apple: "Apple",
      banana: "Banana",
      cherry: "Cherry",
    }}
  />
));

export const Demo7 = ilha(() => (
  <Combobox
    id="plans"
    label="Plan"
    placeholder="Search plans..."
    items={{
      free: "Free",
      pro: "Pro",
      business: { label: "Business", disabled: true },
      enterprise: { label: "Enterprise", disabled: true },
    }}
  />
));

export const Demo8 = ilha(() => (
  <Combobox
    id="default-database"
    label="Database"
    defaultValue="postgres"
    items={{
      postgres: "PostgreSQL",
      mysql: "MySQL",
      mongodb: "MongoDB",
      redis: "Redis",
    }}
  />
));

export const Demo9 = ilha(() => (
  <Combobox
    id="multi-frameworks"
    label="Frameworks"
    multiple
    placeholder="Search frameworks..."
    defaultValue={["astro", "svelte"]}
    items={{
      astro: "Astro",
      next: "Next.js",
      nuxt: "Nuxt",
      remix: "Remix",
      svelte: "SvelteKit",
    }}
  />
));

export const Demo10 = ilha(() => (
  <form class="flex w-full max-w-sm flex-col gap-3">
    <Combobox
      id="form-fruit"
      name="fruit"
      label="Fruit"
      required
      placeholder="Search fruit..."
      items={{
        apple: "Apple",
        banana: "Banana",
        cherry: "Cherry",
      }}
    />
    <Button type="submit">Submit</Button>
  </form>
));

export const Demo11 = ilha(() => (
  <Combobox id="custom-items" label="Runtime" placeholder="Search runtimes...">
    <Combobox.Item value="bun" label="Bun">
      <span class="font-medium">Bun</span>
      <span class="text-areia-subtle"> JavaScript runtime</span>
    </Combobox.Item>
    <Combobox.Item value="node" label="Node.js">
      <span class="font-medium">Node.js</span>
      <span class="text-areia-subtle"> JavaScript runtime</span>
    </Combobox.Item>
    <Combobox.Item value="deno" label="Deno">
      <span class="font-medium">Deno</span>
      <span class="text-areia-subtle"> TypeScript runtime</span>
    </Combobox.Item>
  </Combobox>
));

export const Demo12 = ilha(() => (
  <Combobox id="grouped-location" label="Location" placeholder="Search locations...">
    <Combobox.Group>
      <Combobox.GroupLabel>North America</Combobox.GroupLabel>
      <Combobox.Item value="iad">Washington, D.C.</Combobox.Item>
      <Combobox.Item value="sfo">San Francisco</Combobox.Item>
    </Combobox.Group>
    <Combobox.Group>
      <Combobox.GroupLabel>Europe</Combobox.GroupLabel>
      <Combobox.Item value="lhr">London</Combobox.Item>
      <Combobox.Item value="fra">Frankfurt</Combobox.Item>
    </Combobox.Group>
  </Combobox>
));

export const Demo13 = ilha(() => (
  <Combobox
    id="quick-search"
    label="Quick search"
    placeholder="Start typing..."
    openOnFocus
    autoHighlight
    items={{
      dashboard: "Dashboard",
      settings: "Settings",
      billing: "Billing",
      support: "Support",
    }}
  />
));

export const Demo14 = ilha(() => (
  <Combobox
    id="autocomplete"
    label="Language"
    placeholder="Start typing..."
    openOnFocus
    items={{
      rust: "Rust",
      ruby: "Ruby",
      react: "React",
      python: "Python",
      php: "PHP",
      perl: "Perl",
    }}
  />
));
