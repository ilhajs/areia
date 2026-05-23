export type HTMLElementProps<T extends HTMLElement> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]?: T[K];
};
