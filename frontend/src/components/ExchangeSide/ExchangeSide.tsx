import React, { FC } from "react";

import styles from "./style.module.scss";

import { IdoStage } from "../../types/IdoStage";

interface ExchangeSideProps {
  idoStage: IdoStage;
}

export const ExchangeSide: FC<ExchangeSideProps> = () => {
  return (
    <div className={styles.exchangeSide}>
      <h2>Exchange side</h2>
      <div className={styles.balanceSection}>
        <div className={styles.balanceSectionTop}>
          <h3>Total balance</h3>
          <p>0.00</p>
        </div>
        <div>
          <p>Available tokens:</p>
          <p>0.00</p>
        </div>
        <div>
          <p>Total claimed:</p>
          <p>0.00</p>
        </div>
        <div>
          <p>Locked balance:</p>
          <p>0.00</p>
        </div>
      </div>
      <button>Purchase/Claim</button>
    </div>
  );
};
