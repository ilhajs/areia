import ilha from "ilha";
import { ClipboardText } from "areia";

export const Demo1 = ilha.render(() => (
  <ClipboardText text="npm install areia" tooltip class="w-80" />
));

export const Demo2 = ilha.render(() => (
  <ClipboardText text="0c239dd2-92b4-4b68-bf35-8d6e1c5c12fd" class="w-96" />
));

export const Demo3 = ilha.render(() => (
  <ClipboardText
    text="sk_live_••••••••••••abc123"
    textToCopy="sk_live_abc123-full-secret-value"
    class="w-80"
    tooltip={{
      text: "Copy secret",
      copiedText: "Copied secret",
    }}
  />
));

export const Demo4 = ilha.render(() => (
  <div class="grid w-96 gap-3">
    <ClipboardText text="Small clipboard text" size="sm" />
    <ClipboardText text="Default clipboard text" size="base" />
    <ClipboardText text="Large clipboard text" size="lg" />
  </div>
));

export const Demo5 = ilha.render(() => (
  <ClipboardText
    text="https://example.com/invite/areia"
    class="w-96"
    tooltip={{
      text: "Copy invite link",
      copiedText: "Invite link copied",
      side: "bottom",
    }}
  />
));

export const Demo6 = ilha.render(() => (
  <ClipboardText
    text="areia-token-123"
    labels={{
      copyAction: "Copiar para a área de transferência",
    }}
  />
));
