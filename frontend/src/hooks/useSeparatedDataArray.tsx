import { useMemo } from "react";

import { separateArrayByElCount } from "../utils/helpers";

export function useSeparatedDataArray<T>(array: T[], size: number): T[][] {
  return useMemo<T[][]>(() => {
    return separateArrayByElCount(array, size);
  }, [array, size]);
}
