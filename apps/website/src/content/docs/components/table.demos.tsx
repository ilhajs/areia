import { ilha } from "ilha";
import { Badge, Table } from "areia";

export const Demo1 = ilha(() => (
  <Table>
    <Table.Header>
      <Table.Row>
        <Table.Head>Subject</Table.Head>
        <Table.Head>From</Table.Head>
        <Table.Head>Date</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      <Table.Row>
        <Table.Cell>Welcome to Areia</Table.Cell>
        <Table.Cell>team@example.com</Table.Cell>
        <Table.Cell>Apr 12</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Build complete</Table.Cell>
        <Table.Cell>ci@example.com</Table.Cell>
        <Table.Cell>Apr 11</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>New comment</Table.Cell>
        <Table.Cell>noreply@example.com</Table.Cell>
        <Table.Cell>Apr 10</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
));

export const Demo2 = ilha(() => (
  <Table>
    <Table.Header>
      <Table.Row>
        <Table.Head>Name</Table.Head>
        <Table.Head>Email</Table.Head>
        <Table.Head>Role</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      <Table.Row>
        <Table.Cell>John Doe</Table.Cell>
        <Table.Cell>john@example.com</Table.Cell>
        <Table.Cell>Admin</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
));

export const Demo3 = ilha(() => (
  <Table>
    <Table.Header variant="compact">
      <Table.Row>
        <Table.Head>Subject</Table.Head>
        <Table.Head>From</Table.Head>
        <Table.Head>Date</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      <Table.Row>
        <Table.Cell>Welcome to Areia</Table.Cell>
        <Table.Cell>team@example.com</Table.Cell>
        <Table.Cell>Apr 12</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Build complete</Table.Cell>
        <Table.Cell>ci@example.com</Table.Cell>
        <Table.Cell>Apr 11</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>New comment</Table.Cell>
        <Table.Cell>noreply@example.com</Table.Cell>
        <Table.Cell>Apr 10</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
));

export const Demo4 = ilha(() => (
  <Table layout="fixed">
    <colgroup>
      <col class="w-1/2" />
      <col class="w-1/4" />
      <col class="w-1/4" />
    </colgroup>
    <Table.Header>
      <Table.Row>
        <Table.Head>Subject</Table.Head>
        <Table.Head>From</Table.Head>
        <Table.Head>Date</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      <Table.Row>
        <Table.Cell>Welcome to Areia</Table.Cell>
        <Table.Cell>team@example.com</Table.Cell>
        <Table.Cell>Apr 12</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Build complete</Table.Cell>
        <Table.Cell>ci@example.com</Table.Cell>
        <Table.Cell>Apr 11</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>New comment</Table.Cell>
        <Table.Cell>noreply@example.com</Table.Cell>
        <Table.Cell>Apr 10</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
));

export const Demo5 = ilha(() => (
  <Table>
    <Table.Header>
      <Table.Row>
        <Table.Head class="relative">
          Name
          <Table.ResizeHandle />
        </Table.Head>
        <Table.Head>Role</Table.Head>
      </Table.Row>
    </Table.Header>
  </Table>
));
