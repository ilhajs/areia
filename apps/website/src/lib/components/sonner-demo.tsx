import ilha from "ilha";
import { Button } from "areia";

/** Live toast demo for the Sonner doc page (the app shell mounts the Toaster). */
export const SonnerDemo = ilha
  .on("button@click", async () => {
    const { toast } = await import("areia/sonner");
    toast.success("Project saved", {
      description: "Your changes are now live.",
    });
  })
  .render(() => (
    <Button variant="primary" type="button">
      Save project
    </Button>
  ));
