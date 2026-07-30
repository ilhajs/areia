import ilha from "ilha";
import { Button } from "areia";
import { Toaster } from "areia/sonner";

export const Demo1 = ilha
  .action("save", async () => {
    const { toast } = await import("areia/sonner");
    toast.success("Project saved", {
      description: "Your changes are now live.",
    });
  })
  .render(({ action }) => (
    <div class="flex flex-col gap-4">
      <Button variant="primary" onclick={action.save}>
        Save project
      </Button>
      <Toaster position="bottom-right" closeButton richColors theme="system" />
    </div>
  ));
