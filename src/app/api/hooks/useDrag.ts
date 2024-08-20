import { useRef, useEffect } from "react";

export const useDrag = () => {
  const dragRef = useRef<HTMLDivElement | null>(null);
  const position = useRef({ x: 0, y: 0 });
  const startPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const element = dragRef.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        position.current = {
          x: e.clientX - startPosition.current.x,
          y: e.clientY - startPosition.current.y,
        };

        element.style.transform = `translate(${position.current.x}px, ${position.current.y}px)`;
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();

      startPosition.current = {
        x: e.clientX - position.current.x,
        y: e.clientY - position.current.y,
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp, { once: true });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };

    element.addEventListener("mousedown", handleMouseDown);

    return () => {
      element.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return { dragRef };
};
