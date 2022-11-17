import React, { FC } from "react";

import styles from "./style.module.scss";

interface ModalWindowProps {
  children: JSX.Element[] | JSX.Element;
  className?: string;
}

const ModalWindow: FC<ModalWindowProps> = ({ children, className }) => {
  return (
    <div className={styles.modalWrapper}>
      <div className={className ? className : styles.modalContainer}>
        {children}
      </div>
    </div>
  );
};

export default ModalWindow;
