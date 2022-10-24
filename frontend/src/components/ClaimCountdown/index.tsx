import React, { FC } from "react";

import styles from "./style.module.scss";

interface CountdownItemProps {
  value: string;
  label: string;
}

const CountdownItem: FC<CountdownItemProps> = ({ value, label }) => {
  return (
    <div className={styles.item}>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
    </div>
  );
};

interface IDOCountdownProps {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

const ClaimCountdown: FC<IDOCountdownProps> = ({
  days,
  hours,
  minutes,
  seconds,
}) => {
  return (
    <div className={styles.wrapper}>
      <CountdownItem value={days} label="days" />
      <CountdownItem value={hours} label="hrs" />
      <CountdownItem value={minutes} label="min" />
      <CountdownItem value={seconds} label="sec" />
    </div>
  );
};

export default ClaimCountdown;
