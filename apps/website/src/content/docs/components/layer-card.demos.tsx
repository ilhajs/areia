import { ilha } from "ilha";
import { ArrowRight, Boxes, Code2 } from "lucide";
import { Badge, Button, Icon, Input, LayerCard } from "areia";

export const Demo1 = ilha.render(() => (
  <div class="w-full max-w-md">
    <LayerCard>
      <LayerCard.Title>Next Steps</LayerCard.Title>
      <LayerCard.Content>
        <div class="flex items-center justify-between gap-4">
          <div class="flex flex-col gap-1">
            <h3 class="font-medium">Get started with Areia</h3>
            <p class="text-sm text-areia-subtle">
              Learn how to install and use the component library.
            </p>
          </div>
          <Button
            variant="ghost"
            shape="square"
            icon={<Icon icon={ArrowRight} />}
            aria-label="Open guide"
          />
        </div>
      </LayerCard.Content>
    </LayerCard>
  </div>
));

export const Demo2 = ilha.render(() => (
  <div class="w-full max-w-md">
    <LayerCard>
      <LayerCard.Title>Documentation</LayerCard.Title>
      <LayerCard.Content>
        <h3 class="font-medium">Component guide</h3>
        <p class="text-sm text-areia-subtle">Learn how to use Areia components.</p>
      </LayerCard.Content>
    </LayerCard>
  </div>
));

export const Demo3 = ilha.render(() => (
  <div class="w-full max-w-md">
    <LayerCard class="p-4">
      <h3 class="font-medium">Quick start guide</h3>
      <p class="text-sm text-areia-subtle">Learn how to install and configure Areia.</p>
    </LayerCard>
  </div>
));

export const Demo4 = ilha.render(() => (
  <div class="w-full max-w-md">
    <LayerCard>
      <LayerCard.Title>Getting Started</LayerCard.Title>
      <LayerCard.Content>
        <h3 class="font-medium">Quick start guide</h3>
        <p class="text-sm text-areia-subtle">A short walkthrough for new users.</p>
      </LayerCard.Content>
    </LayerCard>
  </div>
));

export const Demo5 = ilha.render(() => (
  <div class="w-full max-w-md">
    <LayerCard class="p-4">
      <h3 class="font-medium">Quick start guide</h3>
      <p class="text-sm text-areia-subtle">Build consistent interfaces with reusable primitives.</p>
    </LayerCard>
  </div>
));

export const Demo6 = ilha.render(() => (
  <div class="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
    <LayerCard>
      <LayerCard.Title>
        <Icon icon={Boxes} class="size-4" />
        <span>Components</span>
      </LayerCard.Title>
      <LayerCard.Content>
        <h3 class="font-medium">Browse components</h3>
        <p class="text-sm text-areia-subtle">Explore every available UI primitive.</p>
      </LayerCard.Content>
    </LayerCard>
    <LayerCard>
      <LayerCard.Title>
        <Icon icon={Code2} class="size-4" />
        <span>Examples</span>
      </LayerCard.Title>
      <LayerCard.Content>
        <h3 class="font-medium">View examples</h3>
        <p class="text-sm text-areia-subtle">Copy patterns for common product screens.</p>
      </LayerCard.Content>
    </LayerCard>
  </div>
));

export const Demo7 = ilha.render(() => (
  <div class="w-full max-w-2xl">
    <LayerCard>
      <LayerCard.Title>
        <span>Subrequests</span>
        <Badge variant="neutral">128</Badge>
      </LayerCard.Title>
      <LayerCard.Content>
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2">
            <Input
              size="sm"
              placeholder="Search origins..."
              aria-label="Search origins"
              class="min-w-0 flex-1"
            />
            <Badge variant="success">2xx</Badge>
            <Badge variant="warning">4xx</Badge>
          </div>
          <div class="grid grid-cols-3 gap-2 text-sm">
            <span class="font-medium">Origin</span>
            <span class="font-medium">Requests</span>
            <span class="font-medium">Duration</span>
            <span class="text-areia-subtle">api.example.com</span>
            <span>82</span>
            <span>120ms</span>
            <span class="text-areia-subtle">cdn.example.com</span>
            <span>46</span>
            <span>48ms</span>
          </div>
        </div>
      </LayerCard.Content>
    </LayerCard>
  </div>
));

export const Demo8 = ilha.render(() => (
  <div class="w-full max-w-md">
    <LayerCard>
      <LayerCard.Title data-testid="layer-card-title">Getting Started</LayerCard.Title>
      <LayerCard.Content data-testid="layer-card-content">
        <h3 class="font-medium">Quick start guide</h3>
        <p class="text-sm text-areia-subtle">A short walkthrough for new users.</p>
      </LayerCard.Content>
    </LayerCard>
  </div>
));
