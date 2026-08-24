import { ilha } from "ilha";
import { Resizable } from "areia";

export const Demo1 = ilha.render(() => (
  <Resizable direction="horizontal" class="h-64 max-w-md rounded-lg border border-areia-border">
    <Resizable.Panel defaultSize={50} minSize={10} collapsible>
      <div class="flex items-center justify-center p-4">
        <span class="font-semibold">Left</span>
      </div>
    </Resizable.Panel>
    <Resizable.Handle withHandle />
    <Resizable.Panel defaultSize={50} minSize={10}>
      <div class="flex items-center justify-center p-4">
        <span class="font-semibold">Right</span>
      </div>
    </Resizable.Panel>
  </Resizable>
));

export const Demo2 = ilha.render(() => (
  <Resizable direction="horizontal" class="h-64 max-w-md rounded-lg border border-areia-border">
    <Resizable.Panel defaultSize={50}>
      <div class="flex items-center justify-center p-4">
        <span class="font-semibold">Left</span>
      </div>
    </Resizable.Panel>
    <Resizable.Handle />
    <Resizable.Panel defaultSize={50}>
      <div class="flex items-center justify-center p-4">
        <span class="font-semibold">Right</span>
      </div>
    </Resizable.Panel>
  </Resizable>
));

export const Demo3 = ilha.render(() => (
  <Resizable direction="vertical" class="h-64 max-w-md rounded-lg border border-areia-border">
    <Resizable.Panel defaultSize={25}>
      <div class="flex items-center justify-center p-4">
        <span class="font-semibold">Header</span>
      </div>
    </Resizable.Panel>
    <Resizable.Handle />
    <Resizable.Panel defaultSize={75}>
      <div class="flex items-center justify-center p-4">
        <span class="font-semibold">Content</span>
      </div>
    </Resizable.Panel>
  </Resizable>
));

export const Demo4 = ilha.render(() => (
  <Resizable direction="horizontal" class="h-64 max-w-md rounded-lg border border-areia-border">
    <Resizable.Panel defaultSize={25}>
      <div class="flex items-center justify-center p-4">
        <span class="font-semibold">Sidebar</span>
      </div>
    </Resizable.Panel>
    <Resizable.Handle withHandle />
    <Resizable.Panel defaultSize={75}>
      <div class="flex items-center justify-center p-4">
        <span class="font-semibold">Content</span>
      </div>
    </Resizable.Panel>
  </Resizable>
));

export const Demo5 = ilha.render(() => (
  <Resizable direction="horizontal" class="h-64 max-w-md rounded-lg border border-areia-border">
    <Resizable.Panel defaultSize={50}>
      <div class="flex items-center justify-center p-4">
        <span class="font-semibold">One</span>
      </div>
    </Resizable.Panel>
    <Resizable.Handle withHandle />
    <Resizable.Panel defaultSize={50}>
      <Resizable direction="vertical">
        <Resizable.Panel defaultSize={25}>
          <div class="flex items-center justify-center p-4">
            <span class="font-semibold">Two</span>
          </div>
        </Resizable.Panel>
        <Resizable.Handle withHandle />
        <Resizable.Panel defaultSize={75}>
          <div class="flex items-center justify-center p-4">
            <span class="font-semibold">Three</span>
          </div>
        </Resizable.Panel>
      </Resizable>
    </Resizable.Panel>
  </Resizable>
));
