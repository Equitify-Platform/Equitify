import React, { FC } from "react";

import styles from "./style.module.scss";

interface SecondaryButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  isBlue: boolean;
  text: string;
  isScalable: boolean;
  children?: JSX.Element | JSX.Element[];
}

const SecondaryButton: FC<SecondaryButtonProps> = ({
  isBlue,
  children,
  text,
  isScalable,
  ...props
}) => {
  const blueButtonStyle = {
    backgroundColor: "#2f5fbb",
  };
  const blueButtonTextStyle = {
    color: "#fff",
  };

  return (
    <button
      className={
        !isScalable ? styles.secondaryButton : styles.scalableSecondaryButton
      }
      style={isBlue ? blueButtonStyle : {}}
      {...props}
    >
      <div className={styles.childrenWrapper}>
        <p style={isBlue ? blueButtonTextStyle : {}}>{text}</p>
        {children}
      </div>
    </button>
  );
};

export default SecondaryButton;
