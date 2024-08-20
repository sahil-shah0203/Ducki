import { useRef, useEffect } from "react";

export const useDrag = () => {
  const dragRef = useRef<HTMLDivElement | null>(null);
  const position = useRef({ x: 0, y: 0 });
  const startPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const element = dragRef.current;
    if (!element) return;

    const handleMouseDown = (e: MouseEvent) => {
      // Prevent text selection
      e.preventDefault();

      startPosition.current = {
        x: e.clientX - position.current.x,
        y: e.clientY - position.current.y,
      };

      const handleMouseMove = (e: MouseEvent) => {
        position.current = {
          x: e.clientX - startPosition.current.x,
          y: e.clientY - startPosition.current.y,
        };

        // Apply the transform for smoother animation
        element.style.transform = `translate(${position.current.x}px, ${position.current.y}px)`;
      };

      document.addEventListener("mousemove", handleMouseMove);

      document.addEventListener(
        "mouseup",
        () => {
          document.removeEventListener("mousemove", handleMouseMove);
        },
        { once: true }
      );
    };

    element.addEventListener("mousedown", handleMouseDown);

    return () => {
      element.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return { dragRef };
};
