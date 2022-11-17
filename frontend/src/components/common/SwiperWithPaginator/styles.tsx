import styled from "styled-components";
import { Swiper } from "swiper/react";

export const SwiperWrapper = styled(Swiper)`
  &.home-slider {
    max-width: 100%;
    display: flex;
    flex-direction: column;
    gap: 38px;
    align-items: center;

    .swiper-button-prev {
      display: none;
    }

    .swiper-button-next {
      display: none;
    }

    .swiper-slide {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .swiper-wrapper {
      position: relative;
      align-items: start;
      min-height: unset !important;

      @media screen and (max-width: 576px) {
        align-items: start !important;
      }
    }

    .swiper-pagination {
      z-index: 0;
    }

    .swiper-pagination-bullet {
      display: none;
    }
  }
`;
