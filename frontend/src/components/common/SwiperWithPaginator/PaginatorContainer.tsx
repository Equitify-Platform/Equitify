import React, { FC, useEffect } from "react";
import { useSwiper } from "swiper/react";

import { PaginatorContainerPropsType } from "./types";

import { Paginator } from "../Paginator";

export const PaginatorContainer: FC<PaginatorContainerPropsType> = (props) => {
  const swiper = useSwiper();
  const pagesCount = Math.ceil(props.totalCount / props.pageSize);
  useEffect(() => {
    if (props.currentPage > pagesCount) {
      swiper.slideTo(pagesCount - 1);
    }
  }, [props.pageSize]);
  return (
    <Paginator
      {...props}
      type={props.paginatorType}
      currentPage={props.currentPage}
      onPageChange={(pageNumber) => {
        if (swiper) {
          swiper.slideTo(pageNumber - 1);
        }
      }}
    />
  );
};
