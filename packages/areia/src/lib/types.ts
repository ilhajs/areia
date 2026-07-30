import type { JSX } from "ilha/jsx-runtime";
import type { RawHtml } from "ilha";

type AllowRawHtml<T> = T extends string ? string | RawHtml : T;

type ElementDataProps<T extends HTMLElement> = {
  [K in keyof T as T[K] extends (...args: infer _Args) => infer _Result ? never : K]?: AllowRawHtml<
    T[K]
  >;
};

/**
 * Element-specific DOM props plus Ilha's typed lowercase native events,
 * modifiers, ARIA/data attributes, and RawHtml-compatible common attributes.
 * Component-specific bind accessors remain declared by each controller-backed
 * component so their value types stay exact.
 */
export type HTMLElementProps<T extends HTMLElement> = ElementDataProps<T> &
  Omit<JSX.IntrinsicElementProps<T>, "bind:this" | `on${string}`>;

export type HTMLElementPropsWithEvents<T extends HTMLElement> = ElementDataProps<T> &
  Omit<JSX.IntrinsicElementProps<T>, "bind:this">;
