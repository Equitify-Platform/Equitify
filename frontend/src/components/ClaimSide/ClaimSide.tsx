import React, {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";
import Countdown from "react-countdown";

import styles from "./style.module.scss";

import { IdoStage } from "../../types/IdoStage";
import ClaimCountdown from "../ClaimCountdown";

interface ClaimSideProps {
  idoStage: IdoStage;
  setIdoStage: Dispatch<SetStateAction<IdoStage>>;
  date: Date;
  totalRaised: number;
  hardCap: number;
  softCap: number;
  price: number;
  symbol: string;
}

const text: Record<IdoStage, string> = {
  [IdoStage.PRESALE]: "SALE STARTS IN",
  [IdoStage.SALE]: "SALE ENDS IN",
  [IdoStage.CLAIM]: "CLAIM STAGE",
};

const nextStage: Record<IdoStage, IdoStage> = {
  [IdoStage.PRESALE]: IdoStage.SALE,
  [IdoStage.SALE]: IdoStage.CLAIM,
  [IdoStage.CLAIM]: IdoStage.CLAIM,
};

export const ClaimSide: FC<ClaimSideProps> = ({
  idoStage,
  setIdoStage,
  date,
  totalRaised,
  hardCap,
  softCap,
  symbol,
  price,
}) => {
  const clockRef = useRef<Countdown>(null);

  useEffect(() => {
    if (clockRef?.current) {
      clockRef.current.stop();
      clockRef.current.start();
    }
  }, [clockRef, date, idoStage]);

  const nextStageFn = useCallback<() => void>(() => {
    setIdoStage(nextStage[idoStage]);
  }, [idoStage, setIdoStage]);

  return (
    <div className={styles.claimSide}>
      <h4>{text[idoStage]}</h4>
      {idoStage !== IdoStage.CLAIM && (
        <div className={styles.countdown}>
          <Countdown
            ref={clockRef}
            date={date}
            onComplete={nextStageFn}
            renderer={({ formatted: f }) => (
              <ClaimCountdown
                days={f.days}
                hours={f.hours}
                minutes={f.minutes}
                seconds={f.seconds}
                idoStage={idoStage}
              />
            )}
          />
        </div>
      )}
      <div className={styles.saleStats}>
        <div className={styles.saleStatsField}>
          <p className={styles.fieldTitle}>Total raised:</p>
          <p>{totalRaised.toFixed(4)} NEAR</p>
        </div>
        <div className={styles.saleStatsField}>
          <p className={styles.fieldTitle}>Soft cap:</p>
          <p>{softCap.toFixed(4)} NEAR</p>
        </div>
        <div className={styles.saleStatsField}>
          <p className={styles.fieldTitle}>Hard cap:</p>
          <p>{hardCap.toFixed(4)} NEAR</p>
        </div>
      </div>
      <p className={styles.price}>
        1 NEAR = {price.toFixed(4)} {symbol}
      </p>
    </div>
  );
};
