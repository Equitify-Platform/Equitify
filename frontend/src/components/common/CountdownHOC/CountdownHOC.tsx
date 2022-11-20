import React, { FC, useEffect, useRef } from "react";
import Countdown, { CountdownProps } from "react-countdown";

export const CountdownHOC: FC<CountdownProps> = (props) => {
  const clockRef = useRef<Countdown>(null);
  useEffect(() => {
    if (clockRef.current) clockRef.current.start();
  }, [props.date, clockRef.current]);

  return <Countdown ref={clockRef} {...props} />;
};
