import React, { Dispatch, SetStateAction, useEffect, useRef } from "react";
import Countdown from "react-countdown";

import styles from "./style.module.scss";

import ClaimCountdown from "../ClaimCountdown";

interface ClaimSideProps {
  timestamp: number;
  totalRaised: number;
  hardcap: number;
  price: number;
  symbol: string;
  isClaim: boolean;
  setIsClaim: Dispatch<SetStateAction<boolean>>;
}

function ClaimSide({
  timestamp,
  totalRaised,
  hardcap,
  symbol,
  price,
  isClaim,
  setIsClaim,
}: ClaimSideProps) {
  const TIMESTAMP = Date.parse(new Date().toUTCString());
  const clockRef = useRef<any>();

  useEffect(() => {
    if (clockRef?.current) {
      clockRef.current.start();
    }
  }, [clockRef, TIMESTAMP, timestamp]);
  return (
    <div className={styles.claimSide}>
      <h2>Claim side</h2>
      <Countdown
        ref={clockRef}
        date={TIMESTAMP + timestamp}
        renderer={({ formatted: f, total }) => {
          if (total === 0 && !isClaim) {
            setIsClaim(true);
            if (clockRef?.current) {
              clockRef.current.stop();
            }
          }
          return (
            <ClaimCountdown
              days={f.days}
              hours={f.hours}
              minutes={f.minutes}
              seconds={f.seconds}
            />
          );
        }}
      />
    </div>
  );
}

export default ClaimSide;
