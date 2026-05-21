import ilha, { html, raw } from "ilha";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide";
import { Button } from "$components/button";
import { Icon } from "$components/icon";
import { cn } from "$lib/cn";
import { toAttrs } from "$lib/input";
import type { HTMLElementProps } from "$lib/types";

export type DatePickerMode = "single" | "multiple" | "range";
export type DateRange = { from?: Date; to?: Date };
export type DatePickerSelected = Date | Date[] | DateRange | undefined;

export interface DatePickerVariantsProps {}

export const DATE_PICKER_VARIANTS = {} as const;
export const DATE_PICKER_DEFAULT_VARIANTS = {
  mode: "single",
  numberOfMonths: 1,
  weekStartsOn: 0,
} as const;

export type DatePickerInput = Omit<HTMLElementProps<HTMLDivElement>, "className" | "children"> &
  DatePickerVariantsProps &
  Record<string, unknown> & {
    /** Selection mode. */
    mode?: DatePickerMode;
    /** Selected date, dates, or range depending on `mode`. */
    selected?: DatePickerSelected;
    /** Month displayed first. Defaults to selected date or today. */
    month?: Date;
    /** Initial month when uncontrolled. */
    defaultMonth?: Date;
    /** Number of consecutive months to render. */
    numberOfMonths?: number;
    /** Week start day. `0` is Sunday, `1` is Monday. */
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    /** Show days from adjacent months to fill the calendar grid. */
    showOutsideDays?: boolean;
    /** Disable dates before this day. */
    min?: Date;
    /** Disable dates after this day. */
    max?: Date;
    /** Disable specific dates. */
    disabled?: Date[] | ((date: Date) => boolean);
    /** Maximum selected dates in multiple mode. */
    maxSelected?: number;
    /** Callback fired by `DatePicker.Root` when the selection changes. */
    onChange?: (selected: DatePickerSelected) => void;
    /** Callback fired by `DatePicker.Root` when the displayed month changes. */
    onMonthChange?: (month: Date) => void;
    /** Additional CSS classes. */
    class?: string;
    className?: string;
  };

type MonthData = { month: Date; days: Date[] };

function dateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function parseDate(value: string | null | undefined) {
  if (!value) return undefined;
  const date = parseISO(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function resolveInitialMonth(input: DatePickerInput) {
  const selected = input.selected;
  if (input.month) return startOfMonth(input.month);
  if (input.defaultMonth) return startOfMonth(input.defaultMonth);
  if (selected instanceof Date) return startOfMonth(selected);
  if (Array.isArray(selected) && selected[0]) return startOfMonth(selected[0]);
  if (selected && typeof selected === "object" && "from" in selected && selected.from) {
    return startOfMonth(selected.from);
  }
  return startOfMonth(new Date());
}

function monthsFor(input: DatePickerInput): MonthData[] {
  const firstMonth = resolveInitialMonth(input);
  const count = Math.max(1, input.numberOfMonths ?? DATE_PICKER_DEFAULT_VARIANTS.numberOfMonths);
  const weekStartsOn = input.weekStartsOn ?? DATE_PICKER_DEFAULT_VARIANTS.weekStartsOn;

  return Array.from({ length: count }, (_, index) => {
    const month = addMonths(firstMonth, index);
    return {
      month,
      days: eachDayOfInterval({
        start: startOfWeek(startOfMonth(month), { weekStartsOn }),
        end: endOfWeek(endOfMonth(month), { weekStartsOn }),
      }),
    };
  });
}

function isDisabled(date: Date, input: DatePickerInput) {
  if (input.min && isBefore(date, input.min)) return true;
  if (input.max && isAfter(date, input.max)) return true;
  if (typeof input.disabled === "function") return input.disabled(date);
  return (
    Array.isArray(input.disabled) &&
    input.disabled.some((disabledDate) => isSameDay(date, disabledDate))
  );
}

function isSelected(date: Date, input: DatePickerInput) {
  const { selected, mode = DATE_PICKER_DEFAULT_VARIANTS.mode } = input;
  if (!selected) return false;
  if (mode === "single") return selected instanceof Date && isSameDay(date, selected);
  if (mode === "multiple")
    return Array.isArray(selected) && selected.some((item) => isSameDay(date, item));
  if (typeof selected === "object" && "from" in selected) {
    return Boolean(
      selected.from &&
      (isSameDay(date, selected.from) ||
        (selected.to &&
          (isSameDay(date, selected.to) ||
            isWithinInterval(date, { start: selected.from, end: selected.to })))),
    );
  }
  return false;
}

function isRangeStart(date: Date, input: DatePickerInput) {
  const selected = input.selected;
  return Boolean(
    selected &&
    typeof selected === "object" &&
    "from" in selected &&
    selected.from &&
    isSameDay(date, selected.from),
  );
}

function isRangeEnd(date: Date, input: DatePickerInput) {
  const selected = input.selected;
  return Boolean(
    selected &&
    typeof selected === "object" &&
    "to" in selected &&
    selected.to &&
    isSameDay(date, selected.to),
  );
}

export function datePickerVariants(_input: DatePickerVariantsProps = {}) {
  return cn("select-none rounded-xl bg-areia-background text-areia-default");
}

function weekdayHeader(weekStartsOn: DatePickerInput["weekStartsOn"]) {
  const start = startOfWeek(new Date(2024, 0, 7), { weekStartsOn });
  return Array.from(
    { length: 7 },
    (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index),
  );
}

function renderDay(date: Date, month: Date, input: DatePickerInput) {
  const outside = !isSameMonth(date, month);
  const disabled = isDisabled(date, input) || (!input.showOutsideDays && outside);
  const selected = isSelected(date, input);
  const rangeStart = isRangeStart(date, input);
  const rangeEnd = isRangeEnd(date, input);
  const hasRangeEnd =
    input.selected &&
    typeof input.selected === "object" &&
    !Array.isArray(input.selected) &&
    !(input.selected instanceof Date) &&
    Boolean(input.selected.to);
  const rangeMiddle = input.mode === "range" && selected && !rangeStart && !rangeEnd;
  const today = isSameDay(date, new Date());

  return html`<button
    type="button"
    data-date-picker-day
    data-date="${dateKey(date)}"
    class="${cn(
      "relative flex size-9 items-center justify-center border-0 bg-transparent text-sm outline-none transition-colors",
      "hover:bg-areia-control-hover focus-visible:ring-2 focus-visible:ring-areia-ring",
      !selected && "rounded-md",
      today && "font-semibold ring-1 ring-areia-divider",
      outside && "text-areia-subtle opacity-60",
      selected && "bg-areia-primary text-areia-primary-foreground hover:bg-areia-primary/90",
      input.mode !== "range" && selected && "rounded-md",
      rangeMiddle && "rounded-none",
      rangeStart && (hasRangeEnd ? "rounded-l-md rounded-r-none" : "rounded-md"),
      rangeEnd && "rounded-l-none rounded-r-md",
      disabled && "pointer-events-none cursor-not-allowed opacity-35",
    )}"
    ${raw(toAttrs({ disabled, "aria-pressed": selected ? "true" : undefined }))}
  >
    ${format(date, "d")}
  </button>`;
}

function renderMonth({ month, days }: MonthData, input: DatePickerInput) {
  const weekStartsOn = input.weekStartsOn ?? DATE_PICKER_DEFAULT_VARIANTS.weekStartsOn;
  const weekdays = weekdayHeader(weekStartsOn);

  return html`<section class="flex flex-col gap-3" data-date-picker-month>
    <h3 class="text-center text-sm font-medium text-areia-default">
      ${format(month, "MMMM yyyy")}
    </h3>
    <div class="grid grid-cols-7 gap-1 text-center text-xs text-areia-subtle">
      ${weekdays.map((day) => html`<div>${format(day, "EEEEE")}</div>`)}
    </div>
    <div class="grid grid-cols-7 gap-0 overflow-hidden rounded-md">
      ${days.map((day) => renderDay(day, month, input))}
    </div>
  </section>`;
}

function renderDatePicker(input: DatePickerInput = {}) {
  const {
    class: className,
    className: aliasedClassName,
    defaultMonth: _defaultMonth,
    disabled: _disabled,
    max: _max,
    maxSelected: _maxSelected,
    min: _min,
    mode = DATE_PICKER_DEFAULT_VARIANTS.mode,
    month: _month,
    numberOfMonths = DATE_PICKER_DEFAULT_VARIANTS.numberOfMonths,
    onChange: _onChange,
    onMonthChange: _onMonthChange,
    selected: _selected,
    showOutsideDays = true,
    weekStartsOn = DATE_PICKER_DEFAULT_VARIANTS.weekStartsOn,
    ...props
  } = input;
  const normalizedInput = { ...input, mode, numberOfMonths, showOutsideDays, weekStartsOn };
  const month = resolveInitialMonth(normalizedInput);

  return html`<div
    data-slot="date-picker"
    data-mode="${mode}"
    data-month="${dateKey(month)}"
    data-selected="${serializeSelected(input.selected)}"
    class="${cn(datePickerVariants(), "w-max p-3", className, aliasedClassName)}"
    ${raw(toAttrs(props))}
  >
    <div class="mb-3 flex items-center justify-between gap-2">
      ${Button({
        variant: "ghost",
        size: "sm",
        shape: "square",
        icon: Icon({ icon: ChevronLeft, class: "size-4" }),
        "aria-label": "Previous month",
        "data-date-picker-prev": true,
      })}
      <div class="min-w-0 flex-1 text-center text-sm font-medium text-areia-default">
        ${numberOfMonths > 1
          ? `${format(month, "MMM yyyy")} – ${format(addMonths(month, numberOfMonths - 1), "MMM yyyy")}`
          : format(month, "MMMM yyyy")}
      </div>
      ${Button({
        variant: "ghost",
        size: "sm",
        shape: "square",
        icon: Icon({ icon: ChevronRight, class: "size-4" }),
        "aria-label": "Next month",
        "data-date-picker-next": true,
      })}
    </div>
    <div class="grid gap-4 ${numberOfMonths > 1 ? "sm:grid-cols-2" : ""}">
      ${monthsFor(normalizedInput).map((monthData) => renderMonth(monthData, normalizedInput))}
    </div>
  </div>`;
}

function serializeSelected(selected: DatePickerSelected) {
  if (!selected) return "";
  if (selected instanceof Date) return dateKey(selected);
  if (Array.isArray(selected)) return selected.map(dateKey).join(",");
  return `${selected.from ? dateKey(selected.from) : ""}..${selected.to ? dateKey(selected.to) : ""}`;
}

function selectedFromDataset(root: HTMLElement, mode: DatePickerMode): DatePickerSelected {
  const rawSelected = root.dataset["selected"];
  if (!rawSelected) return mode === "multiple" ? [] : undefined;
  if (mode === "single") return parseDate(rawSelected);
  if (mode === "multiple") return rawSelected.split(",").flatMap((value) => parseDate(value) ?? []);
  const [from, to] = rawSelected.split("..");
  return { from: parseDate(from), to: parseDate(to) };
}

function nextSelected(current: DatePickerSelected, date: Date, input: DatePickerInput) {
  const mode = input.mode ?? DATE_PICKER_DEFAULT_VARIANTS.mode;
  if (mode === "single") return date;
  if (mode === "multiple") {
    const selected = Array.isArray(current) ? current : [];
    if (selected.some((item) => isSameDay(item, date))) {
      return selected.filter((item) => !isSameDay(item, date));
    }
    if (input.maxSelected && selected.length >= input.maxSelected) return selected;
    return [...selected, date];
  }

  const range: DateRange =
    current && typeof current === "object" && !Array.isArray(current) && !(current instanceof Date)
      ? current
      : {};
  if (!range.from || (range.from && range.to)) return { from: date, to: undefined };
  return isBefore(date, range.from)
    ? { from: date, to: range.from }
    : { from: range.from, to: date };
}

function emitChange(root: HTMLElement, selected: DatePickerSelected) {
  root.dataset["selected"] = serializeSelected(selected);
  root.dispatchEvent(
    new CustomEvent("date-picker:change", { bubbles: true, detail: { selected } }),
  );
}

function emitMonthChange(root: HTMLElement, month: Date) {
  root.dataset["month"] = dateKey(month);
  root.dispatchEvent(
    new CustomEvent("date-picker:month-change", { bubbles: true, detail: { month } }),
  );
}

function htmlValue(value: ReturnType<typeof html>) {
  return typeof value === "object" && value !== null && "value" in value
    ? String(value.value)
    : String(value);
}

function syncRoot(root: HTMLElement, input: DatePickerInput) {
  const container = document.createElement("div");
  container.innerHTML = htmlValue(renderDatePicker(input));
  const next = container.firstElementChild as HTMLElement | null;
  if (!next) return;

  root.innerHTML = next.innerHTML;
  root.className = next.className;
  for (const { name } of Array.from(root.attributes)) {
    if (name.startsWith("data-") && !next.hasAttribute(name)) root.removeAttribute(name);
  }
  for (const { name, value } of Array.from(next.attributes)) {
    if (name.startsWith("data-")) root.setAttribute(name, value);
  }
}

export const DatePickerRoot = ilha
  .input<DatePickerInput>()
  .onMount(({ host, input }) => {
    const root = host.matches('[data-slot="date-picker"]')
      ? (host as HTMLElement)
      : host.querySelector<HTMLElement>('[data-slot="date-picker"]');
    if (!root) return;

    let currentInput: DatePickerInput = {
      ...input,
      month: parseDate(root.dataset["month"]) ?? resolveInitialMonth(input),
      selected: selectedFromDataset(root, input.mode ?? DATE_PICKER_DEFAULT_VARIANTS.mode),
    };

    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const currentMonth = currentInput.month ?? resolveInitialMonth(currentInput);
      const previous = target.closest<HTMLElement>("[data-date-picker-prev]");
      const next = target.closest<HTMLElement>("[data-date-picker-next]");
      if (previous || next) {
        const month = addMonths(currentMonth, previous ? -1 : 1);
        currentInput = { ...currentInput, month };
        syncRoot(root, currentInput);
        input.onMonthChange?.(month);
        emitMonthChange(root, month);
        return;
      }

      const day = target.closest<HTMLElement>("[data-date-picker-day]");
      const date = parseDate(day?.dataset["date"]);
      if (!day || !date || day.hasAttribute("disabled")) return;

      const selected = nextSelected(currentInput.selected, date, currentInput);
      currentInput = { ...currentInput, selected };
      syncRoot(root, currentInput);
      input.onChange?.(selected);
      emitChange(root, selected);
    };

    root.addEventListener("click", handleClick);
    return () => root.removeEventListener("click", handleClick);
  })
  .render(({ input }) => renderDatePicker(input));

function DatePickerBase(input: DatePickerInput = {}) {
  return renderDatePicker(input);
}

export const DatePicker = Object.assign(DatePickerBase, {
  Root: DatePickerRoot,
});
