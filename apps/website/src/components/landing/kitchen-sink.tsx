import {
  Badge,
  Banner,
  Breadcrumbs,
  Button,
  Checkbox,
  ClipboardText,
  Collapsible,
  Combobox,
  ContextMenu,
  DatePicker,
  Dialog,
  Dropdown,
  Field,
  HoverCard,
  Icon,
  Input,
  Label,
  LayerCard,
  Link,
  Pagination,
  Popover,
  Progress,
  Radio,
  Resizable,
  Select,
  Slider,
  Spinner,
  Switch,
  Table,
  Tabs,
  Textarea,
  Toggle,
  Tooltip,
} from "areia";
import ilha from "ilha";
import { ArrowUpRight, Bold, CircleCheck, Info, Italic, Plus, Settings, Underline } from "lucide";
import type { JSX } from "ilha/jsx-runtime";

function titleCase(slug: string) {
  return slug
    .split("-")
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(" ");
}

/** LayerCard shell: title is an anchor to the component docs. */
export function SinkCard(props: {
  slug: string;
  name?: string;
  children?: JSX.Element | JSX.Element[] | string | null;
  /** Extra classes on the demo content area */
  contentClass?: string;
  class?: string;
}): JSX.Element {
  const name = props.name ?? titleCase(props.slug);
  const rootClass = ["h-full min-h-0", props.class].filter(Boolean).join(" ");
  const contentClass = [
    "min-h-36 flex flex-1 flex-wrap items-center justify-center gap-3",
    props.contentClass,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <LayerCard class={rootClass}>
      <LayerCard.Title class="justify-between gap-2">
        <Link
          href={`/components/${props.slug}`}
          variant="plain"
          class={
            "group/sink-title inline-flex max-w-full items-center gap-1.5 font-medium " +
            "text-areia-foreground underline decoration-areia-border decoration-1 underline-offset-[0.2em] " +
            "transition-colors hover:text-areia-primary hover:decoration-areia-primary " +
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-areia-ring/50"
          }
        >
          <span class="truncate">{name}</span>
          <Icon
            icon={ArrowUpRight}
            class="size-3.5 shrink-0 text-areia-muted transition-transform group-hover/sink-title:translate-x-0.5 group-hover/sink-title:-translate-y-0.5 group-hover/sink-title:text-areia-primary"
          />
        </Link>
      </LayerCard.Title>
      <LayerCard.Content class={contentClass}>{props.children}</LayerCard.Content>
    </LayerCard>
  );
}

const ToastDemo = ilha
  .action("show", async () => {
    const { toast } = await import("areia/sonner");
    toast.success("Saved", { description: "Kitchen sink toast demo." });
  })
  .render(({ action }) => (
    <Button variant="secondary" type="button" onclick={action.show}>
      Show toast
    </Button>
  ));

/** Interactive demos for every documented Areia component (except getting-started). */
export function KitchenSinkGrid(): JSX.Element {
  return (
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <SinkCard slug="badge">
        <div class="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </SinkCard>

      <SinkCard slug="banner" contentClass="items-stretch! w-full">
        <Banner
          class="w-full max-w-full"
          title="Heads up"
          description="Banner demo for inline notices."
        />
      </SinkCard>

      <SinkCard slug="breadcrumbs" contentClass="w-full">
        <Breadcrumbs
          items={[
            { href: "/", children: "Home" },
            { href: "/components/getting-started", children: "Docs" },
            { children: "Breadcrumbs" },
          ]}
        />
      </SinkCard>

      <SinkCard slug="button">
        <div class="flex flex-wrap items-center justify-center gap-2">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="secondary" shape="square" icon={<Icon icon={Plus} />} aria-label="Add" />
        </div>
      </SinkCard>

      <SinkCard slug="checkbox">
        <div class="flex flex-col gap-2">
          <Checkbox label="Accept terms" />
          <Checkbox label="Subscribe" defaultChecked />
        </div>
      </SinkCard>

      <SinkCard slug="clipboard-text" contentClass="w-full">
        <ClipboardText text="npm install areia" tooltip class="w-full max-w-xs" />
      </SinkCard>

      <SinkCard slug="collapsible" contentClass="w-full items-stretch!">
        <Collapsible
          class="w-full max-w-sm"
          trigger="What is Areia?"
          panel="A vanilla TypeScript UI kit for Ilha — import first, eject later."
        />
      </SinkCard>

      <SinkCard slug="combobox" contentClass="w-full items-stretch!">
        <Combobox
          class="w-full max-w-xs"
          label="Fruit"
          placeholder="Pick a fruit"
          items={[
            { value: "apple", label: "Apple" },
            { value: "banana", label: "Banana" },
            { value: "cherry", label: "Cherry" },
          ]}
        />
      </SinkCard>

      <SinkCard slug="context-menu">
        <ContextMenu
          trigger={
            <div class="flex h-24 w-full max-w-xs cursor-default items-center justify-center rounded-lg border border-dashed border-areia-border bg-areia-surface-muted text-sm text-areia-subtle">
              Right-click me
            </div>
          }
        >
          <ContextMenu.Item>Open</ContextMenu.Item>
          <ContextMenu.Item>Rename</ContextMenu.Item>
          <ContextMenu.Item>Delete</ContextMenu.Item>
        </ContextMenu>
      </SinkCard>

      <SinkCard slug="date-picker" contentClass="w-full overflow-x-auto">
        <DatePicker
          mode="single"
          selected={new Date(2026, 4, 21)}
          defaultMonth={new Date(2026, 4, 1)}
        />
      </SinkCard>

      <SinkCard slug="dialog">
        <Dialog
          trigger={<Button variant="secondary">Open dialog</Button>}
          contentClass="grid max-w-sm gap-3 p-5"
          content={
            <>
              <Dialog.Title>Edit profile</Dialog.Title>
              <Dialog.Description>Make a quick change, then close.</Dialog.Description>
              <div class="flex justify-end gap-2">
                <Dialog.Close>
                  <Button variant="secondary">Cancel</Button>
                </Dialog.Close>
                <Dialog.Close>
                  <Button variant="primary">Save</Button>
                </Dialog.Close>
              </div>
            </>
          }
        />
      </SinkCard>

      <SinkCard slug="dropdown">
        <Dropdown trigger={<Button variant="secondary">Actions</Button>}>
          <Dropdown.Item>New file</Dropdown.Item>
          <Dropdown.Item>Duplicate</Dropdown.Item>
          <Dropdown.Separator />
          <Dropdown.Item variant="danger">Delete</Dropdown.Item>
        </Dropdown>
      </SinkCard>

      <SinkCard slug="field" contentClass="w-full items-stretch!">
        <Field class="w-full max-w-xs" label="Email" description="We'll never share it.">
          <Input type="email" placeholder="you@example.com" />
        </Field>
      </SinkCard>

      <SinkCard slug="hover-card">
        <HoverCard
          trigger={<Button variant="ghost">Hover me</Button>}
          content={
            <div class="w-56 space-y-1 p-1">
              <HoverCard.Title>Areia</HoverCard.Title>
              <HoverCard.Description>UI kit for Ilha apps.</HoverCard.Description>
            </div>
          }
        />
      </SinkCard>

      <SinkCard slug="icon">
        <div class="flex items-center gap-3 text-areia-default">
          <Icon icon={Info} />
          <Icon icon={CircleCheck} class="text-areia-success" />
          <Icon icon={Settings} class="text-areia-subtle" />
        </div>
      </SinkCard>

      <SinkCard slug="input" contentClass="w-full items-stretch!">
        <Input class="w-full max-w-xs" label="Name" placeholder="Ada Lovelace" />
      </SinkCard>

      <SinkCard slug="label" contentClass="w-full items-stretch!">
        <div class="flex w-full max-w-xs flex-col gap-2">
          <Label for="sink-label-demo">Project name</Label>
          <Input id="sink-label-demo" placeholder="areia-docs" />
        </div>
      </SinkCard>

      <SinkCard slug="layer-card" contentClass="w-full items-stretch! p-2!">
        <LayerCard class="w-full max-w-xs">
          <LayerCard.Title>Nested card</LayerCard.Title>
          <LayerCard.Content class="text-sm text-areia-subtle">
            LayerCard is used throughout the docs shell.
          </LayerCard.Content>
        </LayerCard>
      </SinkCard>

      <SinkCard slug="link">
        <div class="flex flex-wrap items-center justify-center gap-4">
          <Link href="/components/getting-started">Inline link</Link>
          <Link href="/components/button" variant="plain">
            Plain link
          </Link>
        </div>
      </SinkCard>

      <SinkCard slug="pagination" contentClass="w-full">
        <Pagination page={2} perPage={10} totalCount={95} />
      </SinkCard>

      <SinkCard slug="popover">
        <Popover
          trigger={<Button variant="secondary">Open popover</Button>}
          content={
            <div class="w-56 space-y-2 p-1">
              <Popover.Title>Quick tip</Popover.Title>
              <Popover.Description>Popovers float near their trigger.</Popover.Description>
            </div>
          }
        />
      </SinkCard>

      <SinkCard slug="progress" contentClass="w-full items-stretch!">
        <Progress class="w-full max-w-xs" label="Uploading" value={62} />
      </SinkCard>

      <SinkCard slug="radio" contentClass="w-full items-stretch!">
        <Radio.Group legend="Plan" name="sink-plan" class="w-full max-w-xs" value="pro">
          <Radio.Item value="free" label="Free" name="sink-plan" />
          <Radio.Item value="pro" label="Pro" name="sink-plan" checked />
          <Radio.Item value="team" label="Team" name="sink-plan" />
        </Radio.Group>
      </SinkCard>

      <SinkCard slug="resizable" contentClass="w-full items-stretch! min-h-52!">
        <Resizable
          direction="horizontal"
          class="h-44 w-full max-w-sm rounded-lg border border-areia-border"
        >
          <Resizable.Panel defaultSize={40} minSize={20}>
            <div class="flex h-full items-center justify-center p-3 text-sm font-medium">Left</div>
          </Resizable.Panel>
          <Resizable.Handle withHandle />
          <Resizable.Panel defaultSize={60} minSize={20}>
            <div class="flex h-full items-center justify-center p-3 text-sm font-medium">Right</div>
          </Resizable.Panel>
        </Resizable>
      </SinkCard>

      <SinkCard slug="select" contentClass="w-full items-stretch!">
        <Select
          class="w-full max-w-xs"
          id="sink-fruit"
          label="Fruit"
          placeholder="Choose…"
          value="apple"
          items={[
            { value: "apple", label: "Apple" },
            { value: "orange", label: "Orange" },
            { value: "grape", label: "Grape" },
          ]}
        />
      </SinkCard>

      <SinkCard slug="slider" contentClass="w-full items-stretch!">
        <Slider class="w-full max-w-xs" defaultValue={40} max={100} />
      </SinkCard>

      <SinkCard slug="sonner">
        <ToastDemo />
      </SinkCard>

      <SinkCard slug="spinner">
        <div class="flex items-center gap-4">
          <Spinner size="sm" />
          <Spinner />
          <Spinner size="lg" />
        </div>
      </SinkCard>

      <SinkCard slug="switch">
        <div class="flex flex-col gap-3">
          <Switch label="Notifications" defaultChecked />
          <Switch label="Marketing emails" />
        </div>
      </SinkCard>

      <SinkCard slug="table" contentClass="w-full overflow-x-auto">
        <Table class="w-full max-w-sm text-sm">
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
              <Table.Head>Role</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Ada</Table.Cell>
              <Table.Cell>Engineer</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Grace</Table.Cell>
              <Table.Cell>Designer</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </SinkCard>

      <SinkCard slug="tabs" contentClass="w-full items-stretch!">
        <Tabs
          class="w-full max-w-sm"
          variant="segmented"
          defaultValue="overview"
          tabs={[
            {
              value: "overview",
              label: "Overview",
              content: "Tab panels switch related views in place.",
            },
            {
              value: "api",
              label: "API",
              content: "Use the tabs prop or Tabs.List / Tabs.Content.",
            },
            {
              value: "settings",
              label: "Settings",
              content: "Each tab owns its own content panel.",
            },
          ]}
        />
      </SinkCard>

      <SinkCard slug="textarea" contentClass="w-full items-stretch!">
        <Textarea class="w-full max-w-xs" label="Bio" placeholder="Short introduction…" rows={3} />
      </SinkCard>

      <SinkCard slug="toggle">
        <div class="flex flex-wrap items-center justify-center gap-2">
          <Toggle variant="outline" aria-label="Bold">
            <Icon icon={Bold} />
          </Toggle>
          <Toggle variant="outline" aria-label="Italic">
            <Icon icon={Italic} />
          </Toggle>
          <Toggle variant="outline" aria-label="Underline" defaultPressed>
            <Icon icon={Underline} />
          </Toggle>
        </div>
      </SinkCard>

      <SinkCard slug="tooltip">
        <Tooltip content="Create a new project">
          <Button variant="secondary" icon={<Icon icon={Plus} />}>
            New
          </Button>
        </Tooltip>
      </SinkCard>
    </div>
  );
}
