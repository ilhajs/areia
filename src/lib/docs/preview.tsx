import type { Island } from "ilha";
import { useEffect } from "react";

export const Preview = ({ component }: { component: Island }) => {
  useEffect(() => {
    if (!component) return;
    const root = document.querySelector("[data-ilha=Component]");
    if (!root) return;
    component.mount(root);
  }, []);
  return <div data-ilha="Component"></div>;
};
