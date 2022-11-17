import React, { FC } from "react";

import { PaginatorPageDot } from "../styles";
import { PaginatorDotPageProps } from "../types";

export const PaginatorDot: FC<PaginatorDotPageProps> = ({
  active,
  onClick,
}) => {
  return (
    <>
      <PaginatorPageDot
        active={active}
        onClick={() => {
          if (active) return;
          onClick();
        }}
      />
    </>
  );
};
