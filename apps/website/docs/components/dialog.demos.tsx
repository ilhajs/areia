import { ilha } from "ilha";
import { Button, Dialog } from "areia";

export const Demo1 = ilha(() => (
  <Dialog
    trigger={<Button>Open dialog</Button>}
    contentClass="grid gap-4 p-6"
    content={
      <>
        <div class="grid gap-2">
          <Dialog.Title>Edit profile</Dialog.Title>
          <Dialog.Description>
            Make changes to your profile. Close the dialog when you are done.
          </Dialog.Description>
        </div>
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
));

export const Demo2 = ilha(() => (
  <Dialog>
    <Dialog.Trigger>
      <Button>Open</Button>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay />
      <Dialog.Content class="grid gap-4 p-6">
        <Dialog.Title>Dialog title</Dialog.Title>
        <Dialog.Description>Helpful supporting text for the dialog.</Dialog.Description>
        <Dialog.Close>
          <Button>Close</Button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog>
));

export const Demo3 = ilha(() => (
  <Dialog
    role="alertdialog"
    trigger={<Button variant="destructive">Delete project</Button>}
    contentClass="grid gap-4 p-6"
    content={
      <>
        <div class="grid gap-2">
          <Dialog.Title>Delete project?</Dialog.Title>
          <Dialog.Description>
            This action cannot be undone. The project and all related data will be permanently
            deleted.
          </Dialog.Description>
        </div>
        <div class="flex justify-end gap-2">
          <Dialog.Close>
            <Button variant="secondary">Cancel</Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button variant="destructive">Delete</Button>
          </Dialog.Close>
        </div>
      </>
    }
  />
));

export const Demo4 = ilha(() => (
  <Dialog
    closeOnClickOutside={false}
    closeOnEscape
    lockScroll
    trigger={<Button>Open locked dialog</Button>}
    contentClass="grid gap-4 p-6"
    content={
      <>
        <Dialog.Title>Explicit close</Dialog.Title>
        <Dialog.Description>Clicking outside this dialog will not close it.</Dialog.Description>
        <Dialog.Close>
          <Button>Close</Button>
        </Dialog.Close>
      </>
    }
  />
));

export const Demo5 = ilha(() => (
  <Dialog
    trigger={<Button>Open shortcut dialog</Button>}
    contentClass="grid gap-4 p-6"
    content={
      <>
        <Dialog.Title>Shortcut API</Dialog.Title>
        <Dialog.Description>
          Use props when you do not need to customize the slot structure.
        </Dialog.Description>
        <Dialog.Close>
          <Button>Done</Button>
        </Dialog.Close>
      </>
    }
  />
));
