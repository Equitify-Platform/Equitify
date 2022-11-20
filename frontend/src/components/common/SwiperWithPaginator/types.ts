import React from "react";
import { SwiperProps } from "swiper/react/swiper-react";

import { IPaginatorType } from "../Paginator";

export interface PaginatorSwiperProps extends SwiperProps {
  paginatorType: IPaginatorType;
  children: React.ReactNode;
  posLength: number;
  pageSize?: number;
}

export interface PaginatorContainerPropsType {
  paginatorType: IPaginatorType;
  totalCount: number;
  pageSize: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}
