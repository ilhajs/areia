import { ilha } from "ilha";
import { Button, Dropdown } from "areia";

export const Demo1 = ilha.render(() => (
  <Dropdown trigger={<Button>Add</Button>}>
    <Dropdown.Item value="component">Component</Dropdown.Item>
    <Dropdown.Item value="primitive">Primitive</Dropdown.Item>
    <Dropdown.Item value="example">Example</Dropdown.Item>
  </Dropdown>
));

export const Demo2 = ilha.render(() => (
  <Dropdown>
    <Dropdown.Trigger>
      <Button>Menu</Button>
    </Dropdown.Trigger>
    <Dropdown.Content>
      <Dropdown.Item value="edit">Edit</Dropdown.Item>
      <Dropdown.Item value="duplicate">Duplicate</Dropdown.Item>
      <Dropdown.Separator />
      <Dropdown.Item value="delete" variant="danger">
        Delete
      </Dropdown.Item>
    </Dropdown.Content>
  </Dropdown>
));

export const Demo3 = ilha.render(() => (
  <Dropdown trigger={<Button>Actions</Button>}>
    <Dropdown.Group>
      <Dropdown.Label>Project</Dropdown.Label>
      <Dropdown.Item value="rename">Rename</Dropdown.Item>
      <Dropdown.Item value="duplicate">Duplicate</Dropdown.Item>
    </Dropdown.Group>
    <Dropdown.Separator />
    <Dropdown.Item value="delete" variant="danger">
      Delete
    </Dropdown.Item>
  </Dropdown>
));

export const Demo4 = ilha.render(() => (
  <Dropdown trigger={<Button>Add</Button>}>
    <Dropdown.Item value="component">Component</Dropdown.Item>
    <Dropdown.Item value="primitive">Primitive</Dropdown.Item>
    <Dropdown.Item value="example">Example</Dropdown.Item>
  </Dropdown>
));

export const Demo5 = ilha.render(() => (
  <Dropdown trigger={<Button>Edit</Button>}>
    <Dropdown.Item value="rename">Rename</Dropdown.Item>
    <Dropdown.Item value="duplicate">Duplicate</Dropdown.Item>
    <Dropdown.Separator />
    <Dropdown.Item value="move" inset>
      Move to folder
    </Dropdown.Item>
    <Dropdown.Item value="favorite" inset>
      Add to favorites
    </Dropdown.Item>
    <Dropdown.Separator />
    <Dropdown.Item value="delete" variant="danger">
      Delete
    </Dropdown.Item>
  </Dropdown>
));

export const Demo6 = ilha.render(() => (
  <Dropdown
    trigger={
      <span class="flex size-8 items-center justify-center rounded-full bg-areia-accent text-sm font-medium text-white">
        AR
      </span>
    }
    triggerClass="rounded-full"
  >
    <Dropdown.Item value="profile">Profile</Dropdown.Item>
    <Dropdown.Item value="settings">Settings</Dropdown.Item>
    <Dropdown.Separator />
    <Dropdown.Item value="logout" variant="danger">
      Log out
    </Dropdown.Item>
  </Dropdown>
));

export const Demo7 = ilha.render(() => (
  <Dropdown trigger={<Button>Resources</Button>}>
    <Dropdown.LinkItem href="/settings" value="settings">
      Settings
    </Dropdown.LinkItem>
    <Dropdown.LinkItem href="/docs" value="docs">
      Documentation
    </Dropdown.LinkItem>
    <Dropdown.Separator />
    <Dropdown.LinkItem href="https://ilha.build/llms.txt" external value="ilha-llms">
      Ilha llms.txt
    </Dropdown.LinkItem>
  </Dropdown>
));
