import { ilha } from "ilha";
import { Breadcrumbs, Icon } from "areia";
import { Folder, House } from "lucide";

export const Demo1 = ilha(() => (
  <Breadcrumbs
    items={[
      {
        href: "/",
        children: "Home",
        icon: <Icon icon={House} />,
      },
      {
        href: "/projects",
        children: "Projects",
        icon: <Icon icon={Folder} />,
      },
      { children: "Current Project" },
    ]}
  />
));

export const Demo2 = ilha(() => (
  <Breadcrumbs
    items={[
      { href: "/", children: "Home" },
      { href: "/docs", children: "Docs" },
      { children: "Breadcrumbs" },
    ]}
  />
));

export const Demo3 = ilha(() => (
  <Breadcrumbs
    items={[
      { href: "/", children: "Home" },
      { href: "/docs", children: "Docs" },
      { children: "Breadcrumbs" },
    ]}
  />
));

export const Demo4 = ilha(() => (
  <div class="flex flex-col gap-8">
    <Breadcrumbs
      size="sm"
      items={[
        { href: "/", children: "Home" },
        { href: "/docs", children: "Docs" },
        { children: "Small Breadcrumbs" },
      ]}
    />
    <Breadcrumbs
      size="base"
      items={[
        { href: "/", children: "Home" },
        { href: "/docs", children: "Docs" },
        { children: "Base Breadcrumbs" },
      ]}
    />
  </div>
));

export const Demo5 = ilha(() => (
  <Breadcrumbs
    items={[
      {
        href: "/",
        children: "Home",
        icon: <Icon icon={House} />,
      },
      {
        href: "/projects",
        children: "Projects",
        icon: <Icon icon={Folder} />,
      },
      { children: "Current Project" },
    ]}
  />
));

export const Demo6 = ilha(() => (
  <Breadcrumbs
    loading
    items={[
      {
        href: "/",
        children: "Home",
        icon: <Icon icon={House} />,
      },
      { href: "/docs", children: "Docs" },
      { children: "Loading..." },
    ]}
  />
));

export const Demo7 = ilha(() => (
  <Breadcrumbs
    items={[
      { href: "/", children: "Home" },
      { href: "/docs", children: "Docs" },
      { children: "Current Page" },
    ]}
    copyUrl="https://example.com/docs/current-page"
  />
));

export const Demo8 = ilha(() => (
  <Breadcrumbs copyUrl="https://example.com/docs/current-page">
    <Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
    <Breadcrumbs.Separator />
    <Breadcrumbs.Link href="/docs">Docs</Breadcrumbs.Link>
    <Breadcrumbs.Separator />
    <Breadcrumbs.Current>Current Page</Breadcrumbs.Current>
  </Breadcrumbs>
));
