import React, { FC } from "react";

import { PaginatorPageText } from "../styles";
import { PaginatorPageProps } from "../types";

export const PaginatorPage: FC<PaginatorPageProps> = ({
  active,
  children,
  onClick,
}) => {
  return (
    <>
      <PaginatorPageText
        active={active}
        onClick={() => {
          if (active) return;
          onClick();
        }}
      >
        {children}
      </PaginatorPageText>
    </>
  );
};
