import React, { FC } from "react";

import { getStyles } from "./styles";

import { useWindowSize } from "../../hooks/useWindowSize";
import { IdoStage } from "../../types/IdoStage";

interface CountdownItemProps {
  value: string;
  label: string;
  idoStage: IdoStage;
}

const CountdownItem: FC<CountdownItemProps> = ({ value, label, idoStage }) => {
  const [width] = useWindowSize();
  const styles = getStyles(idoStage, width);
  return (
    <div style={styles.item}>
      <div style={styles.value}>{value}</div>
      <div style={styles.label}>{label}</div>
    </div>
  );
};

interface IDOCountdownProps {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  idoStage: IdoStage;
}

const ClaimCountdown: FC<IDOCountdownProps> = ({
  days,
  hours,
  minutes,
  seconds,
  idoStage,
}) => {
  const [width] = useWindowSize();
  const styles = getStyles(idoStage, width);
  return (
    <>
      <div style={styles.wrapper}>
        <CountdownItem idoStage={idoStage} value={days} label="days" />
        <CountdownItem idoStage={idoStage} value={hours} label="hours" />
        <CountdownItem idoStage={idoStage} value={minutes} label="min" />
        <CountdownItem idoStage={idoStage} value={seconds} label="sec" />
      </div>
    </>
  );
};

export default ClaimCountdown;
