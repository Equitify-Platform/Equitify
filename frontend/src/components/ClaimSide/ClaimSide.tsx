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
      clockRef.current.start();
    }
  }, [clockRef, date]);

  const nextStageFn = useCallback<() => void>(() => {
    setIdoStage(nextStage[idoStage]);
  }, [idoStage, setIdoStage]);

  return (
    <div className={styles.claimSide}>
      <h2>{text[idoStage]}</h2>
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
          />
        )}
      />
      <h4>Total raised: ${totalRaised.toFixed(4)}</h4>
      <h4>Soft cap: ${softCap.toFixed(4)}</h4>
      <h4>Hard cap: ${hardCap.toFixed(4)}</h4>
      <h4>
        1 {symbol} = {price.toFixed(4)} NEAR
      </h4>
    </div>
  );
};
