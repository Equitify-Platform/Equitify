import React, { FC, useCallback } from "react";

import styles from "./style.module.scss";

interface ShelterInputProps {
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
  left?: boolean;
  leftLabel: string;
  rightLabel: string;
  onChange: (e: number) => void | Promise<void>;
}

export const BuyInput: FC<ShelterInputProps> = ({
  value,
  setValue,
  left,
  leftLabel,
  rightLabel,
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
    <div className={styles.wrapper}>
      <div className={styles.inputWrapper}>
        <div className={styles.label}>
          <div className={styles.left}>{leftLabel}</div>
          <div className={styles.right}>{rightLabel}</div>
        </div>
        <div>
          <input
            className={styles.input}
            type="number"
            value={value}
            onChange={handleInput}
          />
        </div>
      </div>
    </div>
  );
};
