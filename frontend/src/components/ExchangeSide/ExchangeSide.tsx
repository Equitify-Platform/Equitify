import React, { Dispatch, FC, SetStateAction } from "react";

import styles from "./style.module.scss";

import IdoLogoExample from "../../assets/images/idoImgExample.png";
import { useWindowSize } from "../../hooks/useWindowSize";
import { IdoStage } from "../../types/IdoStage";
import ExchangeCard from "../ExchangeCard";

interface ExchangeSideProps {
  idoStage: IdoStage;
  symbol: string;
  balance: string;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  projectName: string;
  projectDescription: string;
}

export const ExchangeSide: FC<ExchangeSideProps> = ({
  idoStage,
  symbol,
  balance,
  setIsLoading,
  projectName,
  projectDescription,
}) => {
  const [width] = useWindowSize();
  return (
    <div className={styles.exchangeSide}>
      {width > 576 && (
        <div className={styles.projectInfo}>
          <img className={styles.projectImg} src={IdoLogoExample} alt="" />
          <h4>{projectName}</h4>
          <p>{projectDescription}</p>
        </div>
      )}

      <ExchangeCard
        idoStage={idoStage}
        setIsLoading={setIsLoading}
        balance={balance}
        symbol={symbol}
        projectName={projectName}
      />
    </div>
  );
};
