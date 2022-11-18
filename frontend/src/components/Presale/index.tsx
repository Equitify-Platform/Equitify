import React, { FC, useEffect, useRef } from "react";
import Countdown from "react-countdown";

import styles from "./style.module.scss";

import { IdoStage } from "../../types/IdoStage";
import ClaimCountdown from "../ClaimCountdown";

interface PresaleProps {
  date: Date;
  idoStage: IdoStage;
}

const Presale: FC<PresaleProps> = ({ date, idoStage }) => {
  const clockRef = useRef<Countdown>(null);
  useEffect(() => {
    if (clockRef.current) clockRef.current.start();
  }, [date, clockRef.current]);
  return (
    <div className={styles.presaleWrapper}>
      <h4>SALE STARTS IN</h4>
      <Countdown
        ref={clockRef}
        date={date}
        now={() => Date.now()}
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
  );
};

export default Presale;
