import ilha from "ilha";
import { Breadcrumbs, Icon } from "areia";
import { Folder, House } from "lucide";

/** Breadcrumb demos as single islands so nested Icon nodes stay in-process. */

export const BreadcrumbsHeroDemo = ilha.render(() => (
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

export const BreadcrumbsBasicDemo = ilha.render(() => (
  <Breadcrumbs
    items={[
      { href: "/", children: "Home" },
      { href: "/docs", children: "Docs" },
      { children: "Breadcrumbs" },
    ]}
  />
));

export const BreadcrumbsSizesDemo = ilha.render(() => (
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

export const BreadcrumbsIconsDemo = ilha.render(() => (
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

export const BreadcrumbsLoadingDemo = ilha.render(() => (
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

export const BreadcrumbsClipboardDemo = ilha.render(() => (
  <Breadcrumbs
    items={[
      { href: "/", children: "Home" },
      { href: "/docs", children: "Docs" },
      { children: "Current Page" },
    ]}
    copyUrl="https://example.com/docs/current-page"
  />
));

export const BreadcrumbsCompositionDemo = ilha.render(() => (
  <Breadcrumbs copyUrl="https://example.com/docs/current-page">
    <Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
    <Breadcrumbs.Separator />
    <Breadcrumbs.Link href="/docs">Docs</Breadcrumbs.Link>
    <Breadcrumbs.Separator />
    <Breadcrumbs.Current>Current Page</Breadcrumbs.Current>
  </Breadcrumbs>
));
