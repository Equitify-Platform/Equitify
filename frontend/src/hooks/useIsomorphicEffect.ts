import { useEffect, useLayoutEffect } from "react";

/*
 * If window object don't loaded now we use useLayoutEffect which will be call
 * when DOM will be loaded
 * */
export const useIsomorphicEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
