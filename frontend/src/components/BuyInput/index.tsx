import React, { FC, useCallback } from "react";

import styles from "./style.module.scss";

import NearIcon from "../../assets/icons/NearIcon.svg";

interface BuyInputProps {
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
  label: string;
  symbol: string;

  onChange: (e: number) => void | Promise<void>;
}

export const BuyInput: FC<BuyInputProps> = ({
  value,
  setValue,
  label,
  symbol,
  onChange,
}) => {
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = +e.target.value;
      setValue(input);
      onChange(input);
    },
    [setValue, onChange]
  );

  return (
    <>
      <p className={styles.label}>{label}</p>
      <div className={styles.inputContainer}>
        <div className={styles.symbolContainer}>
          {symbol === "NEAR" && <img src={NearIcon} alt="" />}
          <p>{symbol}</p>
        </div>
        <input
          className={styles.input}
          type="number"
          value={value}
          onChange={handleInput}
        />
      </div>
    </>
  );
};
