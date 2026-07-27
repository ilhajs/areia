import ilha from "ilha";
import { Banner, Button, Icon } from "areia";
import { Info, TriangleAlert } from "lucide";

export const Demo1 = ilha.render(() => (
  <div class="flex w-full max-w-2xl flex-col gap-3">
    <Banner
      icon={<Icon icon={Info} class="size-5" />}
      title="Update available"
      description="A new version is ready to install."
    />
    <Banner
      icon={<Icon icon={TriangleAlert} class="size-5" />}
      variant="alert"
      title="Session expiring"
      description="Your session will expire in 5 minutes."
    />
    <Banner
      icon={<Icon icon={TriangleAlert} class="size-5" />}
      variant="error"
      title="Save failed"
      description="We couldn't save your changes. Please try again."
    />
  </div>
));

export const Demo2 = ilha.render(() => (
  <Banner
    icon={<Icon icon={Info} class="size-5" />}
    title="Update available"
    description="A new version is ready to install."
  />
));

export const Demo3 = ilha.render(() => (
  <Banner
    icon={<Icon icon={Info} class="size-5" />}
    title="Update available"
    description="A new version is ready to install."
  />
));

export const Demo4 = ilha.render(() => (
  <Banner
    icon={<Icon icon={TriangleAlert} class="size-5" />}
    variant="alert"
    title="Session expiring"
    description="Your session will expire in 5 minutes."
  />
));

export const Demo5 = ilha.render(() => (
  <Banner
    icon={<Icon icon={TriangleAlert} class="size-5" />}
    variant="error"
    title="Save failed"
    description="We couldn't save your changes. Please try again."
  />
));

export const Demo6 = ilha.render(() => (
  <Banner
    icon={<Icon icon={TriangleAlert} class="size-5" />}
    variant="alert"
    title="Review required"
    description="Please review your project settings before proceeding."
  />
));

export const Demo7 = ilha.render(() => (
  <Banner
    icon={<Icon icon={Info} class="size-5" />}
    title="Update available"
    description="A new version is ready to install."
    action={
      <Button size="sm" variant="primary">
        Update now
      </Button>
    }
  />
));

export const Demo8 = ilha.render(() => (
  <Banner
    icon={<Icon icon={TriangleAlert} class="size-5" />}
    variant="alert"
    title="Session expiring"
    description="Your session will expire in 5 minutes."
    action={
      <>
        <Button size="sm" variant="ghost">
          Dismiss
        </Button>
        <Button size="sm" variant="secondary">
          Extend session
        </Button>
      </>
    }
  />
));

export const Demo9 = ilha.render(() => (
  <Banner
    icon={<Icon icon={Info} class="size-5" />}
    title="Custom content supported"
    description={
      <>
        This banner supports <strong>custom content</strong> with Ilha markup.
      </>
    }
  />
));
