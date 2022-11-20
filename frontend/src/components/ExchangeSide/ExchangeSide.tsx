import React, { Dispatch, FC, SetStateAction } from "react";

import styles from "./style.module.scss";

import { IdoStage } from "../../types/IdoStage";
import ExchangeCard from "../ExchangeCard";

interface ExchangeSideProps {
  idoStage: IdoStage;
  symbol: string;
  balance: string;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  projectName: string;
  ftAddress: string;
}

export const ExchangeSide: FC<ExchangeSideProps> = ({
  idoStage,
  symbol,
  balance,
  setIsLoading,
  projectName,
  ftAddress,
}) => {
  return (
    <div className={styles.exchangeSide}>
      <ExchangeCard
        ftAddress={ftAddress}
        idoStage={idoStage}
        setIsLoading={setIsLoading}
        balance={balance}
        symbol={symbol}
        projectName={projectName}
      />

      {/*{isMobile && (*/}
      {/*  <SwiperWithPaginator paginatorType="dot" posLength={2} pageSize={1}>*/}
      {/*    <SwiperSlide>*/}
      {/*      <div className={styles.projectInfo}>*/}
      {/*        <img className={styles.projectImg} src={IdoLogoExample} alt="" />*/}
      {/*        <h4>{projectName}</h4>*/}
      {/*        <p>{projectDescription}</p>*/}
      {/*      </div>*/}
      {/*    </SwiperSlide>*/}
      {/*    <SwiperSlide>*/}
      {/*      <ExchangeCard*/}
      {/*        idoStage={idoStage}*/}
      {/*        setIsLoading={setIsLoading}*/}
      {/*        balance={balance}*/}
      {/*        symbol={symbol}*/}
      {/*        projectName={projectName}*/}
      {/*      />*/}
      {/*    </SwiperSlide>*/}
      {/*  </SwiperWithPaginator>*/}
      {/*)}*/}
    </div>
  );
};
