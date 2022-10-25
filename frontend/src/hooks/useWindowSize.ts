import { useLayoutEffect, useState } from "react";

export const useWindowSize = (): number[] => {
  const [size, setSize] = useState<[number, number]>([0, 0]);

  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }

    window.addEventListener("resize", updateSize, { passive: true });
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
};
