import React, { FC } from "react";

import styles from "./style.module.scss";

interface IDOCardProps {
  projectSignatures: string;
  saleStartTime: string;
  projectDescription: string;
  price: string;
  tokenName: string;
}

export const IDOCard: FC<IDOCardProps> = ({
  tokenName,
  price,
  projectDescription,
  projectSignatures,
  saleStartTime,
}) => {
  return (
    <div className={styles.idoCard}>
      <h2>{projectSignatures}</h2>
      <p>Price: {price} NEAR</p>
      <p>Token: $ {tokenName}</p>
      <p>{projectDescription}</p>
      <p>Starts in: {saleStartTime}</p>
    </div>
  );
};

export default IDOCard;
