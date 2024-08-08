// hooks/useDrag.ts
import { useRef, useEffect } from "react";

export const useDrag = () => {
  const dragRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = dragRef.current;
    if (!element) return;

    const handleMouseDown = (e: MouseEvent) => {
      const offsetX = e.clientX - element.getBoundingClientRect().left;
      const offsetY = e.clientY - element.getBoundingClientRect().top;

      const handleMouseMove = (e: MouseEvent) => {
        element.style.left = `${e.clientX - offsetX}px`;
        element.style.top = `${e.clientY - offsetY}px`;
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", () => {
        document.removeEventListener("mousemove", handleMouseMove);
      }, { once: true });
    };

    element.addEventListener("mousedown", handleMouseDown);
    return () => {
      element.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return { dragRef };
};
