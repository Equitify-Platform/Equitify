import React, { FC, useState } from "react";
import SwiperCore, { EffectFlip, Navigation, Pagination } from "swiper";
import "swiper/css";

import { SWIPER_ITEMS_LIMIT } from "./constants";
import { PaginatorContainer } from "./PaginatorContainer";
import { SwiperWrapper } from "./styles";
import { PaginatorSwiperProps } from "./types";

import useMatchBreakpoints from "../../../hooks/useMatchBreakpoints";

SwiperCore.use([EffectFlip, Navigation, Pagination]);

export const SwiperWithPaginator: FC<PaginatorSwiperProps> = ({
  children,
  posLength,
  paginatorType,
  ...props
}) => {
  const { isMobile } = useMatchBreakpoints();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const withPaginator = Math.ceil(posLength / SWIPER_ITEMS_LIMIT) > 1;
  return (
    <SwiperWrapper
      className="home-slider"
      spaceBetween={30}
      navigation={true}
      loop={false}
      pagination={!isMobile ? { clickable: true } : false}
      onActiveIndexChange={(swiper) => {
        setCurrentPage(swiper.activeIndex + 1);
      }}
      {...props}
    >
      {children}
      {withPaginator && (
        <PaginatorContainer
          paginatorType={paginatorType}
          totalCount={posLength}
          pageSize={SWIPER_ITEMS_LIMIT}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}
    </SwiperWrapper>
  );
};
