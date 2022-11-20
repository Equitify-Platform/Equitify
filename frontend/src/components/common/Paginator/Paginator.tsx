import React, { FC } from "react";

import { PaginatorDot } from "./Dotted/PaginatorDot";
import { usePagination } from "./hooks";
import { PageDesktop } from "./Numeric/PageDesktop";
import {
  PaginatorArrow,
  PaginatorContainer,
  PaginatorPagesContainer,
} from "./styles";
import { PaginatorPropsType } from "./types";

import LeftArrow from "../../../assets/icons/shortArrows/left-short-arrow.svg";
import RightArrow from "../../../assets/icons/shortArrows/right-short-arrow.svg";

export const Paginator: FC<PaginatorPropsType> = ({
  type,
  pageSize,
  totalCount,
  currentPage,
  onPageChange,
}) => {
  const pagesCount = Math.ceil(totalCount / pageSize);
  const pages = usePagination({
    totalCount,
    pageSize,
    currentPage,
  });
  return (
    <>
      <PaginatorContainer>
        <PaginatorArrow
          src={LeftArrow}
          disabled={currentPage === 1}
          onClick={() => {
            if (currentPage === 1) return;
            onPageChange(currentPage - 1);
          }}
        />
        <PaginatorPagesContainer>
          {type === "num" &&
            pages &&
            pages.map((pageNumber, index) => (
              <PageDesktop
                key={index}
                currentPage={currentPage}
                pageNumber={pageNumber}
                onPageClick={() => {
                  onPageChange(+pageNumber);
                }}
              />
            ))}
          {type === "dot" &&
            pages &&
            pages.map((pageNumber) => (
              <PaginatorDot
                key={pageNumber}
                active={currentPage === pageNumber}
                onClick={() => {
                  onPageChange(+pageNumber);
                }}
              />
            ))}
        </PaginatorPagesContainer>
        <PaginatorArrow
          src={RightArrow}
          disabled={currentPage === pagesCount}
          onClick={() => {
            if (currentPage === pagesCount) return;
            onPageChange(currentPage + 1);
          }}
        />
      </PaginatorContainer>
    </>
  );
};
