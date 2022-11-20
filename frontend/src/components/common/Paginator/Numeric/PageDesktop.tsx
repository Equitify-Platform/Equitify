import React, { FC } from "react";

import { PaginatorPage } from "./PaginatorPage";

import { DOTS } from "../constant";
import { PaginatorPageText } from "../styles";
import { IPageDesktop } from "../types";

export const PageDesktop: FC<IPageDesktop> = ({
  pageNumber,
  currentPage,
  onPageClick,
}) => {
  if (pageNumber === DOTS) {
    return <PaginatorPageText>{pageNumber}</PaginatorPageText>;
  }

  return (
    <PaginatorPage
      key={pageNumber}
      active={pageNumber === currentPage}
      onClick={onPageClick}
    >
      {pageNumber}
    </PaginatorPage>
  );
};
