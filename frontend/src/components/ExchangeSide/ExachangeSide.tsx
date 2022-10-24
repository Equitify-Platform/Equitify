import React, { Dispatch, SetStateAction } from "react";

import styles from "./style.module.scss";

interface ExchangeSideProps {
  name: string;
  symbol: string;
  balance: string;
  address: string;
  account: string;
  id: string;
  /*setIsLoading: Dispatch<SetStateAction<boolean>>;
  updateData: () => Promise<void>;
  options: Option[];
  onChange: (id: string) => void | Promise<void>;*/
  isClaim: boolean;
  price: number;
}

function ExachangeSide({
  symbol,
  name,
  balance,
  id,
  account,
  address,
  /*setIsLoading,
  updateData,
  options,
  onChange,*/
  isClaim,
  price,
}: ExchangeSideProps) {
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
}

export default ExachangeSide;
