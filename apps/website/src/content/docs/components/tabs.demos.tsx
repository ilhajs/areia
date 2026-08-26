import { ilha } from "ilha";
import { Tabs } from "areia";

export const Demo1 = ilha(() => (
  <div class="flex flex-col gap-6">
    <div>
      <p class="mb-2 text-sm text-areia-subtle">Segmented</p>
      <Tabs
        tabs={[
          { value: "overview", label: "Overview" },
          { value: "analytics", label: "Analytics" },
          { value: "settings", label: "Settings" },
        ]}
        selectedValue="overview"
      />
    </div>
    <div>
      <p class="mb-2 text-sm text-areia-subtle">Underline</p>
      <Tabs
        variant="underline"
        tabs={[
          { value: "overview", label: "Overview" },
          { value: "analytics", label: "Analytics" },
          { value: "settings", label: "Settings" },
        ]}
        selectedValue="overview"
      />
    </div>
  </div>
));

export const Demo2 = ilha(() => (
  <Tabs selectedValue="overview">
    <Tabs.List>
      <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
      <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
    </Tabs.List>
  </Tabs>
));

export const Demo3 = ilha(() => (
  <Tabs
    variant="segmented"
    tabs={[
      { value: "tab-1", label: "Tab 1" },
      { value: "tab-2", label: "Tab 2" },
      { value: "tab-3", label: "Tab 3" },
    ]}
    selectedValue="tab-1"
  />
));

export const Demo4 = ilha(() => (
  <Tabs
    variant="underline"
    tabs={[
      { value: "tab-1", label: "Tab 1" },
      { value: "tab-2", label: "Tab 2" },
      { value: "tab-3", label: "Tab 3" },
    ]}
    selectedValue="tab-1"
  />
));

export const Demo5 = ilha(() => (
  <div class="flex flex-col gap-6">
    <Tabs
      size="sm"
      tabs={[
        { value: "open", label: "Open" },
        { value: "closed", label: "Closed" },
        { value: "all", label: "All" },
      ]}
      selectedValue="open"
    />
    <Tabs
      variant="underline"
      size="sm"
      tabs={[
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" },
      ]}
      selectedValue="daily"
    />
  </div>
));

export const Demo6 = ilha(() => (
  <div class="w-full max-w-md">
    <Tabs
      tabs={[
        { value: "overview", label: "Overview" },
        { value: "analytics", label: "Analytics" },
        { value: "reports", label: "Reports" },
        { value: "notifications", label: "Notifications" },
        { value: "settings", label: "Settings" },
        { value: "billing", label: "Billing" },
        { value: "security", label: "Security" },
        { value: "integrations", label: "Integrations" },
      ]}
      selectedValue="overview"
    />
  </div>
));

export const Demo7 = ilha(() => (
  <Tabs selectedValue="overview">
    <Tabs.List>
      <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
      <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
      <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="overview">
      <div class="rounded-lg bg-areia-surface-muted p-4 text-sm">
        Project health and key metrics.
      </div>
    </Tabs.Content>
    <Tabs.Content value="activity">
      <div class="rounded-lg bg-areia-surface-muted p-4 text-sm">
        Recent project activity appears here.
      </div>
    </Tabs.Content>
    <Tabs.Content value="settings">
      <div class="rounded-lg bg-areia-surface-muted p-4 text-sm">
        Workspace preferences and access controls.
      </div>
    </Tabs.Content>
  </Tabs>
));

export const Demo8 = ilha(() => (
  <Tabs
    selectedValue="overview"
    tabs={[
      {
        value: "overview",
        label: "Overview",
        content: "Overview panel",
      },
      {
        value: "settings",
        label: "Settings",
        content: "Settings panel",
      },
    ]}
  />
));

export const Demo9 = ilha(() => (
  <Tabs
    tabs={[
      { value: "profile", label: "Profile" },
      { value: "team", label: "Team" },
      { value: "billing", label: "Billing", disabled: true },
    ]}
    selectedValue="profile"
  />
));
