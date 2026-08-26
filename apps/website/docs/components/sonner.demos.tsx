import { action, ilha } from "ilha";
import { Button } from "areia";
import { Toaster } from "areia/sonner";

export const Demo1 = ilha(() => {
  const save = action(async () => {
    const { toast } = await import("areia/sonner");
    toast.success("Project saved", {
      description: "Your changes are now live.",
    });
  });
  return (
    <div class="flex flex-col gap-4">
      <Button variant="primary" onclick={save}>
        Save project
      </Button>
      <Toaster position="bottom-right" closeButton richColors theme="system" />
    </div>
  );
});
